import { tunnel as startTunnel } from 'cloudflared';
import urljoin from 'url-join';
import execa from 'execa';
import path from 'path';
const serverProcesses = [];
import fs from 'fs';
import detectPort from 'detect-port'
import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';
import ExtensionLaunchURL from './ExtensionLaunchURL';
import {
    getPartnerAccessToken,
    Object,
    getCompanyId,
    getExtensionList,
} from '../helper/extension_utils';
import { successBox } from '../helper/formatter';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import * as CONSTANTS from './../helper/constants';
import Logger from './Logger';
import ExtensionService from './api/services/extension.service';
import yaml from 'js-yaml';
export let interval;

interface ServerOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicTunnelURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;
    private extensionConfigFilePath: string = undefined;

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            // Validate Options
            // Validate autoUpdate flag
            if(!['true', 'false'].includes(options.autoUpdate)){
                throw new CommandError(
                    `Auto Update must be a boolean value. Allowed values: true, false`, 
                    ErrorCodes.INVALID_INPUT.code,
                );
            }
            
            let partner_access_token = getPartnerAccessToken();

            // initialize class instance
            const extension = new ExtensionPreviewURL();
            extension.options = options;

            // Read and validate fdk.ext config files
            const projectConfigs = extension.readAndValidateFDKExtConfigFiles();

            // Read extension config file
            const extensionConfig = extension.readExtensionConfig();

            // get the companyId
            if (!extension.options.companyId) {
                if(!extensionConfig[CONSTANTS.EXTENSION_CONFIG.DEVELOPMENT_COMPANY]){
                    extension.options.companyId = await getCompanyId("Select the development company you'd like to use to run the extension: ?");
                    extension.updateExtensionConfig(extensionConfig, CONSTANTS.EXTENSION_CONFIG.DEVELOPMENT_COMPANY, extension.options.companyId);
                    Debug(`Using user selected development company ${extension.options.companyId}`)
                }
                else{
                    extension.options.companyId = extensionConfig[CONSTANTS.EXTENSION_CONFIG.DEVELOPMENT_COMPANY];
                    Logger.info(`Using development company ${extension.options.companyId} from extension config file`);
                }
            }

            // get the extension api key
            if (!extension.options.apiKey) {
                if(!extensionConfig[CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_KEY]){
                    let selected = await getExtensionList();
                    extension.options.apiKey = selected.extension.id;
                    extension.updateExtensionConfig(extensionConfig, CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_KEY, extension.options.apiKey);
                    Debug(
                        `Using user selected Extension ${selected.extension.name} with API key ${selected.extension.id}`,
                    );
                }
                else{
                    extension.options.apiKey = extensionConfig[CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_KEY];
                    Logger.info(`Using Extension API key ${extensionConfig[CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_KEY]} from extension config file`);
                }
                
            }

            // Get the extension api secret
            if(!extensionConfig[CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_SECRET]){
                const extensionDetails = await ExtensionService.getExtensionDataPartners(extension.options.apiKey);
                extension.options.apiSecret = extensionDetails.client_data.secret[0];
                extension.updateExtensionConfig(extensionConfig, CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_SECRET, extension.options.apiSecret);
            }
            else{
                extension.options.apiSecret = extensionConfig[CONSTANTS.EXTENSION_CONFIG.EXTENSION_API_SECRET];
                Logger.info(`Using Extension Secret from extension config file`);
            }

            // install project dependencies
            for(const projectConfig of projectConfigs){
                if (projectConfig['install']) {
                    Logger.info(`Installing dependencies for ${projectConfig['roles'].join(' and ')} project`)
                    try{
                        await extension.execCommand(projectConfig['install'], {cwd: projectConfig['configFilePath']}, `Successfully Installed dependencies for ${projectConfig['roles'].join(' and ')} project`)
                    }
                    catch(error){
                        Debug(error);
                        throw new CommandError(error.shortMessage, error.code);
                    }
                }
            }

            // Get Port to start the extension server
            let frontend_port : number;
            let backend_port : number;
            
            // Get the port value from project config files if present
            for(const projectConfig of projectConfigs) {
                if(projectConfig['roles'].includes('frontend')){
                    frontend_port = projectConfig['port'];
                }
                else if(projectConfig['roles'].includes('backend')){
                    backend_port = projectConfig['port'];
                }
            }
            
            // If port is not defined in config files generate random port to start server
            if(!frontend_port){
                frontend_port = await extension.getRandomFreePort([]);
            }
            if(!backend_port){
                backend_port = await extension.getRandomFreePort([frontend_port]);
            }
            extension.options.port = frontend_port;

            // Start Tunnel
            // Check if tunnel url is provided in options, use it
            if(extension.options.tunnelUrl){
                extension.publicTunnelURL = extension.options.tunnelUrl;
                Logger.info(
                    `Using tunnel url : ${extension.publicTunnelURL}`
                );
            }
            else {
                // start Cloudflared tunnel
                let spinner = new Spinner(`Starting Cloudflare tunnel on port ${extension.options.port}`);
                try {
                    spinner.start();
                    extension.publicTunnelURL =
                        await extension.startCloudflareTunnel();
                    spinner.succeed();
                } catch (error) {
                    spinner.fail();
                    throw new CommandError(
                        ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.message,
                        ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.code,
                    );
                }
            }

            // Store tunnel url in extension config file
            extension.updateExtensionConfig(extensionConfig, CONSTANTS.EXTENSION_CONFIG.EXTENSION_BASE_URL, extension.publicTunnelURL)
            // Remove tunnel url from extension config on exit
            process.on('exit', ()=>{
                extension.deleteKeyFromExtensionConfig(extensionConfig, CONSTANTS.EXTENSION_CONFIG.EXTENSION_BASE_URL);
            })
            
            // update launch url on partners panel
            if(extension.options.autoUpdate && extension.options.autoUpdate == 'true'){
                await ExtensionLaunchURL.updateLaunchURL(
                    extension.options.apiKey,
                    partner_access_token || options.accessToken,
                    extension.publicTunnelURL,
                );
            }
            else {
                Logger.info(`Skipped updating launch URL on partners panel`)
            }

            // Start Dev servers
            for(const projectConfig of projectConfigs){
                if (projectConfig['dev']) {
                    extension.execCommand(projectConfig['dev'], {
                        cwd: projectConfig['configFilePath'],
                        env: {
                            FRONTEND_PORT: frontend_port.toString(),
                            BACKEND_PORT: backend_port.toString(),
                            EXTENSION_API_KEY: extension.options.apiKey,
                            EXTENSION_API_SECRET: extension.options.apiSecret,
                            EXTENSION_BASE_URL: extension.publicTunnelURL
                        }
                    }).catch((error) => {
                        Debug(error);
                        if(['SIGINT', 'SIGUSR1', 'SIGUSR2'].includes(error.signal) || error.code == 0 || error.code == 130){
                            Logger.info(`${projectConfig['roles'].join(' and ')} process exited successfully.`);
                        }
                        else{
                            throw new CommandError(error.shortMessage, error.code);
                        }
                    })
                }
            }            
            
            // get preview URL
            const previewURL = extension.getPreviewURL();
            Debug(
                `TUNNEL URL: ${extension.publicTunnelURL
                }`,
            );
            Logger.info(
                successBox({
                    text: `TUNNEL URL: ${extension.publicTunnelURL
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

    isCloudflareTunnelShutdown = false;
    cloudflareTunnelLogParser(data) {
        const str = data.toString();
        const connected_regex = /Registered tunnel connection/;
        const disconnect_regex = /Unregistered tunnel connection/;
        const retry_connection_regex = /Retrying connection in up to/;
        const shutdown_regex =
            /Initiating graceful shutdown due to signal interrupt/;

        if (this.isCloudflareTunnelShutdown) {
            return;
        }

        if (str.match(connected_regex)) {
            Logger.info('Tunnel connection established');
        } else if (str.match(disconnect_regex)) {
            Logger.error('Tunnel disconnected');
        } else if (str.match(retry_connection_regex)) {
            Logger.warn(`Retrying to connect tunnel...`);
        } else if (str.match(shutdown_regex)) {
            this.isCloudflareTunnelShutdown = true;
        }
    }

    private async startCloudflareTunnel() {
        Debug(`Starting tunnel on port ${this.options.port}`);
        // INSTALL CURRENT LATEST VERSION
        process.env.CLOUDFLARED_VERSION = '2024.6.1';
        // THIS WILL STOP CLOUDFLARED TO AUTO UPDATE
        process.env.NO_AUTOUPDATE = 'true';
        // ALWAYS USE HTTP2 PROTOCOL
        process.env.TUNNEL_TRANSPORT_PROTOCOL = 'http2';

        const { url, connections, child, stop } = startTunnel({
            '--url': `http://localhost:${this.options.port}`,
        });

        const cleanup = async () => {
            stop();
        };

        for (const signal of ['SIGINT', 'SIGUSR1', 'SIGUSR2'] as const) {
            process.once(signal, cleanup);
        }

        child.stdout.on('data', this.cloudflareTunnelLogParser);
        child.stderr.on('data', this.cloudflareTunnelLogParser);

        if (process.env.DEBUG) {
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }

        return await url;
    }

    public findAllFilePathFromCurrentDirWithName(fileName: Array<String>) {
        const files = [];
        const dir = process.cwd();

        const search = (dir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    search(fullPath);
                } else if (fileName.includes(entry.name)) {
                    files.push(fullPath);
                }
            }
        };

        search(dir);
        return files;
    }

    async execCommand(command : string, options: ServerOptions = {}, successExitMessage: string = undefined) {
        try {
            const subprocess = execa.command(command, {
                cwd: options.cwd || process.cwd(),
                env: options.env || process.env,
                shell: true,
            });

            // Forward stdout and stderr to the main process
            subprocess.stdout.pipe(process.stdout);
            subprocess.stderr.pipe(process.stderr);

            // Handle process exit
            subprocess.on('exit', (code) => {
                if(successExitMessage || code == 0 || code == 130){
                    Logger.info(successExitMessage);
                }
            });

            // Store the subprocess
            serverProcesses.push(subprocess);

            return subprocess;
        } catch (error) {
            Logger.error(`Error while executing command "${command}":`, error.message);
        }
    }

    public async getRandomFreePort(excluded_port = []) {

        const randomPort = Math.floor(Math.random() * (10000)) + 40000;
        if (excluded_port.includes(randomPort)) {
            return await this.getRandomFreePort(excluded_port);
        }
        const availablePort = await detectPort(randomPort);

        // If the randomly selected port is free, return it. Otherwise, retry until a free port is found.
        if (availablePort === randomPort) {
            return randomPort;
        } else {
            return await this.getRandomFreePort([...excluded_port, randomPort]);
        }
    }

    public readAndValidateFDKExtConfigFiles(){
        let projectConfigFiles = this.findAllFilePathFromCurrentDirWithName(['fdk.ext.config.json', 'fdk.ext.config.yml']);
        const projectConfigs = [];

        const validateConfigStructure = (config) => {
            if(Object.keys(config).length == 0){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message,
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }

            if(!config.hasOwnProperty('roles') || !Array.isArray(config['roles'])){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message + "\nkey `roles` must be an array of string",
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }

            if(!config.hasOwnProperty('dev') || typeof config['dev'] !== "string"){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message + "\nkey `dev` must be a string",
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }

            if(config.hasOwnProperty('install') && typeof config['install'] !== "string"){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message + "\nkey `install` must be a string",
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }

            if(config.hasOwnProperty('port') && typeof config['port'] !== "number"){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message + "\nkey `port` must be a number",
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }

            return true;
        }

        const readConfigFile = (configFilePath) => {
            let projectConfig;
            if (path.extname(configFilePath) === '.yml') {
                const fileContents = fs.readFileSync(configFilePath, 'utf8');
                projectConfig = yaml.load(fileContents);
            }
            else{
                projectConfig = require(configFilePath);
            }
            return projectConfig;
        }

        
        if (projectConfigFiles.length == 0) {
            throw new CommandError(
                ErrorCodes.MISSING_FDK_CONFIG_FILE.message,
                ErrorCodes.MISSING_FDK_CONFIG_FILE.code,
            );
        }
        else{
            let definedProjectRoles = [];
            for (let fdkConfigFilePath of projectConfigFiles) {
                const projectConfig = readConfigFile(fdkConfigFilePath);
                validateConfigStructure(projectConfig);

                definedProjectRoles = definedProjectRoles.concat(projectConfig.roles);
                
                projectConfig['configFilePath'] = path.dirname(fdkConfigFilePath);
                projectConfigs.push(projectConfig);
            }
            if (!definedProjectRoles.includes("frontend") || !definedProjectRoles.includes("backend")){
                throw new CommandError(
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.message + "\nConfig files for both `frontend` and `backend` roles should be defined",
                    ErrorCodes.INVALID_FDK_CONFIG_FILE.code,
                );
            }
        }

        return projectConfigs;
    }

    public readExtensionConfig(){
        let extensionConfigFiles = this.findAllFilePathFromCurrentDirWithName([CONSTANTS.EXTENSION_CONFIG_FILE_NAME]);

        if (extensionConfigFiles.length > 1) {
            throw new CommandError(
                ErrorCodes.MULTIPLE_EXTENSION_CONFIG_FILE.message,
                ErrorCodes.MULTIPLE_EXTENSION_CONFIG_FILE.code
            )
        }
        else if(extensionConfigFiles.length == 0){
            fs.writeFileSync(CONSTANTS.EXTENSION_CONFIG_FILE_NAME, '{}');
            extensionConfigFiles = [path.resolve(CONSTANTS.EXTENSION_CONFIG_FILE_NAME)];
        }

        this.extensionConfigFilePath = extensionConfigFiles[0];

        const extensionConfig = require(this.extensionConfigFilePath);

        return extensionConfig;
    }

    public updateExtensionConfig(extensionConfig: Record<string, string|number>, key: string, value: string){
        extensionConfig[key] = value;
        fs.writeFileSync(CONSTANTS.EXTENSION_CONFIG_FILE_NAME, JSON.stringify(extensionConfig, null, 4));
    }

    public deleteKeyFromExtensionConfig(extensionConfig: Record<string, string|number>, key: string){
        delete extensionConfig[key];
        fs.writeFileSync(CONSTANTS.EXTENSION_CONFIG_FILE_NAME, JSON.stringify(extensionConfig, null, 4));
    }
}
