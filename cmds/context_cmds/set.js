'use strict';
const Listr = require('listr');
const chalk = require('chalk');
const fs = require('fs');
const { setContext } = require('../../utils/utils');

const command = 'set';
const desc = 'Set a context from theme';
const builder = function(yargs) {
  return yargs
    .options('name', {
      alias: 'n',
      describe: 'Context Name'
    })

    .demandOption(
      ['name'],
      `Please provide 'name' arguments to work with this command`
    );
};
const handler = async args => {
  const contextObj = {
    name: args.name
  };
  await setContextTask(contextObj);
};

const setContextTask = async contextObj => {
  try {
    const path = './.fdk/context.json';
    if (!fs.existsSync(path)) {
      console.log(chalk.red('Context does not exists'));
      console.log(chalk.greenBright('Create context using fdk context add'));
      Promise.reject();
    }
    const tasks = new Listr([
      {
        title: 'Setting Context',
        task: () => {
          setContext(contextObj.name);
        }
      }
    ]);
    await tasks.run().then(() => {
      console.log(chalk.greenBright('Context set successfully'));
    });
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = { handler, builder, desc, command };
