const inquirer = require('inquirer');
const fs = require('fs')
const Listr = require('listr');
const chalk = require('chalk');
const path = require('path');
const Box = require('cli-box')

const { 
    validateEmpty, 
    copyTemplateFiles,
    installDependencies,
    replaceGrootWithExtensionName, 
    PROJECT_REPOS 
} = require('../../utils/extension-utils');
const { getExtensionData } = require('../../apis/extension');
const { 
    NODE_REACT, NODE_VUE, PYTHON_REACT, PYTHON_VUE, JAVA_REACT, JAVA_VUE 
} = require("../../utils/extension-constant");
const {
    getActiveContext, getDefaultContextData, writeContextData,
} = require('../../utils/utils');
const { createDirectory, writeFile } = require('../../utils/file-utlis');
const { logger } = require('../../utils/logger');
const rimraf = require('rimraf');



exports.command = 'setup';
exports.desc = 'Setup Development Environment for Extension Created on partners.fynd.com';
exports.builder = function (yargs) {
    return yargs
        .options('target-dir', {
            describe: 'Target directory for creating extension repository',
        })
        .options('context-name', {
            describe: 'Context name',
        })
        .options('host', {
            describe: 'Specify host for extension',
        })
        .options('verbose', {
            describe: 'Enable verbose logging',
        });
};

const QUESTIONS = [
    {
        type: 'input',
        name: 'extension_api_key',
        message: 'Enter Extension API Key :',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'extension_api_secret',
        message: "Enter Extension API Secret :",
        validate: validateEmpty
    },
    {
        type: 'list',
        choices: [NODE_VUE, NODE_REACT, PYTHON_VUE, PYTHON_REACT, JAVA_VUE, JAVA_REACT],
        default: NODE_VUE,
        name: 'project_type',
        message: 'Development Language :',
        validate: validateEmpty
    }
]

exports.handler = async (args) => {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
        contextData = getActiveContext(true);
    }
    catch(err) { }

    let answers = {
        host: args.host || contextData.host,
        verbose: args.verbose
    };

    answers = {...answers, ...await inquirer.prompt(QUESTIONS)}
    answers.project_url = PROJECT_REPOS[answers.project_type]

    let extension_data = null;
    await new Listr([
        {
            title: "Verifying API keys",
            task: async ctx => {
                extension_data = await getExtensionData(answers.host, answers.extension_api_key, answers.extension_api_secret, answers.verbose)
            }
        }
    ]).run()
    if (!extension_data) {
        console.log(chalk.red('Invalid API Key or API Secret. Please use valid keys.'));
        process.exit(1);
    }

    answers.base_url = extension_data.base_url
    answers.name = extension_data.name

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

    const tasks = new Listr([
        {
            title: 'Fetching Template Files',
            task: async ctx => {
                await copyTemplateFiles(answers.targetDir, answers.project_url);
            }
        },
        {
            title: 'Storing Context',
            task: async ctx => {
                let contextData = getDefaultContextData();
                if (!fs.existsSync(path.join(answers.targetDir, '.fdk'))) {
                    createDirectory(path.join(answers.targetDir, '.fdk'));
                    writeFile(
                        path.join(answers.targetDir, '.fdk', 'context.json'),
                        JSON.stringify(contextData, undefined, space=2)
                    )
                }
                answers.contextName = answers.contextName || 'default'
                const contextObject = {
                    extension_api_key: answers.extension_api_key,
                    host: answers.host
                }
                writeContextData(
                    answers.contextName, 
                    contextObject, 
                    path.join(answers.targetDir, '.fdk', 'context.json'),
                    true 
                );
                if (answers.verbose) {
                    logger(
                        `context.json written successfully with the following data \n ${JSON.stringify(
                            contextObject,
                            undefined,
                            2
                        )}`,
                        true
                    );
                }
                
            }
        },
        {
            title: 'Installing Dependencies',
            task: async ctx => {
                if ( answers.project_type === JAVA_VUE || answers.project_type === JAVA_REACT) {
                    const ymlData = `\n\next :\n  api_key : "${answers.extension_api_key}"\n  api_secret : "${answers.extension_api_secret}"\n  scopes : ""\n  base_url : "${answers.base_url}"\n  cluster : "https://${answers.host}"`;
                    fs.writeFileSync(`${answers.targetDir}/src/main/resources/application.yml`, ymlData, options={flag:'a+'});
                } else {
                    const envData=`EXTENSION_API_KEY="${answers.extension_api_key}"\nEXTENSION_API_SECRET="${answers.extension_api_secret}"\nEXTENSION_BASE_URL="${answers.base_url}"\nEXTENSION_CLUSTER_URL="https://${answers.host}"`;
                    fs.writeFileSync(`${answers.targetDir}/.env`, envData);
                }
                await replaceGrootWithExtensionName(answers.targetDir, answers);
                await installDependencies(answers);
            }
        }
    ]);

    try {
        await tasks.run().then(
            ctx => {
                var b5 = Box('75x5', {
                    text:
                        chalk.green.bold('DONE ') + 
                        chalk.green.bold('Project ready\n') +
                        chalk.yellowBright.bold('NOTE ') + 
                        chalk.green.bold('cd ' + answers.targetDir + ' to continue ...')
                });
                console.log(b5.toString());
            }
        ).catch(
            error => {
                console.log(chalk.red(error.message));
                if (fs.existsSync(answers.targetDir)) {
                    rimraf.sync(answers.targetDir);
                }
                process.exit(1);
            }
        )
    } catch(error) {
        console.log(chalk.red(error.message));
        process.exit(1);
    }
}