import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import express from 'express';
import ConfigStore, { CONFIG_KEYS } from './Config';
import Logger from './Logger';
import CommandError from './CommandError';

import {
  getRandomFreePort,
} from '../helper/extension_utils';
import { getLocalBaseUrl } from '../helper/serve.utils';
import Debug from './Debug';
import Env from './Env'; // 2 min
import { OutputFormatter, successBox } from '../helper/formatter';
import OrganizationService from './api/services/organization.service';
import { getOrganizationDisplayName } from '../helper/utils';
import ExtensionContext from './ExtensionContext';

const cors = require('cors');

const SERVER_TIMER = 1000 * 60 * 2;

async function checkTokenExpired(auth_token) {
  const { expiry_time } = auth_token;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp > expiry_time) {
    return true;
  }
  return false;
}

export const getApp = async () => {
  const app = express();
  let isLoading = false;

  app.use(cors());
  app.use(express.json());

  app.post('/token', async (req, res) => {
    try {
      Debug(req);
      if (isLoading) {
        return res.status(429).json({ message: 'Another request is in progress. Please try again later.' });
      }
      isLoading = true;

      if (Auth.wantToChangeOrganization) {
        ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
        clearExtensionContext();
      }
      const expiryTimestamp = Math.floor(Date.now() / 1000) + req.body.auth_token.expires_in;
      req.body.auth_token.expiry_time = expiryTimestamp;
      if (Auth.newDomainToUpdate) {
        if (Auth.newDomainToUpdate === 'api.fynd.com') {
          Env.setEnv(Auth.newDomainToUpdate);
        } else {
          await Env.setNewEnvs(Auth.newDomainToUpdate);
        }
      }
      ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, req.body.auth_token);
      ConfigStore.set(CONFIG_KEYS.ORGANIZATION, req.body.organization);
      const organization_detail = await OrganizationService.getOrganizationDetails();
      ConfigStore.set(
        CONFIG_KEYS.ORGANIZATION_DETAIL,
        organization_detail.data,
      );
      Auth.stopSever();
      Logger.info(
        `Logged in successfully in organization ${getOrganizationDisplayName()}`,
      );
      res.status(200).json({ message: 'success' });
    } catch (err) {
      Debug(err);
      Auth.stopSever();
      res.status(500).json({ message: 'failed' });
    } finally {
      isLoading = false;
    }
  });

  return { app };
};

function startTimer() {
  Debug('Server timer starts');
  Auth.timer_id = setTimeout(() => {
    Auth.stopSever(() => {
      console.log(chalk.red(`Timeout: Please run ${chalk.blue('fdk login')} command again.`));
    });
  }, SERVER_TIMER);
}

function resetTimer() {
  if (Auth.timer_id) {
    Debug('Server timer stoped');
    clearTimeout(Auth.timer_id);
    Auth.timer_id = null;
  }
}

function clearExtensionContext() {
  const extensionContext = new ExtensionContext();
  extensionContext.deleteAll();
}

export const startServer = async (port:number) => {
  if (Auth.server) return Auth.server;

  const { app } = await getApp();
  const serverIn = require('http').createServer(app);

  // handle errors thrown while start listening
  serverIn.on('error', (error) => {
    Debug(error);
    if (error.code === 'EADDRINUSE') {
      console.error(chalk.red(`Port ${port} is already in use.`));
    } else {
      console.error(chalk.red('An unexpected error occurred:'), error);
    }
  });

  Auth.server = serverIn.listen(port);

  // resolve promise only if server starts listening
  // we will open partner panel only if server is listening
  return new Promise((resolve) => {
    serverIn.on('listening', () => {
      Debug(`Server started listening on ${port}`);
      resolve(Auth.server);
    });
  }).then((server) => {
    // once server start listening, start server timer
    startTimer();
    return server;
  });
};

export default class Auth {
  static server = null;

  static timer_id;

  static wantToChangeOrganization = false;

