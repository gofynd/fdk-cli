'use strict';
const Listr = require('listr');
const chalk = require('chalk');
const fs = require('fs');
const { writeContextData, getActiveContext, loginUserWithEmail, getActiveContextName } = require('../../utils/utils');
const { validateAppIdAndToken } = require('../../utils/validation-utils');

const command = 'update';
const desc = 'update context';

const updateContext = async (args) => {
    try {
        let ctx = getActiveContext();
        const appData = await validateAppIdAndToken(ctx.appId, ctx.token, ctx.host)
        const newCookie = await loginUserWithEmail(args.email,args.password, ctx.host);
        ctx.company_id = appData.company_id;
        ctx.cookie = newCookie;
        writeContextData(getActiveContextName(), ctx, undefined, true)
    } catch (error) {
      if(error.isAxiosError) error.message = error.response.data.message 
        throw new Error(error)
    }
    

}

const handler = async args => {
    
    await updateContextTask(args);
};

const builder = function(yargs) {
    return yargs
      .options('email', {
        alias: 'e',
        describe: 'Email'
      })
      .options('password', {
        alias: 'p',
        describe: 'Password'
      })
      .demandOption(
        ['email', 'password'],
        `Please provide 'email' & 'password' arguments to work with this command`
      );
  };

const updateContextTask = async (args) => {
  try {
    const path = './.fdk/context.json';
    if (!fs.existsSync(path)) {
      console.log(chalk.red('Context does not exists'));
      console.log(chalk.greenBright('Create context using fdk context add'));
      return Promise.reject();
    }
    const tasks = new Listr([
      {
        title: 'Updating Context',
        task: async () => {
          await updateContext(args);
        }
      }
    ]);
    await tasks.run().then(() => {
      console.log(chalk.greenBright('Context updated successfully'));
    });
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = { handler, builder, desc, command };
