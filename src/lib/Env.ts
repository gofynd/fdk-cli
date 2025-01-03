import configStore, { CONFIG_KEYS } from './Config';
import CommandError, { ErrorCodes } from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';
import axios from 'axios';
import urljoin from 'url-join';
import { isValidDomain } from '../helper/utils';
import Debug from './Debug';

export default class Env {
    constructor() {}

    public static setEnv(ctx: string) {
        configStore.set(CONFIG_KEYS.CURRENT_ENV, {}); // active_context: {}
        configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, ctx); // x0: {}
    }
    
    public static getEnvValue() {
        return configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    }

    public static getEnv() {
        const ctx = Env.getEnvValue();
        if (!ctx) {
            throw new CommandError(COMMON_LOG_MESSAGES.EnvNotSet);
        }
        Logger.info(`Currently using Platform URL: ${chalk.bold(ctx)}`);
    }

    public static async setNewEnvs(domain: string) {
        try {
            Debug(`Setting env: ${domain}`);
            let finalDomain = await Env.verifyAndSanitizeEnvValue(domain);

            Env.setEnv(finalDomain);
            Logger.info(
                `FDK CLI environment is now set to ${chalk.bold(finalDomain)}.\nAll subsequent commands will be executed in this environment.`,
            );
        } catch (e) {
            throw new CommandError(e.message, e.code, e.response);
        }
    }

    public static async verifyAndSanitizeEnvValue(domain: string){
        let finalDomain = domain;

        if(typeof finalDomain !== 'string'){
            throw new CommandError(
                 `Invalid host: Please provide a valid Fynd Platform API domain. For example: 'api.fynd.com'.`,
                 ErrorCodes.INVALID_INPUT.code
            );
        }

        finalDomain = finalDomain.trim();
        
        // remove https:// from domain if present
        if (domain.includes('https://')) {
            finalDomain = domain.replace('https://', '');
        }

        // remove http:// from domain if present
        if (domain.includes('http://')) {
            finalDomain = domain.replace('http://', '');
        }

        // validate domain
        if (!isValidDomain(finalDomain)) {
            throw new CommandError(
                `Invalid host: Please provide a valid Fynd Platform API domain. For example: 'api.fynd.com'.`,
                ErrorCodes.INVALID_INPUT.code
           );
        }


        function replaceSubdomain(url: string) {
            let finalUrl = url;
            if(url.startsWith("partners.")){
                finalUrl = "api." + url.split(".").slice(1).join(".");
            } else 
            if(url.startsWith("partners-")){
                finalUrl = "api-" + url.split("-").slice(1).join("-");
            }
            return finalUrl;
        }

        // replace parnters to api
        finalDomain = replaceSubdomain(finalDomain);

        // validate domain if it is api domain or not
        if(!(finalDomain.startsWith('api.') || finalDomain.startsWith('api-'))){
            throw new CommandError(
                `Invalid host: Please provide a valid Fynd Platform API domain. For example: 'api.fynd.com'.`,
                ErrorCodes.INVALID_INPUT.code
            );
        }

        try {
            // check if healthz route exist or not
            const url = urljoin(
                'https://',
                finalDomain,
                '/service/application/content/_healthz',
            );
            const response = await axios.get(url);

            if (response?.status !== 200) {
                throw new Error(
                    `Invalid host: Please provide a valid Fynd Platform API domain. For example: 'api.fynd.com'.`
                );
            }
        } catch (err) {
            Debug(err);
            throw new CommandError(
                `The provided Fynd Platform API domain (${finalDomain}) is not reachable.\nThis could be due to an invalid domain or the Fynd platform for the provided domain being inaccessible.`,
                ErrorCodes.INVALID_INPUT.code
            );
        }

        return finalDomain;
    }
}