  static newDomainToUpdate = null;

  constructor() {}

  public static async login(options) {
    let env: string;
    const port = await getRandomFreePort([]);
    if (options.host) {
      env = await Env.verifyAndSanitizeEnvValue(options.host);
    } else {
      env = 'api.fynd.com';
    }

    const current_env = Env.getEnvValue();

    if (current_env !== env) {
      // update new domain after login
      Auth.newDomainToUpdate = env;

      // Logout user from current domain
      Auth.updateConfigStoreForLogout();
    }

    const isLoggedIn = await Auth.isAlreadyLoggedIn();
    if (isLoggedIn) {
      Logger.info(
        `Current logged in organization: ${getOrganizationDisplayName()}`,
      );
      const questions = [
        {
          type: 'list',
          name: 'confirmChangeOrg',
          message:
                        'You are already logged In. Do you wish to change the organization?',
          choices: ['Yes', 'No'],
        },
      ];
      await inquirer.prompt(questions).then(async (answers) => {
        if (answers.confirmChangeOrg === 'No') {
          Auth.wantToChangeOrganization = false;
        } else {
          Auth.wantToChangeOrganization = true;
          await startServer(port);
        }
      });
    } else await startServer(port);
    try {
      let domain = null;
      const partnerDomain = env.replace('api', 'partners');
      domain = `https://${partnerDomain}`;
      try {
        if (Auth.wantToChangeOrganization || !isLoggedIn) {
          await open(
            `${domain}/organizations/?fdk-cli=true&callback=${encodeURIComponent(
              `${getLocalBaseUrl()}:${port}`,
            )}`,
          );
          console.log(
            `Open link on browser: ${OutputFormatter.link(`${domain}/organizations/?fdk-cli=true&callback=${encodeURIComponent(
              `${getLocalBaseUrl()}:${port}`,
            )}`)}`,
          );
        }
      } catch (err) {
        console.log(
          `Open link on browser: ${OutputFormatter.link(`${domain}/organizations/?fdk-cli=true&callback=${encodeURIComponent(
            `${getLocalBaseUrl()}:${port}`,
          )}`)}`,
        );
      }
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  }

  public static async logout() {
    try {
      const questions = [
        {
          type: 'list',
          name: 'confirmLogout',
          message: 'Are you sure you want to logout',
          choices: ['Yes', 'No'],
        },
      ];
      await inquirer.prompt(questions).then((answers) => {
        if (answers.confirmLogout === 'Yes') {
          Auth.updateConfigStoreForLogout();
          Logger.info('User logged out successfully');
        }
      });
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  }

  private static updateConfigStoreForLogout() {
    const currentEnv = ConfigStore.get(
      CONFIG_KEYS.CURRENT_ENV_VALUE,
    );
    const extras = ConfigStore.get(CONFIG_KEYS.EXTRAS);
    ConfigStore.clear();
    ConfigStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, currentEnv);
    ConfigStore.set(CONFIG_KEYS.EXTRAS, extras);
  }

  public static getUserInfo() {
    try {
      const { current_user: user } = ConfigStore.get(
        CONFIG_KEYS.AUTH_TOKEN,
      );
      const activeEmail = user.emails.find((e) => e.active && e.primary)?.email
                || 'Primary email missing';
      const text = `Name: ${user.first_name} ${
        user.last_name
      }\nEmail: ${activeEmail}\nOrganization: ${getOrganizationDisplayName()}`;
      Logger.info(successBox({ text }));
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  }

  private static isAlreadyLoggedIn = async () => {
    const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
    if (auth_token && auth_token.access_token) {
      const isTokenExpired = await checkTokenExpired(auth_token);
      if (!isTokenExpired) return true;
      return false;
    } return false;
  };

  static stopSever = async (cb = null) => {
    resetTimer();
    Auth.server?.close?.(() => {
      Debug('Server closed');
      cb?.();
    });
  };
}
