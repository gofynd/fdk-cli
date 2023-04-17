import CommandError from './CommandError';
import Logger from './Logger';
import AuthService from './api/services/auth.service';
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
        app.post('/token', async (req, res) => {
            ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, req.body.auth_token);
            res.status(200).json({ 'message': 'sucess' })
            await Auth.stopSever(server);
            if (isOrganizationChange)
                Logger.info('Organization changed successfully');
            else
                Logger.info('User logged in successfully');
            return;
        })

        try {
            if (!isLoggedIn)
                await open(`http://local.fyndx1.de:8088/?fdk-cli=true&callback=http://localhost:${port}`);
            else
                await open(`http://local.fyndx1.de:8088/organizations?fdk-cli=true&callback=http://localhost:${port}`);
        }
        catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    // public static async loginUserWithEmail(email: string, password: string) {
    //     try {
    //         const requestData = {
    //             username: email,
    //             password,
    //             'g-recaptcha-response': '_skip_',
    //         };
    //         const { data, headers } = await AuthService.loginUserWithEmailAndPassword(requestData);
    //         delete data.user.roles;
    //         const cookie = headers['set-cookie'][0];
    //         ConfigStore.set(CONFIG_KEYS.COOKIE, cookie);
    //         ConfigStore.set(CONFIG_KEYS.USER, data.user);
    //         Logger.info('User logged in successfully');
    //     } catch (error) {
    //         throw new CommandError(error.message, error.code);
    //     }
    // }
    // public static async loginInWithMobile(mobile: string) {
    //     try {
    //         let requestData: any = {
    //             mobile,
    //             country_code: '91',
    //             'g-recaptcha-response': '_skip_',
    //         };

    //         const { data: otpResponse } = await AuthService.sendMobileOtp(requestData);
    //         const questions = [
    //             {
    //                 type: 'text',
    //                 name: 'otp',
    //                 message: 'Enter OTP: ',
    //             },
    //         ];
    //         await inquirer.prompt(questions).then(async answers => {
    //             if (answers.otp.length !== 6) throw new CommandError('Invalid OTP');
    //             requestData.otp = answers.otp;
    //             requestData.request_id = otpResponse.request_id;
    //             const { data, headers } = await AuthService.verifyMobileOtp(requestData);
    //             delete data.user.roles;
    //             const cookie = headers['set-cookie'][0];
    //             ConfigStore.set(CONFIG_KEYS.COOKIE, cookie);
    //             ConfigStore.set(CONFIG_KEYS.USER, data.user);
    //             Logger.info('User logged in successfully');
    //         });
    //     } catch (error) {
    //         throw new CommandError(error.message, error.code);
    //     }
    // }
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
