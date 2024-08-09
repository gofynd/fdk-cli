import configStore, { CONFIG_KEYS } from './Config';
import CommandError from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';
import axios from 'axios';
import urljoin from 'url-join';
import { isValidDomain } from '../helper/utils';
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
                console.warn(
                    chalk.yellow(
                        `Warning: The -n/--name option is deprecated. Please use -u/--url option instead. Ref: ${
                            getPlatformUrls().partners
                        }/help/docs/partners/themes/vuejs/command-reference#environment-commands-1`,
                    ),
                );
                throw new Error('Please use -u/--url option.');
            }
            if (!options.url) {
                throw new Error('Please provide -u/--url option.');
            }

            if (!isValidDomain(options.url)) {
                throw new Error('Please provide valid URL.');
            }
            const url = urljoin(
                'https://',
                options.url,
                '/service/application/content/_healthz',
            );
            await axios.get(url);
            Env.setEnv(options.url);
            Logger.info(`FDK CLI environment is now set to ${chalk.bold(options.url)}.\nAll subsequent commands will be executed in this environment.`);
        } catch (e) {
            throw new CommandError(e.message);
        }
    }
}
