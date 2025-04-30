import urljoin from 'url-join';
import execa from 'execa';
import inquirer from 'inquirer';
import path from 'path';
const serverProcesses = [];
import fs from 'fs';
import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';
import ExtensionLaunchURL from './ExtensionLaunchURL';
import {
    getPartnerAccessToken,
    Object,
    getCompanyId,
    selectExtensionFromList,
    findAllFilePathFromCurrentDirWithName,
    getRandomFreePort,
    validateEmpty
} from '../helper/extension_utils';
import { displayStickyText, OutputFormatter, successBox } from '../helper/formatter';
import CommandError, { ErrorCodes } from './CommandError';
import * as CONSTANTS from './../helper/constants';
import Logger from './Logger';
import ExtensionService from './api/services/extension.service';
import yaml from 'js-yaml';
import Tunnel from './Tunnel';
import chalk from 'chalk';
import ExtensionContext from './ExtensionContext';
import Env from './Env';
import configStore, { CONFIG_KEYS } from './Config';
let attempts: number = 0;
const maxAttempts: number = 5;
const interval: number = 1000;
let timer: NodeJS.Timeout | undefined;
import os from 'os';

interface ServerOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}

export default class ExtensionPreviewURL {
    organizationInfo: Object;
    publicTunnelURL: string;
    options: Object;
    firstTunnelConnection: boolean = true;
    fp_api_domain: string = urljoin(
        'https://',
        Env.getEnvValue()
    );

    // command handler for "extension preview-url"
    public static async previewUrlExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            // initialize class instance
            const extension = new ExtensionPreviewURL();
            extension.options = options;

            // Read and validate fdk.ext config files
            const projectConfigs = extension.readAndValidateFDKExtConfigFiles();

            // Read extension context file
            const extensionContext = new ExtensionContext();
            
