import configStore, { CONFIG_KEYS } from './Config';
import CommandError from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';
import axios from 'axios';
import urljoin from 'url-join';
import { isValidDomain } from '../helper/utils';
import Debug from './Debug';
import { getPlatformUrls } from './api/services/url';


export default class Env {
    constructor() {}

    private static setEnv(ctx: string) {
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

    public static async setNewEnvs(options) {
        try {
            // todo: remove name warning in future version
            if (options.name) {
                console.warn(chalk.yellow(`Warning: The -n/--name option is deprecated. Please use -u/--url option instead. Ref: ${getPlatformUrls().partners}/help/docs/partners/themes/vuejs/command-reference#environment-commands-1`));
                throw new Error('Please use -u/--url option.');
            }
            
            if (!options.url && !options.partners) {
                throw new Error('Please provide -u/--url or -p/--partners option.');
            }
            
            let finalUrl = options.url || options.partners;

            if(finalUrl.includes("https://")){
                finalUrl = finalUrl.replace('https://', '');
            }

            // todo: in future, when url support will be removed, update isValidDomain to get only partners domain, as of now -u and -p can accept both url(api & partners).
            if (!isValidDomain(finalUrl)) {
                throw new Error('Please provide valid domain.');
            }

            if(finalUrl.includes("partners")){
                finalUrl = finalUrl.replace('partners', 'api');
            }

            try {
                const url = urljoin(
                    'https://',
                    finalUrl,
                    '/service/application/content/_healthz',
                );
                const response = await axios.get(url);

                if (response?.status === 200) {
                    Env.setEnv(finalUrl);
                    Logger.info(
                        `CLI will start using: ${chalk.bold(finalUrl)}`,
                    );
                } else {
                    throw new Error(
                        'Provided domain is not valid partners URL.',
                    );
                }
            } catch (err) {
                Debug(err)
                throw new Error('Provided domain is not valid partners URL.');
            }
        
        } catch (e) {
            throw new CommandError(e.message);
        }
    }
}
