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
    writeContextData
} = require('../../utils/utils');
const {
    validateAppIdAndToken,
    validateThemeAndGroupName
} = require('../../utils/validation-utils');
const { writeFile, createDirectory } = require('../../utils/file-utlis');
const { downloadFile } = require('../../utils/download');
const { extractArchive } = require('../../utils/archive');
const { getThemeV2, getThemeV3 } = require('../../apis/theme');

const copy = promisify(ncp);

function validateEmpty(input) {
    return input !== '';
}
const questions = [
    {
        type: 'input',
        name: 'email',
        message: 'Enter Email ID:',
        validate: validateEmpty
    },
    {
        type: 'password',
        name: 'password',
        mask: '*',
        message: 'Enter Password:',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'app',
        message: 'Enter App ID/App Domain:',
        validate: validateEmpty
    },

    {
        type: 'input',
        name: 'token',
        message: 'Enter token :',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'themeId',
        message: 'Enter theme id :',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'host',
        message: 'Enter host :',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'contextName',
        message: 'Enter context name :',
        validate: validateEmpty
    }
];
exports.command = 'init';
exports.desc = 'Initialize theme';
exports.builder = function (yargs) {
    return yargs
        .options('email', {
            describe: 'User Email'
        })
        .options('password', {
            describe: 'User Password'
        })
        .options('app-id', {
            describe: 'App ID'
        })
        .options('app-token', {
            describe: 'App Token'
        })
        .options('theme-id', {
            describe: 'Theme Id'
        })
        .options('context-name', {
            describe: 'Context name'
        })
        .options('host', {
            describe: 'Specify host for theme'
        })
        .options('verbose', {
            describe: 'Enable verbose logging'
        });
};

