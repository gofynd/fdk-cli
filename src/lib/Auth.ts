import CommandError from './CommandError';
import Logger from './Logger';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { ALLOWD_ENV } from '../helper/constants'
import open from 'open';
import express from 'express';
var cors = require('cors')
const app = require('https-localhost')(getLocalBaseUrl());
const port = 7071
import chalk from 'chalk';
function getLocalBaseUrl() {
    return "https://localhost";
}
export default class Auth {
    constructor() { }
    public static async login() {
        console.log(chalk.green("Current env: ",ConfigStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)))
        const isLoggedIn = await Auth.isAlreadyLoggedIn();
        app.use(cors());
        app.use(express.json());
        const certs = await app.getCerts();
	    const server = require('https').createServer(certs, app);
        await Auth.startServer(server);

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
                await open(`${ALLOWD_ENV[env]}/?fdk-cli=true&callback=${(getLocalBaseUrl())}:${port}`);
            else
                await open(`${ALLOWD_ENV[env]}/organizations?fdk-cli=true&callback=${getLocalBaseUrl()}:${port}`);
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
    private static startServer = async (server) => {
        await new Promise((resolve, reject) => {
            server.listen(port, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
    }
    private static stopSever = async (server) => {
        server.close(() => {
        })
    }
}
