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
    getDefaultContextData,
    replaceContent
} = require('../../utils/utils');
const { writeFile, createDirectory, readFile } = require('../../utils/file-utlis');
const { downloadFile } = require('../../utils/download');
const { extractArchive } = require('../../utils/archive');

const copy = promisify(ncp);
const partner_token_cmd = require('../partner_cmds/connect').handler;
const { registerExtension } = require('../../apis/extension');

function validateEmpty(input) {
    return input !== '';
}

// TODO: add public repo name from github
const INIT_PROJECT_URL = "https://github.com/gofynd/example-extension-javascript.git";//"https://gitlab.com/fynd/regrowth/fynd-platform/extensions/groot.git";

const questions = [
    {
        type: 'input',
        name: 'name',
        message: 'Enter Extension name :',
        validate: validateEmpty
    },
    {
        type: 'list',
        choices: ['Private', 'Public'],
        default: 'Private',
        name: 'type',
        message: 'Extension type :',
        validate: validateEmpty
    },
    {
        type: 'list',
        choices: ['Node + Vue.js'],
        default: 'Node + Vue.js',
        name: 'project_type',
        message: 'Development Language :',
        validate: validateEmpty
    },
];
exports.command = 'init';
exports.desc = 'Initialize extension';
exports.builder = function (yargs) {
    return yargs
        .options('template', {
            describe: 'Language'
        })
        .options('target-dir', {
            describe: 'Target directory for creating extension repository'
        })
        .options('context-name', {
            describe: 'Context name'
        })
        .options('host', {
            describe: 'Specify host for extension'
        })
        .options('verbose', {
            describe: 'Enable verbose logging'
        });
};

async function copyTemplateFiles(targetDirectory) {
    try {
        if (!fs.existsSync(targetDirectory)) {
            createDirectory(targetDirectory);
        }
        await execa('git', ['init'], { cwd: targetDirectory });
        await execa('git', ['remote', 'add', 'origin', INIT_PROJECT_URL], { cwd: targetDirectory });
        await execa('git', ['pull', 'origin', 'main:main'], { cwd: targetDirectory });
        writeFile(targetDirectory + '/.gitignore', `\n.fdk\\node_modules`, 'a+' );
        await rimraf.sync(`${targetDirectory}/.git`) // unmark as git repo
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function installNpmPackages(targetDir) {
    await execa('npm', ['i'], { cwd: targetDir });
    await execa('npm', ['run', 'build'], { cwd: targetDir });
}

const createProject = async answerObject => {
    try {
        let targetDir = answerObject.targetDir || process.cwd();

        const tasks = new Listr([
            {
                title: 'Fetching Template Files',
                task: async ctx => {
                    await copyTemplateFiles(targetDir, answerObject);
                    ctx.partner_access_token = answerObject.partner_access_token;
                    ctx.host = answerObject.host;
                    ctx.extensionData = {
                        name: answerObject.name,
                        targetDir: targetDir,
                        host: answerObject.host
                    }
                }
            },
            {
                title: 'Storing context',
                task: async ctx => {
                    let contextData = getDefaultContextData();
                    if(!fs.existsSync(targetDir + '/.fdk')) {
                        createDirectory(targetDir + '/.fdk');
                        writeFile(
                            targetDir + '/.fdk/context.json',
                            JSON.stringify(contextData, undefined, 2)
                        );
                    }
                    answerObject.contextName = answerObject.contextName || 'default';
                    const contextObj = {
                        partner_access_token: ctx.partner_access_token,
                        host: answerObject.host,
                    };
                    writeContextData(answerObject.contextName, contextObj, targetDir + '/.fdk/context.json', true);
                    if (answerObject.verbose) {
                        logger(
                            `context.json written successfully with the following data \n ${JSON.stringify(
                                contextObj,
                                undefined,
                                2
                            )}`,
                            true
                        );
                    }
                }
            },
            {
                title: 'Registering Extension',
                task: async ctx => {
                    const extension_data = await registerExtension(ctx.host, ctx.partner_access_token, answerObject.name, answerObject.type, answerObject.verbose);
                    const envData=`EXTENSION_API_KEY="${extension_data.client_id}"\nEXTENSION_API_SECRET="${extension_data.secret}"\nEXTENSION_BASE_URL="${answerObject.launch_url}"\nEXTENSION_CLUSTER_URL="https://${ctx.host}"`;
                    fs.writeFileSync(`${targetDir}/.env`, envData);
                    let packageJson = readFile(`${targetDir}/package.json`);
                    writeFile(`${targetDir}/package.json`, replaceContent(packageJson, 'groot', answerObject.name));
                    let readMe = readFile(`${targetDir}/README.md`);
                    writeFile(`${targetDir}/README.md`, replaceContent(readMe, 'groot', answerObject.name));
                }
            },
            {
                title: 'Installing Dependencies',
                task: async ctx => {
                    await installNpmPackages(targetDir);
                }
            }
        ]);
        await tasks
            .run()
            .then(ctx => {
                var b5 = Box('75x5', {
                    text:
                        chalk.green.bold('DONE ') +
                        chalk.green.bold('Project ready\n') +
                        chalk.yellowBright.bold('NOTE ') +
                        chalk.green.bold('cd ' + targetDir + ' to continue ...')
                });
                console.log(b5.toString());
            })
            .catch(error => {
                console.log(chalk.red(error.message));
                if (fs.existsSync(targetDir)) {
                    rimraf.sync(targetDir);
                }
                process.exit(1);
            });

        process.exit(0);
    } catch (error) {
        console.log(chalk.red(error.message));
        process.exit(1);
    }
};

exports.handler = async args => {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
        contextData = getActiveContext(true);
    }
    catch(err) { }

    let answers = {
        template: args.template || 'javascript',
        host: args.host || contextData.host,
        verbose: args.verbose,
        targetDir: args['target-dir'] || '.'
    };

    if (answers.template !== 'javascript') {
        console.log('template not present. allowed value: javascript'); // add more later
        process.exit(0);
    }
    if (answers.targetDir != '.' && fs.existsSync(answers.targetDir)) {
        console.log(chalk.red(`Directory "${answers.targetDir}" already exists. Please choose another`));
        process.exit(0);
    }
    if (fs.existsSync(path.join(answers.targetDir, '/.git'))) {
        console.log(chalk.red(`Cannot initialize extension at '${path.resolve(answers.targetDir)}', as it already contains Git repository.`));
        process.exit(0);
    }
    prompt_answers = await inquirer.prompt(questions);
    if (!contextData.partner_access_token) {
        contextData.partner_access_token = await partner_token_cmd({readOnly: true, ...args});
    }
    answers.launch_url = "http://localdev.fyndx0.de"
    answers.partner_access_token = contextData.partner_access_token;
    answers = {
        ...answers,
        ...prompt_answers
    }
    await createProject(answers);
};
