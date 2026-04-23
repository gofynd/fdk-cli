import CommandError from './CommandError';
import Logger from './Logger';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import open from 'open';
import express from 'express';
var cors = require('cors');
import {
    getRandomFreePort
} from '../helper/extension_utils';
import { getLocalBaseUrl } from '../helper/serve.utils';
import Debug from './Debug';
import Env from './Env';

const SERVER_TIMER = 1000 * 60 * 2; // 2 min
import { OutputFormatter, successBox } from '../helper/formatter';
import OrganizationService from './api/services/organization.service';
import { getOrganizationDisplayName } from '../helper/utils';
import ExtensionContext from './ExtensionContext';
import ApiClient from './api/ApiClient';
import * as semver from 'semver';

const packageJSON = require('../../package.json');

async function checkTokenExpired(auth_token) {
    const { expiry_time } = auth_token;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > expiry_time) {
        return true;
    } else {
        return false;
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getApp = async () => {
    const app = express();
    let isLoading = false;

    app.use(cors());
    app.use(express.json());

    app.post('/token', async (req, res) => {
        try {
            Debug(req);
            if (isLoading) {
                return res.status(429).json({ message: 'Another request is in progress. Please try again later.' });
            }
            isLoading = true;

            if (Auth.wantToChangeOrganization) {
                ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
                clearExtensionContext();
            }
            const expiryTimestamp =
                Math.floor(Date.now() / 1000) + req.body.auth_token.expires_in;
            req.body.auth_token.expiry_time = expiryTimestamp;
            if (Auth.newDomainToUpdate) {
                if (Auth.newDomainToUpdate === 'api.fynd.com') {
                    Env.setEnv(Auth.newDomainToUpdate);
                }
                else {
                    await Env.setNewEnvs(Auth.newDomainToUpdate);
                }
            }
            ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, req.body.auth_token);
            ConfigStore.set(CONFIG_KEYS.ORGANIZATION, req.body.organization);
            const organization_detail =
                await OrganizationService.getOrganizationDetails();
            ConfigStore.set(
                CONFIG_KEYS.ORGANIZATION_DETAIL,
                organization_detail.data,
            );
            Auth.stopSever();
            Logger.info(
                `Logged in successfully in organization ${getOrganizationDisplayName()}`,
            );
            res.status(200).json({ message: 'success' });
        } catch (err) {
            Debug(err);
            Auth.stopSever();
            res.status(500).json({ message: 'failed' });
        }
        finally {
            isLoading = false;
        }
    });

    return { app };
};

function startTimer() {
    Debug("Server timer starts")
    Auth.timer_id = setTimeout(() => {
        Auth.stopSever(() => {
            console.log(chalk.red(`Timeout: Please run ${chalk.blue('fdk login')} command again.`));
        })
    }, SERVER_TIMER)
}

function resetTimer() {
    if (Auth.timer_id) {
        Debug("Server timer stoped")
        clearTimeout(Auth.timer_id)
        Auth.timer_id = null;
    }
}

function clearExtensionContext() {
    const extensionContext = new ExtensionContext();
    extensionContext.deleteAll();
}

export const startServer = async (port: number) => {
    if (Auth.server) return Auth.server;

    const { app } = await getApp();
    const serverIn = require('http').createServer(app);

    // handle errors thrown while start listening
    serverIn.on('error', (error) => {
        Debug(error);
        if (error.code === 'EADDRINUSE') {
            console.error(chalk.red(`Port ${port} is already in use.`));
        } else {
            console.error(chalk.red('An unexpected error occurred:'), error);
        }
    });

    Auth.server = serverIn.listen(port);

    // resolve promise only if server starts listening
    // we will open partner panel only if server is listening
    return new Promise(resolve => {
        serverIn.on('listening', () => {
            Debug(`Server started listening on ${port}`);
            resolve(Auth.server);
        });
    }).then(server => {
        // once server start listening, start server timer
        startTimer();
        return server
    })
};

export default class Auth {
    static server = null;
    static timer_id;
    static wantToChangeOrganization = false;
    static newDomainToUpdate = null;
    constructor() { }

