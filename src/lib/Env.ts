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
            if (!options.url) {
                throw new Error('Please provide -u/--url option.');
            }

            if (!isValidDomain(options.url)) {
                throw new Error('Please provide valid URL.');
            }
            try {
                const url = urljoin(
                    'https://',
                    options.url,
                    '/service/application/content/_healthz',
                );
                const response = await axios.get(url);

                if (response?.status === 200) {
                    Env.setEnv(options.url);
                    Logger.info(
                        `CLI will start using: ${chalk.bold(options.url)}`,
                    );
                } else {
                    throw new Error(
                        'Provided url is not valid platform URL.',
                    );
                }
            } catch (err) {
                Debug(err)
                throw new Error('Provided url is not valid platform URL.');
            }
        
        } catch (e) {
            throw new CommandError(e.message);
        }
    }
}
