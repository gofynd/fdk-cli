const chalk = require('chalk');
var Box = require('cli-box');
const mongoose = require('mongoose');
const _ = require('lodash');
const fs = require('fs');
const rimraf = require('rimraf');
const ncp = require('ncp');
const path = require('path');
const execa = require('execa');
const { promisify } = require('util');
const inquirer = require('inquirer');
const Listr = require('listr');
const yargs = require('yargs');
const { logger } = require('./../../utils/logger');
const { validatObjectId } = require('./../../utils/validation-utils');
const { normalizeError } = require('./../../utils/error.util');
const {
    generateConfigJSON,
    loginUserWithEmail,
    writeContextData,
    getActiveContext,
    getDefaultContextData
} = require('../../utils/utils');
const { writeFile, createDirectory } = require('../../utils/file-utlis');
const { downloadFile } = require('../../utils/download');
const { extractArchive } = require('../../utils/archive');
const { getOrganizationInfo } = require('../../apis/extension');

const copy = promisify(ncp);

const questions = [
    {
        type: 'input',
        name: 'partner_access_token',
        message: 'Enter partner access token :',
        validate: validateEmpty
    }
]

function validateEmpty(input) {
    return input !== '';
}



exports.command = 'connect';
exports.desc = 'Connect partner account';
exports.builder = function (yargs) {
    return yargs
        .options('verbose', {
            describe: 'Enable verbose logging'
        });
};


exports.handler = async args => {
    const context = getDefaultContextData().contexts.default;
    try {
        context = getActiveContext();
    }
    catch (err) { }
    let answers = {};
    let organizationInfo = null;
    answers = await inquirer.prompt(questions);
    context.partner_access_token = answers.partner_access_token;
    const tasks = new Listr([
        {
            title: 'Verifying access token',
            task: async ctx => {
                organizationInfo = await getOrganizationInfo(context.host, answers.partner_access_token, args.verbose);           
            }
        }]);

    await tasks.run();
    if (!organizationInfo) {
        console.log(chalk.red('Invalid or expired token. Please add valid token'));
        process.exit(0);
    }
    if (!args.readOnly) {
        writeContextData(context.name, context, `${args.targetDir}/.fdk/context.json`, true);
        console.log(chalk.green('Updated partner token'));
    }
    return context.partner_access_token;
};
