import configStore, { CONFIG_KEYS } from './Config';
import inquirer from 'inquirer';
import CommandError from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
import chalk from 'chalk';

export const AVAILABLE_ENVS = {
  fyndx1: 'api.fyndx1.de',
  fyndx0: 'api.fyndx0.de',
  fynd: 'api.fynd.com',
  jiox2: 'api.jiox2.de',
  jiox1: 'api.jiox1.de',
  jiox0: 'api.jiox0.de',
  jioretailer: 'api.jioretailer.com',
  jioecomm: 'api.jioecomm.com',
  jiomarketx0: 'api.jiomarketx0.de',
  jiox5: 'api.jiox5.de',
  jiox3: 'api.jiox3.de',
  jiomartpartners: 'api.jiomartpartners.com'
};

type EnvType = keyof typeof AVAILABLE_ENVS;

export default class Env {
  constructor() {}

  private static setEnv(ctx: EnvType) {
    configStore.set(CONFIG_KEYS.CURRENT_ENV, {}); // active_context: {}
    configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, ctx)  // x0: {}

  }
  public static getEnvValue() {
    return configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
  }
  public static getEnv() {
    const ctx = Env.getEnvValue();
    if(!ctx) {
      throw new CommandError(COMMON_LOG_MESSAGES.EnvNotSet);
    }
    Logger.success(`Active Environment: ${chalk.bold(ctx)}`);
  }
  public static async listEnvs() {
    try {
      const ACTIVE_ENVIRONMENT = Env.getEnvValue();
      Logger.info(chalk.bold.blueBright(`List of supported Environments:`));
      Object.keys(AVAILABLE_ENVS).forEach(key => {
        if(ACTIVE_ENVIRONMENT && key.toString() === ACTIVE_ENVIRONMENT.toString()) {
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
      if(options.name) {
        if(Object.keys(AVAILABLE_ENVS).includes(options.name)) {
          Env.setEnv(options.name);
          Logger.success(`Env set to: ${chalk.bold(options.name)}`);
        } else {
          Logger.error(`*${chalk.bold(options.name)}* environment is not supported.\n`);
          Env.listEnvs();
        }
      }
    } catch(e) {
      throw new CommandError(e.message);
    }
  }
}
