const chalk = require('chalk');
var Box = require('cli-box');
const mongoose = require('mongoose');
const fs = require('fs');
const rimraf = require('rimraf');
const ncp = require('ncp');
const path = require('path');
const execa = require('execa');
const { promisify } = require('util');
const inquirer = require('inquirer');
const Listr = require('listr');
const compiler = require('vue-template-compiler');
const { handler: syncHandler } = require('./sync');
const requireFromString = require('require-from-string');
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
    validateThemeV2
} = require('../../utils/validation-utils');
const { writeFile, createDirectory, readFile } = require('../../utils/file-utlis');
const { downloadFile } = require('../../utils/download');
const { extractArchive } = require('../../utils/archive');
const { getThemeV2, createThemeV3, applyThemeV2 } = require('../../apis/theme');
const { sanitizeThemeName } = require('../../utils/themeUtils');

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
        name: 'themeName',
        message: 'Enter Theme Name:',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'contextName',
        message: 'Enter Context Name:',
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
        message: 'Enter App token :',
        validate: validateEmpty
    },
    {
        type: 'input',
        name: 'host',
        message: 'Enter host :',
        validate: validateEmpty
    }
];
exports.command = 'new';
exports.desc = 'Create new theme';
exports.builder = function (yargs) {
    return yargs
        .options('theme-name', {
            describe: 'Theme Name',
            default: ''
        })
        .options('context-name', {
            describe: 'Context Name',
            default: ''
        })
        .options('email', {
            describe: 'User Email',
            default: ''
        })
        .options('password', {
            describe: 'User Password',
            default: ''
        })
        .options('app-id', {
            describe: 'App ID',
            default: ''
        })
        .options('app-token', {
            describe: 'App Token',
            default: ''
        })
        .options('host', {
            describe: 'Specify host for theme',
            default: ''
        })
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
    await execa('npm', ['i'], { cwd: process.cwd() });
}

async function getAvailableSections() {
    let sectionsFiles = [];
    try {
        sectionsFiles = fs.readdirSync(`../../template/theme/sections`).filter(o => o != 'index.js');
    } catch (err) { }
    let pArr = sectionsFiles.map(async (f) => {
        let image_section = compiler.parseComponent(readFile(`../../template/theme/sections/${f}`));
        let sectionSettings = await new Promise((resolve, reject) => {
            require("@babel/core").transform(
                image_section.script.content,
                {
                    plugins: ["@babel/plugin-transform-modules-commonjs"],
                },
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    try {
                        let modules = requireFromString(result.code);
                        return resolve(modules.settings);
                    } catch (e) {
                        return reject(e);
                    }
                });
        });
        return sectionSettings;
    });
    return Promise.all(pArr);
};

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
                        ctx.app = await validateAppIdAndToken(
                            answerObject.app,
                            answerObject.token,
                            answerObject.host,
                        );
                        if (!ctx.app) {
                            return Promise.reject(new Error('Invalid App Id/token.'));
                        }
                    } else {
                        return Promise.reject(new Error('Invalid App Id /token'));
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
                            answerObject.host
                        );
                    } catch (err) {
                        return Promise.reject(new Error(normalizeError(err).message))
                    }
                }
            },
            {
                title: 'Creating Theme',
                task: async ctx => {
                    try {
                        let available_sections = await getAvailableSections();
                        ctx.themeData = await createThemeV3(

                            answerObject.host,
                            answerObject.app,
                            answerObject.token,
                            {
                                information: {
                                    name: answerObject.themeName
                                },
                                available_sections
                            },
                            ctx.cookie
                        );
                    } catch (err) {
                        return Promise.reject(new Error(normalizeError(err).message))
                    }
                }
            },
            {
                title: 'Creating Template Files',
                task: async ctx => {
                    await copyTemplateFiles(templateDir, targetDir);
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
                    if (!fs.existsSync('./.fdk')) {
                        createDirectory('./.fdk');
                    }
                    const path = './.fdk/context.json';
                    if (!fs.existsSync(path)) {
                        const contextData = { current_context: '', contexts: {} };
                        writeFile(path, JSON.stringify(contextData, undefined, 2));
                    }
                    const contextObj = {
                        appId: answerObject.app || ctx.app_id,
                        token: answerObject.token,
                        themeId: ctx.themeData._id,
                        cookie: ctx.cookie,
                        host: answerObject.host,
                        email: answerObject.email,
                        name: answerObject.themeName,
                        domain: ctx.app.domain.name
                    };
                    writeContextData(answerObject.contextName, contextObj, targetDir + '/.fdk/context.json');
                }
            },
            {
                title: 'Installing Dependencies',
                task: async ctx => {
                    await installNpmPackages();
                    let packageJSON = JSON.parse(readFile(`${process.cwd()}/package.json`));
                    packageJSON.name = sanitizeThemeName(answerObject.themeName);
                    writeFile(`${process.cwd()}/package.json`, JSON.stringify(packageJSON, undefined, 2))
                }
            },
            {
                title: 'Syncing template',
                task: async ctx => {
                    console.log(syncHandler)
                    await syncHandler({isNew: true});
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
                if (fs.existsSync(answerObject.contextName)) {
                    rimraf.sync(answerObject.contextName);
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
        args['theme-name'] &&
        args['context-name'] &&
        args.email &&
        args.password &&
        args['app-id'] &&
        args['app-token'] &&
        args.host
    ) {
        answers = {
            themeName: args['theme-name'],
            contextName: args['context-name'],
            email: args.email,
            password: args.password,
            app: args['app-id'],
            token: args['app-token'],
            host: args.host
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
        if (args['theme-name']) {
            recieved.push('theme-name');
        }
        if (args['context-name']) {
            recieved.push('context-name');
        }
        if (args['app-id']) {
            recieved.push('app-id');
        }
        if (args['app-token']) {
            recieved.push('app-token');
        }
        if (args['host']) {
            recieved.push('host');
        }
        console.log('Insufficient options provided');
        console.log('Got:', recieved.join(' '));
        console.log('Required: theme-name,context-name,email,password,app-id,app-token,host');
    }
};