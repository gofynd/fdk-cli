import CommandError from './CommandError';
import Logger from './Logger';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import open from 'open';
import express from 'express';
var cors = require('cors');
const port = 7071;
import ThemeService from './api/services/theme.service';
import { getLocalBaseUrl } from '../helper/serve.utils';
import { successBox } from '../helper/formatter';
import OrganizationService from './api/services/organization.service';
import { getOrganizationDisplayName } from '../helper/utils';
import Debug from './Debug';

async function checkTokenExpired(auth_token) {
    const { expiry_time } = auth_token;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > expiry_time) {
        return true;
    } else {
        return false;
    }
}

export const getApp = async () => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.post('/token', async (req, res) => {
        try {
            if (Auth.isOrganizationChange)
                ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
            const expiryTimestamp =
                Math.floor(Date.now() / 1000) + req.body.auth_token.expires_in;
            req.body.auth_token.expiry_time = expiryTimestamp;
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
    });

    return { app };
};

export const startServer = async () => {
    if (Auth.server) return Auth.server;

    const { app } = await getApp();
    const serverIn = require('http').createServer(app);
    Auth.server = serverIn.listen(port, (err) => {
        if (err) Debug(err);
    });

    return Auth.server;
};

async function checkVersionCompatibility() {
    const response = await ThemeService.checkCompatibleVersion();
}

export default class Auth {
    static server = null;
    static isOrganizationChange = false;
    constructor() {}
    public static async login() {
        await checkVersionCompatibility();
        const isLoggedIn = await Auth.isAlreadyLoggedIn();
        await startServer();
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
                    Auth.isOrganizationChange = false;
                    await Auth.stopSever();
                    return;
                } else {
                    Auth.isOrganizationChange = true;
                }
            });
        }
        const env = ConfigStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        try {
            let domain = null;
            let partnerDomain = env.replace('api', 'partners');
            domain = `https://${partnerDomain}`;
            try {
                if (Auth.isOrganizationChange || !isLoggedIn) {
                    await open(
                        `${domain}/organizations/?fdk-cli=true&callback=${encodeURIComponent(
                            `${getLocalBaseUrl()}:${port}`,
                        )}`,
                    );
                }
            } catch (err) {
                console.log(
                    `Open link on browser: ${domain}/organizations/?fdk-cli=true&callback=${encodeURIComponent(
                        `${getLocalBaseUrl()}:${port}`,
                    )}`,
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
                    const currentEnv = ConfigStore.get(
                        CONFIG_KEYS.CURRENT_ENV_VALUE,
                    );
                    const extras = ConfigStore.get(CONFIG_KEYS.EXTRAS);
                    ConfigStore.clear();
                    ConfigStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, currentEnv);
                    ConfigStore.set(CONFIG_KEYS.EXTRAS, extras);
                    Logger.info(`User logged out successfully`);
                }
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    public static getUserInfo() {
        try {
            const { current_user: user } = ConfigStore.get(
                CONFIG_KEYS.AUTH_TOKEN,
            );
            const activeEmail =
                user.emails.find((e) => e.active && e.primary)?.email ||
                'Primary email missing';
            const text = `Name: ${user.first_name} ${
                user.last_name
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
    static stopSever = async () => {
        Auth.server.close(() => {});
    };
}
