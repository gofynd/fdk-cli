import CommandError from './CommandError';
import Logger from './Logger';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { ALLOWD_ENV } from '../helper/constants';
import open from 'open';
import express from 'express';
var cors = require('cors');
const port = 7071;
import chalk from 'chalk';
import ThemeService from './api/services/theme.service';
import { getLocalBaseUrl } from '../helper/serve.utils';

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
            Auth.stopSever();
            if (Auth.isOrganizationChange)
                Logger.info('Organization changed successfully');
            else Logger.info('User logged in successfully');
            res.status(200).json({ message: 'success' });
        } catch (err) {
            console.log(err);
        }
    });

    return { app };
};

export const startServer = async () => {
    if (Auth.server) return Auth.server;

    const { app } = await getApp();
    const serverIn = require('http').createServer(app);
    Auth.server = serverIn.listen(port, (err) => {
        if (err) console.log(err);
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
        Logger.info(
            chalk.green(
                'Current env: ',
                ConfigStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE),
            ),
        );
        const isLoggedIn = await Auth.isAlreadyLoggedIn();
        await startServer();
        if (isLoggedIn) {
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
                    ConfigStore.clear();
                    ConfigStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, currentEnv);
                    Logger.info(`User logged out successfully`);
                }
            });
        } catch (error) {
            throw new CommandError(error.message);
        }
    }
    public static getUserInfo() {
        try {
            const { current_user: user } = ConfigStore.get(
                CONFIG_KEYS.AUTH_TOKEN,
            );
            const organization_id = ConfigStore.get(CONFIG_KEYS.ORGANIZATION);
            const activeEmail =
                user.emails.find((e) => e.active && e.primary)?.email ||
                'Not primary email set';
            Logger.info(`Name: ${user.first_name} ${user.last_name}`);
            Logger.info(`Email: ${activeEmail}`);
            Logger.info(`Current organization: ${organization_id}`);
        } catch (error) {
            throw new CommandError(error.message);
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
