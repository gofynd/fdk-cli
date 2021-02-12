'use strict';
const Listr = require('listr');
const chalk = require('chalk');
const fs = require('fs');
const { createDirectory, writeFile } = require('../../utils/file-utlis');
const { writeContextData, loginUserWithEmail } = require('../../utils/utils');
const { logger } = require('../../utils/logger');
const { validateAppIdAndToken } = require('../../utils/validation-utils');
const { getThemeV3 } = require('../../apis/theme');
const command = 'add';
const desc = 'add context for theme';
const builder = function (yargs) {
  return yargs
    .options('app-id', {
      describe: 'Application ID'
    })
    .options('app-token', {
      describe: 'Application Token'
    })
    .options('theme-id', {
      describe: 'Theme Id'
    })
    .options('email', {
      describe: 'Email ID'
    })
    .options('password', {
      describe: 'Password'
    })
    .options('host', {
      describe: 'Host of application'
    })
    .options('context-name', {
      describe: 'Context name'
    })
    .options('verbose', {
      describe: 'Enable verbose'
    })
    .demandOption(
      ['email', 'app-id', 'password', 'app-token', 'context-name', 'theme-id', 'host'],
      `Please provide 'email', 'app-id', 'password', 'app-token', 'theme-id', 'context-name' & 'host' arguments to work with this tool`
    );
};
const handler = async args => {
  const contextObj = {
    email: args.email,
    appId: args['app-id'],
    password: args.password,
    themeId: args['theme-id'],
    token: args['app-token'],
    contextName: args['context-name'],
    host: args.host,
    verbose: args.verbose
  };
  await addContextTask(contextObj);
};

const addContextTask = async contextObj => {
  try {
    if (!fs.existsSync('./.fdk')) {
      if (contextObj.verbose) {
        logger('.fdk directory does not exists creating one', true);
      }
      createDirectory('./.fdk');
    }
    const path = './.fdk/context.json';
    if (!fs.existsSync(path)) {
      if (contextObj.verbose) {
        logger('context.json file not found creating one', true);
      }
      const contextData = { current_context: '', contexts: {} };
      writeFile(path, JSON.stringify(contextData, undefined, 2));
    }
    const tasks = new Listr([
      {
        title: 'Validating App ID & Token',
        task: async ctx => {
          ctx.app = await validateAppIdAndToken(
            contextObj.appId,
            contextObj.token,
            contextObj.host,
            contextObj.verbose
          );
        }
      },
      {
        title: 'Validating Theme',
        task: async ctx => {
          ctx.theme = await getThemeV3(
            contextObj.appId,
            contextObj.token,
            contextObj.themeId,
            contextObj.host
          );
        }
      },
      {
        title: 'Validating Creditials',
        task: async ctx => {
          ctx.cookie = await loginUserWithEmail(
            contextObj.email,
            contextObj.password,
            contextObj.host,
            contextObj.verbose
          );
        }
      },
      {
        title: 'Adding Context',
        task: ctx => {
          delete contextObj.password;
          let ctxObj = { cookie: ctx.cookie, ...contextObj, name: ctx.theme.information.name };
          ctxObj.domain = Array.isArray(ctx.app.domains) ? ctx.app.domains[0].name : ctx.app.domain.name;
          writeContextData(contextObj.contextName, ctxObj, undefined, contextObj.verbose);
        }
      }
    ]);
    await tasks.run().then(() => {
      console.log(chalk.greenBright('Context added successfully'));
    });
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = { handler, builder, desc, command };
