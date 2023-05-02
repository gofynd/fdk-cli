import CommandError from './CommandError';
import Logger from './Logger';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { ALLOWD_ENV } from '../helper/constants'
import open from 'open';
import express from 'express';
var cors = require('cors')
const app = express();
const port = 7071
export default class Auth {
    constructor() { }
    public static async login() {
        const isLoggedIn = await Auth.isAlreadyLoggedIn();
        const server = await Auth.startServer();

        app.post('/token', async (req, res) => {
            ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, req.body.auth_token);
            ConfigStore.set(CONFIG_KEYS.ORGANIZATION, req.body.organization);
            res.status(200).json({ 'message': 'sucess' })
            await Auth.stopSever(server);
            if (isOrganizationChange)
                Logger.info('Organization changed successfully');
            else
                Logger.info('User logged in successfully');
            return;
        })
        let isOrganizationChange;
        if (isLoggedIn) {
            const questions = [
                {
                    type: 'list',
                    name: 'confirmChangeOrg',
                    message: 'You are already logged In. Do you wish to change the organization?',
                    choices: ['Yes', 'No'],
                },
            ];
            await inquirer.prompt(questions).then(async answers => {
                if (answers.confirmChangeOrg === 'No') {
                    isOrganizationChange = false;
                    await Auth.stopSever(server);
                    return;
                }
                else {
                    isOrganizationChange = true;
                    ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
                }
            });
        }
        const env = ConfigStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
        try {
            if (!isLoggedIn)
                await open(`${ALLOWD_ENV[env]}/?fdk-cli=true&callback=http://localhost:${port}`);
            else
                await open(`${ALLOWD_ENV[env]}/organizations?fdk-cli=true&callback=http://localhosts:${port}`);
        }
        catch (error) {
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
            await inquirer.prompt(questions).then(answers => {
                if (answers.confirmLogout === 'Yes') {
                    ConfigStore.clear();
                    Logger.info(`User logged out successfully`);
                }
            });
        } catch (error) {
            throw new CommandError(error.message);
        }
    }
    public static getUserInfo() {
        try {
            const { current_user: user } = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
            const activeEmail =
                user.emails.find(e => e.active && e.primary)?.email || 'Not primary email set';
            Logger.info(`Name: ${user.first_name} ${user.last_name}`);
            Logger.info(`Email: ${activeEmail}`);
        } catch (error) {
            throw new CommandError(error.message);
        }
    }
    private static isAlreadyLoggedIn = async () => {
        const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
        if (auth_token && auth_token.access_token)
            return true;
        else
            return false;
    }
    private static startServer = async () => {
        app.use(cors({ origin: ALLOWD_ENV }))
        app.use(express.json());
        const server = app.listen(port, () => {
        })
        return server;
    }
    private static stopSever = async (server) => {
        server.close(() => {
        })
    }
}
