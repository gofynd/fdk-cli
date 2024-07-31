import { spawn } from 'node:child_process'
import ngrok from '@ngrok/ngrok';
import { startTunnel } from 'untun';
import chalk from 'chalk';
import urljoin from 'url-join';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import detectPort from 'detect-port'
import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';
import configStore, { CONFIG_KEYS } from './Config';
import ExtensionLaunchURL from './ExtensionLaunchURL';
import {
    getPartnerAccessToken,
    Object,
    validateEmpty,
    getCompanyId,
} from '../helper/extension_utils';
import { readFile } from '../helper/file.utils';
import { successBox } from '../helper/formatter';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';

const packageJson = require('./../../package.json');
const ngrokPackageVersion = packageJson.dependencies['@ngrok/ngrok'];

export let interval;

const SUPPORTED_TOOL = ['ngrok', 'cloudflared'];

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicTunnelURL: string;
    publicNgrokURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            Debug(`Ngrok version: ${ngrokPackageVersion}`);
            if (
                !!options.useTunnel &&
                !SUPPORTED_TOOL.includes(options.useTunnel)
            ) {
                throw new CommandError(
                    'Tunneling tool specified is invalid',
                    ErrorCodes.INVALID_INPUT.code,
                );
            }

            if (options.useTunnel !== 'ngrok' && !!options.updateAuthtoken) {
                throw new CommandError(
                    '--update-authtoken option is only allowed when using ngrok as a tunneling tool',
                    ErrorCodes.INVALID_INPUT.code,
                );
            }

            // initialize class instance
            const extension = new ExtensionPreviewURL();
            extension.options = options;

            // get the companyId
            if (!extension.options.companyId) {
                extension.options.companyId = await getCompanyId();
            }

            // get the extension api key
            if (!extension.options.apiKey) {
                extension.options.apiKey =
                    await extension.promptExtensionApiKey();
            }

            const fdkConfigFiles = extension.findAllFilePathFromCurrentDirWithName('fdk.config.json');
            
            // Install dependencies
            for(let fdkConfigFilePath of fdkConfigFiles){
                const projectDir = path.dirname(fdkConfigFilePath);
                const projectConfig = require(fdkConfigFilePath);

                if(projectConfig['install']){
                    await extension.runShellCommand(projectConfig['install'], projectDir, projectConfig['project'])
                }
            }

            const frontend_port = await extension.getRandomFreePort([]);
            const backend_port = await extension.getRandomFreePort([frontend_port]);
            console.log("Ports: ", frontend_port, " ", backend_port)

            extension.options.port = frontend_port;

            if (options.useTunnel === 'ngrok') {
                // start tunnel
                let authtoken = await extension.getNgrokAuthtoken();
                let spinner = new Spinner(`Starting Ngrok tunnel on port ${extension.options.port}`);
                try {
                    spinner.start();
                    const ngrokListener: ngrok.Listener =
                        await extension.startNgrokTunnel(authtoken);
                    extension.publicNgrokURL = ngrokListener.url();
                    interval = setInterval(() => { }, 900);
                    process.on('SIGINT', async () => {
                        Logger.info('Stopping Ngrok tunnel...');
                        clearInterval(interval);
                        await ngrok.disconnect();
                        process.exit();
                    });
                    configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, authtoken);
                    spinner.succeed();
                } catch (error) {
                    let errorCode = ErrorCodes.NGROK_GENERAL_ISSUE.code;
                    spinner.fail();
                    if (error.errorCode == 'ERR_NGROK_105') {
                        errorCode = ErrorCodes.NGROK_AUTH_ISSUE.code;
                        throw new CommandError(
                            error.message ||
                            ErrorCodes.NGROK_AUTH_ISSUE.message,
                            errorCode,
                        );
                    } else if (error.errorCode == 'ERR_NGROK_108') {
                        errorCode =
                            ErrorCodes.NGROK_MULTIPLE_SESSION_ISSUE.code;
                        throw new CommandError(
                            error.message ||
                            ErrorCodes.NGROK_MULTIPLE_SESSION_ISSUE.message,
                            errorCode,
                        );
                    }
                    Debug(error);
                    throw new Error(ErrorCodes.NGROK_GENERAL_ISSUE.message);
                }
            } else {
                // start Cloudflared tunnel
                try {
                    extension.publicTunnelURL =
                        await extension.startCloudflareTunnel();
                } catch (error) {
                    Debug(error)
                    throw new CommandError(
                        ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.message,
                        ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.code,
                    );
                }
            }
            // update launch url on partners panel
            await ExtensionLaunchURL.updateLaunchURL(
                extension.options.apiKey,
                partner_access_token || options.accessToken,
                extension.publicNgrokURL || extension.publicTunnelURL,
            );

            // Start Dev servers
            for(let fdkConfigFilePath of fdkConfigFiles){
                const projectDir = path.dirname(fdkConfigFilePath);
                const projectConfig = require(fdkConfigFilePath);

                if(projectConfig['dev']){
                    console.log("Running dev server from: ", projectDir)
                    extension.runShellCommand(projectConfig['dev'], projectDir, projectConfig['project'], { FRONTEND_PORT: frontend_port, BACKEND_PORT: backend_port })
                }
            }

            const warningMsg = chalk.yellow(
                'Before preview extension, please restart your extension server',
            );

            // get preview URL
            const previewURL = extension.getPreviewURL();
            Debug(
                `TUNNEL URL: ${
                    extension.publicTunnelURL || extension.publicNgrokURL
                }`,
            );
            Logger.info(
                successBox({
                    text: `${warningMsg}\n\nTUNNEL URL: ${
                        extension.publicTunnelURL || extension.publicNgrokURL
                        }\nExtension preview URL: ${previewURL}`,
                }),
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

    private async startNgrokTunnel(authtoken: string) {
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

    private async getNgrokAuthtoken() {
        if (
            this.options.updateAuthtoken ||
            !configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN)
        ) {
            let authtoken = await this.promptNgrokAuthtoken();
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
        Logger.info(chalk.green('Ngrok tunnel Reconnected'));
    }

    private async closedTunnelHandler() {
        Logger.info(chalk.red('Ngrok tunnel disconnected'));
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

    private async startCloudflareTunnel() {
        Debug(`Starting tunnel on port ${this.options.port}`);
        // INSTALL CURRENT LATEST VERSION
        process.env.CLOUDFLARED_VERSION = '2024.6.1';
        // THIS WILL STOP CLOUDFLARED TO AUTO UPDATE
        process.env.NO_AUTOUPDATE = 'true';
        // ALWAYS USE HTTP2 PROTOCOL
        process.env.TUNNEL_TRANSPORT_PROTOCOL = 'http2';

        const tunnel = await startTunnel({
            protocol: 'http',
            port: this.options.port,
            acceptCloudflareNotice: true,
        });
        return await tunnel.getURL();
    }

    private async promptExtensionApiKey(): Promise<string> {
        let extension_api_key: string;
        const apiKeyFromEnv = this.getExtensionAPIKeyFromENV();
        if (apiKeyFromEnv) {
            Logger.info(
                `Using Extension API key from environment : ${apiKeyFromEnv}`,
            );
            extension_api_key = apiKeyFromEnv;
        } else {
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

    public getExtensionAPIKeyFromENV() {
        let java_env_file_path = path.join(
            'src',
            'main',
            'resources',
            'application.yml',
        );

        if (fs.existsSync('./.env')) {
            let envData = readFile('./.env');
            const keyMatchRegex = new RegExp(
                `^\\s*EXTENSION_API_KEY\\s*=\\s*(?:'([^']*)'|"([^"]*)"|([^'"\s]+))`,
                'm',
            );
            const match = keyMatchRegex.exec(envData);
            if (match) {
                const value = (match[1] || match[2] || match[3]).trim();
                return value === '' ? null : value;
            }
        } else if (fs.existsSync(java_env_file_path)) {
            let envData = readFile(java_env_file_path);
            const keyMatchRegex = new RegExp(
                `^\\s*api_key\\s*:\\s*(?:'([^']*)'|"([^"]*)"|([^'"\s]+))`,
                'm',
            );
            const match = keyMatchRegex.exec(envData);
            if (match) {
                const value = (match[1] || match[2] || match[3]).trim();
                return value === '' ? null : value;
            }
        } else {
            return null;
        }
        return null;
    }

    public findAllFilePathFromCurrentDirWithName(fileName: string) {
        const files = [];
        const dir = process.cwd();

        const search = (dir : string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    search(fullPath);
                } else if (entry.name === fileName) {
                    files.push(fullPath);
                }
            }
        };

        search(dir);
        return files;
    }

    public runShellCommand(command: string, path: string, commandName: string, extraEnv: Record<string, string> = {}){
        return new Promise(async (resolve, reject) => {
            const child = spawn(command, [], {
                cwd: path,
                shell: true,
                env: {
                    ...process.env,
                    ... extraEnv
                }
            });
            child.stdout.on('data', (data) => {
                console.log(`[${commandName}]`, data.toString());
                Debug(data.toString());
            });
            child.stderr.on('data', (data) => {
                console.log(`[${commandName}]`, data.toString());
                Debug(data.toString());
            });
            child.on('exit', (code) => {
                if (!code) {
                    return resolve(code);
                }
                reject({ message: `${commandName} failed` });
            });
        });
    }

    public async getRandomFreePort(excluded_port = [], times = undefined){

        if(!times){
            return await this.getRandomFreePort([], 1);
        }

        const randomPort = Math.floor(Math.random() * (10000)) + 40000;
        if(excluded_port.includes(randomPort)){
            console.log("Got from excluded_port")
            return await this.getRandomFreePort();
        }
        const availablePort = await detectPort(randomPort);

        // If the randomly selected port is free, return it. Otherwise, retry until a free port is found.
        if (availablePort === randomPort) {
            return randomPort;
        } else {
            return await this.getRandomFreePort();
        }
    }
}
