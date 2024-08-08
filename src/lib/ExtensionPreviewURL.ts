import urljoin from 'url-join';
import execa from 'execa';
import path from 'path';
import rimraf from 'rimraf';
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
import { displayFixedText, successBox } from '../helper/formatter';
import CommandError, { ErrorCodes } from './CommandError';
import * as CONSTANTS from './../helper/constants';
import Logger from './Logger';
import ExtensionService from './api/services/extension.service';
import yaml from 'js-yaml';
import ExtensionTunnel from './ExtensionTunnel';

interface ServerOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicTunnelURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;
    private extensionContextFilePath: string = undefined;

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            // initialize class instance
            const extension = new ExtensionPreviewURL();
            extension.options = options;

            // Read and validate fdk.ext config files
            const projectConfigs = extension.readAndValidateFDKExtConfigFiles();

            // Delete Extension context file if reset flag is passed
            if(options.reset){
                Logger.info(`Cleared extension context data`)
                extension.deleteExtensionContext();
            }

            // Read extension context file
            const extensionContext = extension.readExtensionContext();

            // get the companyId
            if (!extension.options.companyId) {
                if(!extensionContext[CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY]){
                    extension.options.companyId = await getCompanyId("Select the development company you'd like to use to run the extension: ?");
                    extension.updateExtensionContext(extensionContext, CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY, extension.options.companyId);
                    Debug(`Using user selected development company ${extension.options.companyId}`)
                }
                else{
                    extension.options.companyId = extensionContext[CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY];
                    Logger.info(`Using development company ${extension.options.companyId} from extension context file\n`);
                }
            }

            // get the extension api key
            if (!extension.options.apiKey) {
                if(!extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY]){
                    let selected = await getExtensionList();
                    extension.options.apiKey = selected.extension.id;
                    extension.updateExtensionContext(extensionContext, CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY, extension.options.apiKey);
                    Debug(
                        `Using user selected Extension ${selected.extension.name} with API key ${selected.extension.id}`,
                    );
                }
                else{
                    extension.options.apiKey = extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY];
                    Logger.info(`Using Extension API key ${extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY]} from extension context file\n`);
                }
                
            }

            // Get the extension api secret
            if(!extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET]){
                const extensionDetails = await ExtensionService.getExtensionDataPartners(extension.options.apiKey);
                extension.options.apiSecret = extensionDetails.client_data.secret[0];
                extension.updateExtensionContext(extensionContext, CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET, extension.options.apiSecret);
            }
            else{
                extension.options.apiSecret = extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET];
                Logger.info(`Using Extension Secret from extension context file\n`);
            }

            // install project dependencies
            for(const projectConfig of projectConfigs){
                if (projectConfig['install']) {
                    Logger.info(`Installing dependencies for ${projectConfig['roles'].join(' and ')} project`)
                    try{
                        await extension.execCommand(projectConfig['install'], {cwd: projectConfig['configFilePath']}, `Successfully Installed dependencies for ${projectConfig['roles'].join(' and ')} project\n\n`)
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
                const extensionTunnel = new ExtensionTunnel({port: extension.options.port});

                await extensionTunnel.startTunnel();

                extension.publicTunnelURL = extensionTunnel.publicTunnelURL;
            }

            // Store tunnel url in extension context file
            extension.updateExtensionContext(extensionContext, CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL, extension.publicTunnelURL)
            // Remove tunnel url from extension context on exit
            process.on('exit', ()=>{
                extension.deleteKeyFromExtensionContext(extensionContext, CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL);
            })
            
            // update launch url on partners panel
            if(extension.options.autoUpdate){
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
            const stickyText = successBox({
                text: `TUNNEL URL: ${extension.publicTunnelURL
                    }\nExtension preview URL: ${previewURL}`,
            });

            displayFixedText(stickyText);
            Logger.info(
                stickyText
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
            Logger.error(`No fdk.ext.config file found in current directory.
Seems like you are using old extension structure. Please refer this doc to update your boilerplate structure
Or you can use fdk extension tunnel --port <port> command to start tunnel\n`)
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

    public readExtensionContext(){
        let extensionContextFiles = this.findAllFilePathFromCurrentDirWithName([CONSTANTS.EXTENSION_CONTEXT_FILE_NAME]);

        if (extensionContextFiles.length > 1) {
            throw new CommandError(
                ErrorCodes.MULTIPLE_EXTENSION_CONTEXT_FILE.message,
                ErrorCodes.MULTIPLE_EXTENSION_CONTEXT_FILE.code
            )
        }
        else if(extensionContextFiles.length == 0){
            fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, '{}');
            extensionContextFiles = [path.resolve(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME)];
        }

        this.extensionContextFilePath = extensionContextFiles[0];

        const extensionContext = require(this.extensionContextFilePath);

        return extensionContext;
    }

    public updateExtensionContext(extensionContext: Record<string, string|number>, key: string, value: string){
        extensionContext[key] = value;
        fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, JSON.stringify(extensionContext, null, 4));
    }

    public deleteKeyFromExtensionContext(extensionContext: Record<string, string|number>, key: string){
        delete extensionContext[key];
        fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, JSON.stringify(extensionContext, null, 4));
    }

    public deleteExtensionContext(){
        rimraf.sync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME);
    }
}
