import configStore, { CONFIG_KEYS } from './Config';
import CommandError from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';
import axios from 'axios';
import urljoin from 'url-join';
import { isValidDomain } from '../helper/utils';

export const AVAILABLE_ENVS = {
    // Fynd
    fyndx1: 'api.fyndx1.de',
    fyndx5: 'api.fyndx5.de',
    fynd: 'api.fynd.com',

    // Jio e-commerce
    jioecomm: 'api.jioecomm.com',

    // Jio games
    jiogamesz0: 'api.jiogamesz0.de',
    jiogamesz5: 'api.jiogamesz5.de',
    jiogames: 'api.jiogamesstore.com',

    // Jio market
    jiomarketx0: 'api.jiomarketx0.de',
    jiomarketz5: 'api.jiomarketz5.de',
    jiomarket: 'api.jiomarket.com',

    // Jio retail
    jioretailer: 'api.jioretailer.com',

    // Jio mart Digital B2B
    jiox0: 'api.jiox0.de',
    jiox1: 'api.jiox1.de',
    jiox2: 'api.jiox2.de',
    jiox3: 'api.jiox3.de',
    jiox5: 'api.jiox5.de',

    // Jio mart partners
    jmpx2: 'api.jmpx2.de',
    jmpx3: 'api.jmpx3.de',
    jmpz0: 'api.jmpz0.de',
    jmpz5: 'api.jmpz5.de',
    jiomartpartners: 'api.jiomartpartners.com',

    // Product business group
    pbgz0: 'api.pbgz0.de',

    // Scan and Go
    sngz0: 'api.sngz0.de',
    sngz5: 'api.sngz5.de',
    sng: 'api.sngfynd.com',

    // Swadesh
    swadeshz0: 'api.swadeshz0.de',
    swadeshz5: 'api.swadeshz5.de',
    swadesh: 'api.swadeshonline.com',

    // Tira beauty
    tirax2: 'api.tirax2.de',
    tiraz0: 'api.tiraz0.de',
    tiraz5: 'api.tiraz5.de',
    tirabeauty: 'api.tirabeauty.com',
};

type EnvType = keyof typeof AVAILABLE_ENVS;

export default class Env {
    constructor() {}

    private static setEnv(ctx: EnvType) {
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
        const msg = AVAILABLE_ENVS[ctx]
            ? `Active Environment: ${chalk.bold(ctx)}\nAPI URL: ${chalk.bold(AVAILABLE_ENVS[ctx])}`
            : `Currently using Platform URL: ${chalk.bold(ctx)}`;
        Logger.info(msg);
    }
    public static async listEnvs() {
        try {
            const ACTIVE_ENVIRONMENT = Env.getEnvValue();
            Logger.info(chalk.bold.blueBright(`List of supported Environments:`));
            Object.keys(AVAILABLE_ENVS).forEach(key => {
                if (ACTIVE_ENVIRONMENT && key.toString() === ACTIVE_ENVIRONMENT.toString()) {
                    Logger.info(`${chalk.bold.greenBright(key)}*`);
                } else {
                    Logger.info(chalk.bold.gray(key));
                }
            });
        } catch (error) {
            throw new CommandError(error.message);
        }
    }

    public static async setNewEnvs(options) {
        try {
            if (!options.url && !options.name) {
                throw new Error('Please provide either --name or --url.');
            }

            if (options.url && options.name) {
                throw new Error('Please provide only one option: either --name or --url.');
            }

            if (options.name) {
                if (Object.keys(AVAILABLE_ENVS).includes(options.name)) {
                    Env.setEnv(options.name);
                    Logger.info(`Env set to: ${chalk.bold(options.name)}`);
                } else {
                    Logger.error(`*${chalk.bold(options.name)}* environment is not supported.\n`);
                    Env.listEnvs();
                }
            } else if (options.url) {
                if (!isValidDomain(options.url)) {
                    throw new Error('Please provide valid URL.');
                }
                try {
                    const url = urljoin(
                        'https://',
                        options.url,
                        '/service/application/content/_healthz'
                    );
                    const response = await axios.get(url);

                    if (response?.data?.ok) {
                        Env.setEnv(options.url);
                        Logger.info(`CLI will start using: ${chalk.bold(options.url)}`);
                    } else {
                        throw new Error('Provided url is not valid platform URL.');
                    }
                } catch (err) {
                    throw new Error('Provided url is not valid platform URL.');
                }
            }
        } catch (e) {
            throw new CommandError(e.message);
        }
    }
}
