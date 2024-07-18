import ngrok from '@ngrok/ngrok';
import chalk from 'chalk';
import boxen from 'boxen';
import urljoin from 'url-join';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';

import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';
import configStore, { CONFIG_KEYS } from './Config';
import ExtensionLaunchURL from './ExtensionLaunchURL';
import ExtensionService from './api/services/extension.service';
import {
    getPartnerAccessToken,
    Object,
    validateEmpty,
} from '../helper/extension_utils';
import { readFile } from '../helper/file.utils';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import { getOrganizationDisplayName } from '../helper/utils';

const packageJson = require('./../../package.json');
const ngrokPackageVersion = packageJson.dependencies['@ngrok/ngrok'];

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicNgrokURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            Debug(`Ngrok version: ${ngrokPackageVersion}`);

            // initialize class instance
            const extension = new ExtensionPreviewURL();
            extension.options = options;

            // get the companyId
            if (!extension.options.companyId) {
                extension.options.companyId = await extension.getCompanyId();
            }

            // get the extension api key
            if (!extension.options.apiKey) {
                extension.options.apiKey =
                    await extension.promptExtensionApiKey();
            }

            // start Ngrok tunnel
            let authtoken = await extension.getAuthtoken();
            let spinner = new Spinner('Starting Ngrok tunnel');
            try {
                spinner.start();
                const ngrokListener : ngrok.Listener = await extension.startTunnel(authtoken);
                extension.publicNgrokURL = ngrokListener.url();
                setInterval(() => {}, 10000);
                process.on('SIGINT', async () => {
                    Logger.info('Stopping Ngrok tunnel...');
                    await ngrok.disconnect();
                    process.exit();
                  });
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                configStore.delete(CONFIG_KEYS.NGROK_AUTHTOKEN);
                let errorMessage = null;
                if(error.message || error.errorCode){
                    errorMessage = error.errorCode + " - " + error.code + "\n" + error.message;
                }
                throw new CommandError(
                    errorMessage || ErrorCodes.NGROK_CONNECTION_ISSUE.message,
                    ErrorCodes.NGROK_CONNECTION_ISSUE.code,
                );
            }

            // update launch url on partners panel
            await ExtensionLaunchURL.updateLaunchURL(
                extension.options.apiKey,
                partner_access_token || options.accessToken,
                extension.publicNgrokURL,
            );

            // get preview URL
            const previewURL = extension.getPreviewURL();

            Logger.info(
                boxen(
                    chalk.bold.black(
                        `NGROK URL: ${extension.publicNgrokURL}\nPREVIEW URL: ${previewURL}`,
                    ),
                    {
                        borderStyle: {
                            topLeft: ' ',
                            topRight: ' ',
                            bottomLeft: ' ',
                            bottomRight: ' ',
                            horizontal: ' ',
                            vertical: ' ',
                        },
                        padding: 2,
                        backgroundColor: 'greenBright',
                        textAlignment: 'center',
                    },
                ),
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    private getPreviewURL() {
        let baseURL = getPlatformUrls().platform;
        return urljoin(
            baseURL,
            `/company/${this.options.companyId}`,
            `/extensions/${this.options.apiKey}`,
        );
    }

    private async getCompanyId() {
        let developmentCompanyData =
            await ExtensionService.getDevelopmentAccounts(1, 9999);

        let choices = [];
        developmentCompanyData.items.map((data) => {
            choices.push({ name: data.company.name, value: data.company.uid });
        });

        if (choices.length === 0) {
            const organizationId = configStore.get(CONFIG_KEYS.ORGANIZATION)
            const createDevelopmentCompanyFormURL = organizationId ? urljoin(getPlatformUrls().partners, 'organizations', organizationId , 'accounts') : getPlatformUrls().partners;
            Logger.info(
                chalk.yellowBright(
                    `You don't have development account under organization ${getOrganizationDisplayName()}, You can create development account from ${createDevelopmentCompanyFormURL} and try again.`
                ),
            );

            throw new CommandError(
                ErrorCodes.NO_DEVELOPMENT_COMPANY.message,
                ErrorCodes.NO_DEVELOPMENT_COMPANY.code,
            );
        }

        return await this.promptDevelopmentCompany(choices);
    }

    private async startTunnel(authtoken: string) {
        Debug(`Starting Ngrok tunnel on port ${this.options.port}`);
        return await ngrok.connect({
            proto: 'http',
            addr: this.options.port,
            authtoken: authtoken,
            onStatusChange: async (status) => {
                if (status === 'connected') {
                    await this.connectedTunnelHandler();
                }

                if (status === 'closed') {
                    await this.closedTunnelHandler();
                }
            },
        });
    }

    private async getAuthtoken() {
        if (
            !configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN) ||
            this.options.updateAuthtoken
        ) {
            let authtoken = await this.promptNgrokAuthtoken();
            configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, authtoken);
            return authtoken;
        } else {
            return configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN);
        }
    }

    private async connectedTunnelHandler() {
        if (this.firstTunnelConnection) {
            this.firstTunnelConnection = false;
            return;
        }
        Logger.info(chalk.gray('Ngrok tunnel Reconnected'));
    }

    private async closedTunnelHandler() {
        Logger.info(chalk.red('Ngrok tunnel Closed'));
    }

    private async promptExtensionApiKey(): Promise<string> {
        let extension_api_key: string;
        const apiKeyFromEnv = this.getExtensionAPIKeyFromENV();
        if(apiKeyFromEnv){
            Logger.info(`Using Extension API key from environment : ${apiKeyFromEnv}`);
            extension_api_key = apiKeyFromEnv
        }
        else{
            try {
                let answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'extension_api_key',
                        message: 'Enter Extension API Key :',
                        validate: validateEmpty,
                    },
                ]);
                extension_api_key = answers.extension_api_key;
            } catch (error) {
                throw new CommandError(error.message);
            }
        }
        return extension_api_key;
    }

    public getExtensionAPIKeyFromENV(){
        let java_env_file_path = path.join(
            'src',
            'main',
            'resources',
            'application.yml',
        );

        if (fs.existsSync('./.env')) {
            let envData = readFile('./.env');
            const keyMatchRegex = new RegExp(`^\\s*EXTENSION_API_KEY\\s*=\\s*(?:'([^']*)'|"([^"]*)"|([^'"\s]+))`, 'm')
            const match = keyMatchRegex.exec(envData);
            if(match){
                const value = (match[1] || match[2] || match[3]).trim();
                return value === '' ? null : value;
            }
        } else if (fs.existsSync(java_env_file_path)) {
            let envData = readFile(java_env_file_path);
            const keyMatchRegex = new RegExp(`^\\s*api_key\\s*:\\s*(?:'([^']*)'|"([^"]*)"|([^'"\s]+))`, 'm')
            const match = keyMatchRegex.exec(envData);
            if(match){
                const value = (match[1] || match[2] || match[3]).trim();
                return value === '' ? null : value;
            }
        } else {
            return null;
        }
        return null;
    }

    private async promptDevelopmentCompany(choices): Promise<number> {
        let companyId: number;
        try {
            let answers = await inquirer.prompt([
                {
                    type: 'list',
                    choices: choices,
                    name: 'company_id',
                    message: 'Development Company :',
                    pageSize: 6,
                    validate: validateEmpty,
                },
            ]);
            companyId = answers.company_id;
        } catch (error) {
            throw new CommandError(error.message);
        }
        return companyId;
    }

    private async promptNgrokAuthtoken(): Promise<string> {
        let authtoken: string;
        try {
            Logger.info(
                chalk.grey(
                    `Visit https://dashboard.ngrok.com/get-started/your-authtoken to get Authtoken`,
                ),
            );
            let answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'ngrok_authtoken',
                    message: 'Enter Ngrok Authtoken :',
                    validate: validateEmpty,
                },
            ]);
            authtoken = answers.ngrok_authtoken;
        } catch (error) {
            throw new CommandError(error.message);
        }
        return authtoken;
    }
}