async function copyTemplateFiles(templateDirectory, targetDirectory) {
    try {
        if (!fs.existsSync(targetDirectory)) {
            createDirectory(targetDirectory);
        }
        await copy(templateDirectory, targetDirectory, {
            clobber: false
        });
        await execa('git', ['init'], { cwd: targetDirectory });
        writeFile(targetDirectory + '/.gitignore', `.fdk\nnode_modules`);
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function installNpmPackages() {
    // return new Promise(async (resolve, reject) => {
    //     let p = execa('npm', ['i'], { cwd: process.cwd() })
    //     p.stdout.pipe(process.stdout);
    //     p.stderr.pipe(process.stderr);
    //     p.on('error', (e) => {
    //         console.log(`error received-------------`);
    //         reject(e);
    //     });
    //     p.on('end', () => {
    //         console.log('npm i done---------------------0');
    //         resolve();
    //     });
    // });
    await execa('npm', ['i'], { cwd: process.cwd() });
}

async function getThemeSourceFiles(appId, token, themeId, targetDir, host) {
    let zipPath = path.resolve(process.cwd(), targetDir, '.fdk/archive/archive.zip');
    let themeInfo;

    try {
        themeInfo = await getThemeV3(appId, token, themeId, host);
        if (!themeInfo.application || !themeInfo.src.link) {
            return themeInfo;
        }
        await downloadFile(themeInfo.src.link, zipPath);
        await extractArchive({ zipPath, destFolderPath: path.resolve(process.cwd(), 'theme') });
    } catch (e) {
        console.log(e);
    }
    return themeInfo;
}

const createProject = async answerObject => {
    try {
        const isAppId = validatObjectId(answerObject.app);
        const templateDir = path.resolve(__dirname, '../../template');
        let targetDir = process.cwd();

        const tasks = new Listr([
            {
                title: 'Validating App Details',
                task: async ctx => {
                    if (isAppId) {
                        if (answerObject.verbose) {
                            logger('App ID provided', true);
                        }
                        ctx.app = await validateAppIdAndToken(
                            answerObject.app,
                            answerObject.token,
                            answerObject.host,
                            answerObject.verbose
                        );
                        if (!ctx.app) {
                            return Promise.reject(new Error('Invalid App Id/token.'));
                        }
                    } else {
                        return Promise.reject(new Error('Invalid App Id/token.'))
                    }
                }
            },
            {
                title: 'Login Initiated',
                task: async ctx => {
                    try {
                        ctx.cookie = await loginUserWithEmail(
                            answerObject.email,
                            answerObject.password,
                            answerObject.host,
                            answerObject.verbose
                        );
                    } catch (err) {
                        return Promise.reject(new Error(normalizeError(err).message))
                    }
                }
            },
            {
                title: 'Fetching Template Files',
                task: async ctx => {
                    const appId = answerObject.app || ctx.app._id;
                    await copyTemplateFiles(templateDir, targetDir);
                    ctx.themeData = await getThemeSourceFiles(
                        appId,
                        answerObject.token,
                        answerObject.themeId,
                        targetDir,
                        answerObject.host
                    );
                    // if (!ctx.themeData.application || !fs.existsSync(path.resolve(process.cwd(), 'package.json'))) {
                    //     await copyTemplateFiles(templateDir, targetDir);
                    // }
                    let list = _.get(ctx.themeData, 'config.list', []);
                    let current = _.get(ctx.themeData, 'config.current', 'default');
                    let preset = _.get(ctx.themeData, 'config.preset', {});
                    let information = { features: _.get(ctx.themeData, 'information.features', []) };
                    writeFile(
                        process.cwd() + '/theme/config/settings_data.json',
                        JSON.stringify({ list, current, preset, information }, undefined, 2)
                    );

                    writeFile(
                        process.cwd() + '/theme/config/settings_schema.json',
                        JSON.stringify(_.get(ctx.themeData, 'config.global_schema', { props: [] }), undefined, 2)
                    );
                }
            },
            {
                title: 'Generating Configuration Files',
                task: ctx => {
                    const { themeData } = ctx;
                    ctx.theme = generateConfigJSON(
                        {
                            ...answerObject,
                            colors: themeData.colors,
                            styles: themeData.styles,
                            font: themeData.font
                        },
                        targetDir
                    );
                }
            },
            {
                title: 'Storing context',
                task: async ctx => {
                    createDirectory(targetDir + '/.fdk');
                    const contextData = { current_context: '', contexts: {} };
                    writeFile(
                        targetDir + '/.fdk/context.json',
                        JSON.stringify(contextData, undefined, 2)
                    );
                    const contextObj = {
                        appId: answerObject.app || ctx.app_id,
                        token: answerObject.token,
                        themeId: answerObject.themeId,
                        cookie: ctx.cookie,
                        host: answerObject.host,
                        email: answerObject.email,
                        name: ctx.themeData.information.name,
                        domain: ctx.app.domain.name,
                        company_id: ctx.app.company_id
                    };
                    writeContextData(answerObject.contextName, contextObj, targetDir + '/.fdk/context.json');
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
                title: 'Installing Dependencies',
                task: async ctx => {
                    await installNpmPackages();
                    if (fs.existsSync(process.cwd() + '/theme/package.json')) {
                        writeFile(process.cwd() + '/package.json', fs.readFileSync(process.cwd() + '/theme/package.json'))
                        rimraf.sync(process.cwd() + '/theme/package.json')
                    }
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
                if (fs.existsSync(answerObject.name)) {
                    rimraf.sync(answerObject.name);
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
    let answers = {};

    if (
        args.email &&
        args.password &&
        args['app-id'] &&
        args['app-token'] &&
        args['theme-id'] &&
        args['context-name'] &&
        args.host
    ) {
        answers = {
            email: args.email,
            directory: args.dir ? args.dir : '',
            password: args.password,
            app: args['app-id'],
            token: args['app-token'],
            themeId: args['theme-id'],
            contextName: args['context-name'],
            host: args.host,
            verbose: args.verbose
        };
        await createProject(answers);
    }
    if (Object.keys(args).length === 2) {
        inquirer.prompt(questions).then(async answers => {
            await createProject(answers);
        });
    } else {
        const recieved = [];
        if (args.email) {
            recieved.push('email');
        }
        if (args.password) {
            recieved.push('password');
        }
        if (args['app-id']) {
            recieved.push('app-id');
        }
        if (args['app-token']) {
            recieved.push('app-token');
        }
        if (args['theme-id']) {
            recieved.push('theme-id');
        }
        if (args['context-name']) {
            recieved.push('context-name');
        }
        if (args['host']) {
            recieved.push('host');
        }
        console.log('Insufficient options provided');
        console.log('Got:', recieved.join(' '));
        console.log('Required: email,password,app-id,app-token,theme-id,context-name,host');
    }
};
