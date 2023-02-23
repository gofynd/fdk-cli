const chalk = require('chalk');
var Box = require('cli-box');
const _ = require('lodash');
const fs = require('fs');
const rimraf = require('rimraf');
const ncp = require('ncp');
const path = require('path');
const { promisify } = require('util');
const inquirer = require('inquirer');
const Listr = require('listr');
const yargs = require('yargs');
const { logger } = require('./../../utils/logger');
const {
    writeContextData,
    getActiveContext,
    getDefaultContextData,
} = require('../../utils/utils');
const { writeFile, createDirectory } = require('../../utils/file-utlis');

const copy = promisify(ncp);
const partner_token_cmd = require('../partner_cmds/connect').handler;
const { registerExtension } = require('../../apis/extension');
const { 
    validateEmpty,
    checkForVue,
    copyTemplateFiles, 
    installDependencies, 
    replaceGrootWithExtensionName,
    PROJECT_REPOS 
} = require('../../utils/extension-utils')
const { 
    NODE_VUE, NODE_REACT, PYTHON_REACT, PYTHON_VUE, JAVA_REACT, JAVA_VUE 
} = require('../../utils/extension-constant')

const extensionNameQuestion = [
    {
        type: 'input',
        name: 'name',
        message: 'Enter Extension name :',
        validate: validateEmpty
    }
];

const extensionTypeQuestions = [
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
        choices: [NODE_VUE, NODE_REACT, PYTHON_VUE, PYTHON_REACT, JAVA_VUE, JAVA_REACT],
        default: NODE_VUE,
        name: 'project_type',
        message: 'Development Language :',
        validate: validateEmpty
    },
    {
        type: 'list',
        choices: [
            {name: "Vue 2", value: "vue2"}, 
            {name: "Vue 3", value: "vue3"}
        ],
        default: "vue2",
        name: 'vue_version',
        message: 'Vue Version: ',
        when: checkForVue,
        validate: validateEmpty
    }
];
exports.command = 'init';
exports.desc = 'Initialize extension';
exports.builder = function (yargs) {
    return yargs
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



const createProject = async answerObject => {
    try {
        let targetDir = answerObject.targetDir

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
                    
                    if ( answerObject.project_type === JAVA_VUE || answerObject.project_type === JAVA_REACT) {
                        const ymlData = `\n\next :\n  api_key : "${extension_data.client_id}"\n  api_secret : "${extension_data.secret}"\n  scopes : ""\n  base_url : "${answerObject.launch_url}"\n  cluster : "https://${ctx.host}"`
                        fs.writeFileSync(`${targetDir}/src/main/resources/application.yml`, ymlData, options={flag:'a+'})
                    } else {
                        const envData=`EXTENSION_API_KEY="${extension_data.client_id}"\nEXTENSION_API_SECRET="${extension_data.secret}"\nEXTENSION_BASE_URL="${answerObject.launch_url}"\nEXTENSION_CLUSTER_URL="https://${ctx.host}"`;
                        fs.writeFileSync(`${targetDir}/.env`, envData);
                    }
                    await replaceGrootWithExtensionName(targetDir, answerObject);
                }
            },
            {
                title: 'Installing Dependencies',
                task: async ctx => {
                    await installDependencies(answerObject);
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

        process.exit(1);
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
        host: args.host || contextData.host,
        verbose: args.verbose,
    };
    await inquirer.prompt(extensionNameQuestion).then((value) => {
        answers.name =  value.name
    })

    if (args['target-dir']) {
        answers.targetDir = args['target-dir']
        if (answers.targetDir != '.' && fs.existsSync(answers.targetDir)) {
            console.log(chalk.red(`Directory "${answers.targetDir}" already exists. Please choose another`));
            process.exit(1);
        }
    } else {
        answers.targetDir = answers.name
        if (fs.existsSync(answers.targetDir)) {
            console.log(chalk.red(`Folder with the same name as "${answers.targetDir}" already exists. Please choose another name or directory.`));
            process.exit(1);
        }
    }
    
    if (fs.existsSync(path.join(answers.targetDir, '/.git'))) {
        console.log(chalk.red(`Cannot initialize extension at '${path.resolve(answers.targetDir)}', as it already contains Git repository.`));
        process.exit(1);
    }
    prompt_answers = await inquirer.prompt(extensionTypeQuestions);
    if (!contextData.partner_access_token) {
        contextData.partner_access_token = await partner_token_cmd({readOnly: true, ...args});
    }
    answers.launch_url = "http://localdev.fyndx0.de"
    answers.partner_access_token = contextData.partner_access_token;
    answers.project_url = PROJECT_REPOS[prompt_answers.project_type];
    answers = {
        ...answers,
        ...prompt_answers
    }
    await createProject(answers);
};
