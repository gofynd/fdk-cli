import { startTunnel } from "untun";
import chalk from 'chalk';
import boxen from 'boxen';
import urljoin from 'url-join';
import inquirer from 'inquirer';

import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';
import ExtensionLaunchURL from './ExtensionLaunchURL';
import ExtensionService from './api/services/extension.service';
import {
    getPartnerAccessToken,
    Object,
    validateEmpty,
} from '../helper/extension_utils';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicTunnelURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            // Debug(`Untun(Cloudflare Quick Tunnel package) version: ${untun.meta.version}`);

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

            // start tunnel
            let spinner = new Spinner('Starting tunnel');
            try {
                spinner.start();
                extension.publicTunnelURL =
                    await extension.startTunnel();
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(
                    ErrorCodes.NGROK_CONNECTION_ISSUE.message,
                    ErrorCodes.NGROK_CONNECTION_ISSUE.code,
                );
            }

            // update launch url on partners panel
            await ExtensionLaunchURL.updateLaunchURL(
                extension.options.apiKey,
                partner_access_token || options.accessToken,
                extension.publicTunnelURL,
            );

            // get preview URL
            const previewURL = extension.getPreviewURL();

            Logger.info(
                boxen(
                    chalk.bold.black(
                        `TUNNEL URL: ${extension.publicTunnelURL}\nPREVIEW URL: ${previewURL}`,
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
            Logger.info(
                chalk.yellowBright(
                    `You haven't created any development account in "${this.organizationInfo?.name}" organization.`,
                ),
            );

            Logger.info(
                chalk.yellowBright(
                    `Please create a development account from ${
                        getPlatformUrls().partners
                    } and try again`,
                ),
            );

            throw new CommandError(
                ErrorCodes.NO_DEVELOPMENT_COMPANY.message,
                ErrorCodes.NO_DEVELOPMENT_COMPANY.code,
            );
        }

        return await this.promptDevelopmentCompany(choices);
    }

    private async startTunnel() {
        Debug(`Starting tunnel on port ${this.options.port}`);
        const tunnel = await startTunnel({
            protocol: 'http',
            port: this.options.port,
        });
        return await tunnel.getURL();
    }

    private async promptExtensionApiKey(): Promise<string> {
        let extension_api_key: string;
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
        return extension_api_key;
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
}
