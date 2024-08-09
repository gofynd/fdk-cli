import configStore, { CONFIG_KEYS } from './Config';
import CommandError from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';
import axios from 'axios';
import urljoin from 'url-join';
import { isValidDomain } from '../helper/utils';
import Debug from './Debug';

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

    public static async setNewEnvs(domain) {
        try {
            Debug(`Setting env: ${domain}`);
            let finalDomain = domain;

            // remove https:// from domain if present
            if (domain.includes('https://')) {
                finalDomain = domain.replace('https://', '');
            }

            // validate domain
            if (!isValidDomain(finalDomain)) {
                throw new Error(
                    `Please provide valid domain, Example: api.fynd.com`,
                );
            }

            // replace parnters to api
            if (finalDomain.includes('partners')) {
                finalDomain = finalDomain.replace('partners', 'api');
            }

            try {
                // check if healthz route exist or not
                const url = urljoin(
                    'https://',
                    finalDomain,
                    '/service/application/content/_healthz',
                );
                const response = await axios.get(url);

                if (response?.status === 200) {
                    Env.setEnv(finalDomain);
                    Logger.info(
                        `FDK CLI environment is now set to ${chalk.bold(finalDomain)}.\nAll subsequent commands will be executed in this environment.`,
                    );
                } else {
                    throw new Error(
                        'Provided domain is not valid host.',
                    );
                }
            } catch (err) {
                Debug(err);
                throw new Error(
                    'Provided domain is not valid host.',
                );
            }
        } catch (e) {
            throw new CommandError(e.message);
        }
    }
}