    private static async getAuthFlowConfig(env: string) {
        try {
            const url = `https://${env}/service/panel/authentication/v1.0/oauth/client-config`;
            const response = await ApiClient.get(url, {
                params: { client_id: 'fdk-cli' },
                headers: {
                    'Content-Type': 'application/json',
                    'x-fp-cli': `${packageJSON.version}`,
                },
            });
            return response.data || {};
        } catch (error) {
            return { auth_mode: 'legacy' };
        }
    }

    private static shouldUseDeviceFlow(config: { auth_mode?: string; min_cli_version?: string }) {
        if ((config?.auth_mode || '').toLowerCase() !== 'device_code') {
            return false;
        }
        const minVersion = config?.min_cli_version;
        if (!minVersion) return true;
        return semver.gte(semver.coerce(packageJSON.version) || packageJSON.version, semver.coerce(minVersion) || minVersion);
    }

    private static async runDeviceLogin(env: string, options: any) {
        const authBase = `https://${env}/service/panel/authentication/v1.0`;
        const response = await ApiClient.post(`${authBase}/oauth/device_authorization`, {
            headers: {
                'Content-Type': 'application/json',
                'x-fp-cli': `${packageJSON.version}`,
            },
            data: {
                client_id: 'fdk-cli',
                scope: ['organization/*'],
                requested_host: env,
                requested_region: options.region?.trim(),
            },
        });
        const {
            device_code,
            user_code,
            verification_uri_complete,
            interval = 5,
            expires_in = 600,
        } = response.data;

        const verificationUrl = new URL(verification_uri_complete);
        if (!verificationUrl.searchParams.has('user_code')) {
            verificationUrl.searchParams.set('user_code', user_code);
        }
        if (!verificationUrl.searchParams.has('device_flow')) {
            verificationUrl.searchParams.set('device_flow', 'true');
        }
        const verificationLink = verificationUrl.toString();

        Logger.info(`User verification code: ${chalk.cyan(user_code)}`);
        try {
            await open(verificationLink);
            console.log(`Opened link to start the auth process: ${OutputFormatter.link(verificationLink)}`);
        } catch (err) {
            console.log(`Open this link to continue login: ${OutputFormatter.link(verificationLink)}`);
        }

        const maxAttempts = Math.ceil(expires_in / interval);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(interval * 1000);
            try {
                const tokenRes = await ApiClient.post(`${authBase}/oauth/token`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-fp-cli': `${packageJSON.version}`,
                    },
                    data: {
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                        client_id: 'fdk-cli',
                        device_code,
                    },
                });
                const authToken = tokenRes.data.auth_token;
                const organization = tokenRes.data.organization;
                if (Auth.wantToChangeOrganization) {
                    ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
                    clearExtensionContext();
                }
                const expiryTimestamp =
                    Math.floor(Date.now() / 1000) + authToken.expires_in;
                authToken.expiry_time = expiryTimestamp;
                if (Auth.newDomainToUpdate) {
                    if (Auth.newDomainToUpdate === 'api.fynd.com') {
                        Env.setEnv(Auth.newDomainToUpdate);
                    }
                    else {
                        await Env.setNewEnvs(Auth.newDomainToUpdate);
                    }
                }
                ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, authToken);
                ConfigStore.set(CONFIG_KEYS.ORGANIZATION, organization);
                const organization_detail =
                    await OrganizationService.getOrganizationDetails();
                ConfigStore.set(
                    CONFIG_KEYS.ORGANIZATION_DETAIL,
                    organization_detail.data,
                );
                Logger.info(`Logged in successfully in organization ${getOrganizationDisplayName()}`);
                return;
            } catch (error) {
                const oauthError = error?.response?.data?.error;
                if (oauthError === 'authorization_pending') continue;
                if (oauthError === 'slow_down') {
                    await sleep(2000);
                    continue;
                }
                if (oauthError === 'access_denied') {
                    throw new CommandError('Login denied in browser.', '403');
                }
                if (oauthError === 'expired_token') {
                    throw new CommandError('Device code expired. Please run `fdk login` again.', '400');
                }
                throw error;
            }
        }
        throw new CommandError('Login timed out. Please run `fdk login` again.', '408');
    }

    public static async login(options) {

        let env: string;
        const port = await getRandomFreePort([]);
        if (options.host) {
            env = await Env.verifyAndSanitizeEnvValue(options.host);
        }
        else {
            env = 'api.fynd.com';
        }

        let current_env = Env.getEnvValue();

        if (current_env !== env) {
            // update new domain after login
            Auth.newDomainToUpdate = env;

            // Logout user from current domain
            Auth.updateConfigStoreForLogout();
        }

        const isLoggedIn = await Auth.isAlreadyLoggedIn();
        if (isLoggedIn) {
            Logger.info(
                `Current logged in organization: ${getOrganizationDisplayName()}`,
            );
            const questions = [
                {
                    type: 'list',
                    name: 'confirmChangeOrg',
                    message:
                        'You are already logged In. Do you wish to change the organization?',
                    choices: ['Yes', 'No'],
                },
            ];
            await inquirer.prompt(questions).then(async (answers) => {
                if (answers.confirmChangeOrg === 'No') {
                    Auth.wantToChangeOrganization = false;
                    return;
                } else {
                    Auth.wantToChangeOrganization = true;
                }
            });
            if (!Auth.wantToChangeOrganization) {
                return;
            }
        }
        try {
            const authFlowConfig = await Auth.getAuthFlowConfig(env);
            if (Auth.shouldUseDeviceFlow(authFlowConfig)) {
                await Auth.runDeviceLogin(env, options);
                return;
            }
            await startServer(port);
            let domain = null;
            let partnerDomain = env.replace('api', 'partners');
            domain = `https://${partnerDomain}`;
            const region = options.region?.trim();
            const callbackUrl = `${getLocalBaseUrl()}:${port}`;
            const queryParams = new URLSearchParams({ 'fdk-cli': 'true', callback: callbackUrl });
            if (region) queryParams.set('region', region);
            const authUrl = `${domain}/organizations/?${queryParams.toString()}`;
            try {
                if (Auth.wantToChangeOrganization || !isLoggedIn) {
                    await open(authUrl);
                    console.log(
                        `Open link on browser: ${OutputFormatter.link(authUrl)}`,
                    );
                }
            } catch (err) {
                console.log(
                    `Open link on browser: ${OutputFormatter.link(authUrl)}`,
                );
            }
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    public static async logout() {
        try {
            const questions = [
                {
                    type: 'list',
                    name: 'confirmLogout',
                    message: 'Are you sure you want to logout',
                    choices: ['Yes', 'No'],
                },
            ];
            await inquirer.prompt(questions).then((answers) => {
                if (answers.confirmLogout === 'Yes') {
                    Auth.updateConfigStoreForLogout();
                    Logger.info(`User logged out successfully`);
                }
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    private static updateConfigStoreForLogout() {
        const currentEnv = ConfigStore.get(
            CONFIG_KEYS.CURRENT_ENV_VALUE,
        );
        const extras = ConfigStore.get(CONFIG_KEYS.EXTRAS);
        ConfigStore.clear();
        ConfigStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, currentEnv);
        ConfigStore.set(CONFIG_KEYS.EXTRAS, extras);
    }

    public static getUserInfo() {
        try {
            const { current_user: user } = ConfigStore.get(
                CONFIG_KEYS.AUTH_TOKEN,
            );
            const activeEmail =
                user.emails.find((e) => e.active && e.primary)?.email ||
                'Primary email missing';
            const text = `Name: ${user.first_name} ${user.last_name
                }\nEmail: ${activeEmail}\nOrganization: ${getOrganizationDisplayName()}`;
            Logger.info(successBox({ text }));
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    private static isAlreadyLoggedIn = async () => {
        const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
        if (auth_token && auth_token.access_token) {
            const isTokenExpired = await checkTokenExpired(auth_token);
            if (!isTokenExpired) return true;
            else return false;
        } else return false;
    };
    static stopSever = async (cb = null) => {
        resetTimer();
        Auth.server?.close?.(() => {
            Debug("Server closed");
            cb?.();
        });
    };
}
