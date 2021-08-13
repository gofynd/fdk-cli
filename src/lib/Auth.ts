import CommandError from './CommandError';
import Logger from './Logger';
import AuthService from './api/services/auth.service';
import inquirer from 'inquirer';
import configStore, { CONFIG_KEYS } from './Config';

export default class Auth {
    constructor() {}
    public static async loginUserWithEmail(email: string, password: string) {
        try {
            const requestData = {
                username: email,
                password,
                'g-recaptcha-response': '_skip_',
            };
            const { data, headers } = await AuthService.loginUserWithEmailAndPassword(requestData);
            delete data.user.roles;
            const cookie = headers['set-cookie'][0];
            configStore.set(CONFIG_KEYS.COOKIE, cookie);
            configStore.set(CONFIG_KEYS.USER, data.user);
            Logger.success('User logged in successfully');
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    public static async loginInWithMobile(mobile: string) {
        try {
            let requestData: any = {
                mobile,
                country_code: '91',
                'g-recaptcha-response': '_skip_',
            };

            const { data: otpResponse } = await AuthService.sendMobileOtp(requestData);
            const questions = [
                {
                    type: 'text',
                    name: 'otp',
                    message: 'Enter OTP: ',
                },
            ];
            await inquirer.prompt(questions).then(async answers => {
                if (answers.otp.length !== 6) throw new CommandError('Invalid OTP');
                requestData.otp = answers.otp;
                requestData.request_id = otpResponse.request_id;
                const { data, headers } = await AuthService.verifyMobileOtp(requestData);
                delete data.user.roles;
                const cookie = headers['set-cookie'][0];
                configStore.set(CONFIG_KEYS.COOKIE, cookie);
                configStore.set(CONFIG_KEYS.USER, data.user);
                Logger.success('User logged in successfully');
            });
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
            await inquirer.prompt(questions).then(answers => {
                if (answers.confirmLogout === 'Yes') {
                    configStore.clear();
                    Logger.success(`User logged out successfully`);
                }
            });
        } catch (error) {
            throw new CommandError(error.message);
        }
    }
    public static getUserInfo() {
        try {
            const user = configStore.get(CONFIG_KEYS.USER);
            const activeEmail =
                user.emails.find(e => e.active && e.primary)?.email || 'Not primary email set';
            Logger.success(`Name: ${user.first_name} ${user.last_name}`);
            Logger.success(`Email: ${activeEmail}`);
        } catch (error) {
            throw new CommandError(error.message);
        }
    }
}