            // Validate environment before extension preview
            const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
            const contextEnv = extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.CURRENT_ENV) || currentEnv;
            
            if(currentEnv != contextEnv)
                extensionContext.deleteAll();
            
            extension.options.currentEnv = currentEnv;

            // Extension Details
            let extensionDetails = undefined;
            const getExtensionDetails = async () => {
                if(!extensionDetails){
                    extensionDetails = await ExtensionService.getExtensionDataPartners(extension.options.apiKey);
                }
                return extensionDetails;
            }

            // Delete Extension context file if reset flag is passed
            if(options.reset){
                Logger.info(`Cleared extension context data`)
                extensionContext.deleteAll();
            }

            // Pick data from extension context and show info box
            let extensionDetailsFromContextText = ``;
            
            // Pick development company form context
            if(!extension.options.companyId && extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY)){
                extension.options.companyId = extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY);
                Debug(`Using development company ${extension.options.companyId} from extension context file\n`);
                extensionDetailsFromContextText += `${chalk.cyan.bold('Development Company:')} ${extension.options.companyId}`;
            }

            // Pick extension api key from context
            if(!extension.options.apiKey && extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY)){
                extension.options.apiKey = extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY);
                const extensionDetails = await getExtensionDetails();
                const extensionName = extensionDetails.name;
                Debug(`Using Extension ${extensionName} with API Key ${extensionContext.get(CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY)} from extension context file\n`);
                if(extensionDetailsFromContextText){
                    extensionDetailsFromContextText += "\n";
                }
                extensionDetailsFromContextText += `${chalk.cyan.bold('Extension:')} ${extensionName}`;
            }

            if(extensionDetailsFromContextText){
                extensionDetailsFromContextText = `Using below details from extension context\n\n` + extensionDetailsFromContextText;
                // Printing info box
                Logger.info(
                    successBox({
                        text: extensionDetailsFromContextText
                    })
                )
            }
            
            // get the companyId
            if (!extension.options.companyId) {
                extension.options.companyId = await getCompanyId("Select the development company you'd like to use to run the extension: ?");
                Debug(`Using user selected development company ${extension.options.companyId}`)
            }

            // get the extension api key
            if (!extension.options.apiKey) {
                let selected = await selectExtensionFromList();
                extension.options.apiKey = selected.extension.id;
                Debug(`Using user selected Extension ${selected.extension.name} with API key ${selected.extension.id}`,);
            }

            // Get the extension api secret
            if(!extensionDetails){
                extensionDetails = await getExtensionDetails();
            }
            extension.options.apiSecret = extensionDetails.client_data.secret[0];
            
            // Updating data to context file
            extensionContext.setAll({
                [CONSTANTS.EXTENSION_CONTEXT.DEVELOPMENT_COMPANY] : extension.options.companyId,
                [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY]: extension.options.apiKey,
                [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET]: extension.options.apiSecret,
                [CONSTANTS.EXTENSION_CONTEXT.CURRENT_ENV]: extension.options.currentEnv,
            })

            // Get Port to start the extension server
            let frontend_port : number;
            let backend_port : number;
            
            // Get the port value from project config files if present
            for(const projectConfig of projectConfigs) {
                if(projectConfig['roles'].includes('frontend') && projectConfig['port']){
                    frontend_port = projectConfig['port'];
                }
                else if(projectConfig['roles'].includes('backend') && projectConfig['port']){
                    backend_port = projectConfig['port'];
                }
            }
            
            // If port is not defined in config files generate random port to start server
            if(!frontend_port){
                frontend_port = await getRandomFreePort([]);
            }
            if(!backend_port){
                backend_port = await getRandomFreePort([frontend_port]);
            }
            extension.options.port = frontend_port;


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

            const { is_user_tunnel_url } = await inquirer
                .prompt([
                    {
                        type: 'list',
                        choices: ['Yes', 'No'],
                        default: 'Yes',
                        name: 'is_user_tunnel_url',
                        message: `Would you like to use your own tunnel URL to host the extension?`,
                        validate: validateEmpty,
                    },
                ])

            if(is_user_tunnel_url === 'Yes'){

                const { user_tunnel_url } = await inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'user_tunnel_url',
                            message: `Please enter the Tunnel URL that is listening on port ${frontend_port} :`,
                            validate: extension.validateTunnelUrl,
                        },
                    ])
                extension.options.tunnelUrl = user_tunnel_url.trim();
            }


            // Start Tunnel
            // Check if tunnel url is provided in options, use it
            if(extension.options.tunnelUrl){
                extension.publicTunnelURL = extension.options.tunnelUrl;
                Logger.info(
                    `Using tunnel url ${OutputFormatter.link(extension.publicTunnelURL)} from --tunnel-url flag`
                );
            }
            else {
                const extensionTunnel = new Tunnel({port: extension.options.port});

                await extensionTunnel.startTunnel();

                extension.publicTunnelURL = extensionTunnel.publicTunnelURL;
            }
            // Store tunnel url in extension context file
            extensionContext.set(CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL, extension.publicTunnelURL);
            // Remove tunnel url from extension context on exit
            process.on('exit', ()=>{
                extensionContext.delete(CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL);
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
            
            timer = setInterval(async () => {
                const ports = extension.getServicePorts(projectConfigs, backend_port.toString(), frontend_port.toString())
                await extension.checkPorts(ports, function () {
                    // get preview URL
                    const previewURL = extension.getPreviewURL();
    
                    Debug(
                        `${OutputFormatter.link(extension.publicTunnelURL, 'TUNNEL URL:')}`
                    );
                    const stickyText = successBox({
                        text: `${previewURL} Extension preview URL`,
                    });
        
                    displayStickyText(stickyText, Logger.info);
                });
            }, interval);

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
                            EXTENSION_BASE_URL: extension.publicTunnelURL,
                            FP_API_DOMAIN: extension.fp_api_domain
                        }
                    }).catch((error) => {
                        Debug(error);
                        if(['SIGINT', 'SIGUSR1', 'SIGUSR2'].includes(error.signal) || error.code == 0 || error.code == 130 || error.exitCode == 130){
                            Logger.info(`Shuting down ${projectConfig['roles'].join(' and ')} process.`);
                        }
                        else{
                            throw new CommandError(error.shortMessage, error.code);
                        }
                    })
                }
            }            
            
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    private validateTunnelUrl(input: string) {
        if (!input) {
            return 'Tunnel URL is required';
        }
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlPattern.test(input) ? true : 'Invalid url';;
    }

    private getPreviewURL() {
        let baseURL = getPlatformUrls().platform;
        return urljoin(
            baseURL,
            `/company/${this.options.companyId}`,
            `/extensions/${this.options.apiKey}`,
        );
    }
    public getServicePorts(projectConfigs, backendPort:string, frontendPort:string) {
        let ports = [];
        for(const projectConfig of projectConfigs) {
            if(projectConfig['roles'].includes('frontend'))
                ports.push(frontendPort);
            else if(projectConfig['roles'].includes('backend'))
                ports.push(backendPort);
            else if(projectConfig['roles'].includes('backend') && projectConfig['roles'].includes('frontend'))
                ports.push(frontendPort);
        }
        return ports;
    }
    
    public isPortRunning = async (port: string): Promise<boolean> => {
        const platform = os.platform();
      
        try {
          let stdout: string;
      
          if (platform === 'win32') {
            // Windows: Use netstat to check for LISTEN state
            const result = await execa('netstat', ['-an']);
            stdout = result.stdout;
            return stdout.includes(`:${port}`) && stdout.includes('LISTEN');
          } else {
            // macOS/Linux: Use lsof to check if the port is in use
            const result = await execa('lsof', ['-i', `:${port}`]);
            stdout = result.stdout;
            return stdout.includes(`:${port}`);
          }
        } catch (err) {
          // If the command fails (e.g., port not in use), return false
          return false;
        }
    };
      
    public checkPorts = async (ports: string[], callback: () => void) => {
        const result = [];
        
        for (const port of ports) {
          const isRunning = await this.isPortRunning(port);
          result.push(isRunning);          
        }
        
        const isNotRunning = result.some(value => value === false);
        if(isNotRunning){
            attempts++;
          
            if (attempts >= maxAttempts) {
                clearInterval(timer); // Stop after max attempts
            }
        }
        else{
            callback();
            if (timer) {
                clearInterval(timer); // Stop the timer if all ports are running
            }
        }
      };

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
                if(successExitMessage && (code == 0 || code == 130)){
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

    public readAndValidateFDKExtConfigFiles(){
        let projectConfigFiles = findAllFilePathFromCurrentDirWithName(['fdk.ext.config.json', 'fdk.ext.config.yml']);
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
Or you can use fdk tunnel --port <port> command to start tunnel\n`)
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
}
