'use strict';
const chalk = require('chalk');
const fs = require('fs');
const { getActiveContext } = require('../../utils/utils');
const command = 'get';
const desc = 'Get current context of theme';

const handler = async () => {
  await getContextTask();
};

const getContextTask = async () => {
  try {
    const path = './.fdk/context.json';
    if (!fs.existsSync(path)) {
      console.log(chalk.red('Context does not exists'));
      console.log(chalk.greenBright('Create context using fdk context add'));
      Promise.reject();
    }

    const contextObj = await getActiveContext();
    console.log(chalk.green.bold('Current Context:', contextObj.name));
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = { handler, desc, command };
