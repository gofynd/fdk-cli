'use strict';
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const { readFile, writeFile } = require('../../utils/file-utlis');
const command = 'list';
const desc = 'List context of theme';

const handler = async () => {
  await listContextTask();
};
const listContextTask = async () => {
  try {
    const path = './.fdk/context.json';
    if (!fs.existsSync(path)) {
      console.log(chalk.red('Context does not exists'));
      console.log(chalk.greenBright('Create context using fdk context add'));
      Promise.reject();
    }

    const contextObj = JSON.parse(readFile(path));
    // console.log(Object.keys(contextObj.contexts));
    const questions = [
      {
        type: 'list',
        name: 'listContext',
        message: 'Availabe Context. Select on to set active context',
        choices: Object.keys(contextObj.contexts)
      }
    ];
    await inquirer.prompt(questions).then(answers => {
      contextObj.current_context = answers.listContext;
      writeFile(path, JSON.stringify(contextObj, undefined, 2));
      console.log(
        chalk.greenBright.bold(
          'Context set successfully to',
          answers.listContext
        )
      );
    });
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = { handler, desc, command };
