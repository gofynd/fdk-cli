const chalk = require('chalk');
const inquirer = require('inquirer');
const Listr = require('listr');
const {
    writeContextData,
    getActiveContext,
    getDefaultContextData
} = require('../../utils/utils');
const { getOrganizationInfo } = require('../../apis/extension');


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
    const context = getDefaultContextData().partners.contexts.default;
    try {
        context = getActiveContext(true);
    }
    catch (err) { }
    let answers = {};
    let organizationInfo = null;
    try {
        answers = await inquirer.prompt(questions);
        context.partner_access_token = answers.partner_access_token;
        const host = args.host || context.host;
        const tasks = new Listr([
            {
                title: 'Verifying access token',
                task: async ctx => {
                    organizationInfo = await getOrganizationInfo(host, answers.partner_access_token, args.verbose);
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
    }
    catch (error) {
        console.log(chalk.red(error.message));
        process.exit(1);
    }
    return context.partner_access_token;
};
