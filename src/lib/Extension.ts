import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import execa from 'execa';
import rimraf from 'rimraf';
import which from 'which';

import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import ExtensionService, {
    RegisterExtensionPayloadNew,
} from './api/services/extension.service';

import {
    Object,
    validateEmpty,
    replaceContent,
} from '../helper/extension_utils';

import { createDirectory, writeFile, readFile } from '../helper/file.utils';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { getBaseURL } from './api/services/url';
import {
    installNpmPackages,
    installJavaPackages,
    installPythonDependencies,
} from '../helper/utils';
import Logger from './Logger';

export const NODE_VUE = 'Node + Vue.js';
export const NODE_REACT = 'Node + React.js';
export const PYTHON_VUE = 'Python + Vue.js';
export const PYTHON_REACT = 'Python + React.js';
export const JAVA_VUE = 'Java + Vue.js';
export const JAVA_REACT = 'Java + React.js';

export const PROJECT_REPOS = {
    [NODE_VUE]: 'https://github.com/gofynd/example-extension-javascript.git',
    [NODE_REACT]:
        'https://github.com/gofynd/example-extension-javascript-react.git',
    [PYTHON_VUE]: 'https://github.com/gofynd/example-extension-python-vue.git',
    [PYTHON_REACT]:
        'https://github.com/gofynd/example-extension-python-react.git',
    [JAVA_VUE]: 'https://github.com/gofynd/example-extension-java-vue.git',
    [JAVA_REACT]: 'https://github.com/gofynd/example-extension-java-react.git',
};
export default class Extension {
    private static checkForVue(answers: Object): boolean {
        if (
            answers.project_type === NODE_VUE ||
            answers.project_type === JAVA_VUE ||
            answers.project_type === PYTHON_VUE
        ) {
            return true;
        }
        return false;
    }

    // clone extension boilerplate from github
    private static async copyTemplateFiles(
        targetDirectory: string,
        answers: Object,
    ) {
        try {
            if (!fs.existsSync(targetDirectory)) {
                createDirectory(targetDirectory);
            }
            await execa('git', ['init'], { cwd: targetDirectory });
            await execa(
                'git',
                ['remote', 'add', 'origin', answers.project_url],
                { cwd: targetDirectory },
            );
            if (answers.vue_version === 'vue3') {
                await execa('git', ['pull', 'origin', 'main-vue3:main-vue3'], {
                    cwd: targetDirectory,
                });
            } else {
                await execa('git', ['pull', 'origin', 'main:main'], {
                    cwd: targetDirectory,
                });
            }
            rimraf.sync(`${targetDirectory}/.git`); // unmark as git repo
            return true;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // replaces package name
    private static async replaceGrootWithExtensionName(
        targetDir: string,
        answerObject: Object,
    ): Promise<void> {
        let readMe = readFile(`${targetDir}/README.md`);
        writeFile(
            `${targetDir}/README.md`,
            replaceContent(readMe, 'groot', answerObject.name),
        );

        if (
            answerObject.project_type === JAVA_VUE ||
            answerObject.project_type === JAVA_REACT
        ) {
            let pomXml = readFile(`${targetDir}/pom.xml`);
            writeFile(
                `${targetDir}/pom.xml`,
                replaceContent(pomXml, 'groot', answerObject.name),
            );

            targetDir = `${targetDir}/app`;
        }

        let packageJson = readFile(`${targetDir}/package.json`);
        let packageName = answerObject.name.toLowerCase().replace(/\s/g, '_');
        writeFile(
            `${targetDir}/package.json`,
            replaceContent(packageJson, 'groot', packageName),
        );
    }

    // wrapper function for installing dependencies in extension
    static async installDependencies(answers: Object): Promise<void> {
        let project_type = answers.project_type;
        if (project_type === NODE_VUE || project_type === NODE_REACT) {
            // installing dependencies for Node projects
            await installNpmPackages(answers.targetDir);
        } else if (
            project_type === PYTHON_VUE ||
            project_type === PYTHON_REACT
        ) {
            // installing dependencies for Python projects
            await installNpmPackages(answers.targetDir);
            await installPythonDependencies(answers.targetDir);
        } else if (project_type === JAVA_VUE || project_type === JAVA_REACT) {
            // installing dependencies for java projects
            // await Extension.installNpmPackages(`${answers.targetDir}/app`);
            await installJavaPackages(answers.targetDir);
        }
    }

    // main function for creating extension
    private static async createExtension(
        answers: Object,
        isRegisterExtension: boolean,
    ): Promise<void> {
        try {
            let targetDir = answers.targetDir;

            let spinner = new Spinner('Fetching Template Files');
            try {
                spinner.start();
                await Extension.copyTemplateFiles(targetDir, answers);
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }

            if (isRegisterExtension) {
                spinner = new Spinner('Registering Extension');
                const data: RegisterExtensionPayloadNew = {
                    name: answers.name,
                    base_url: 'http://localdev.fynd.com',
                    // We are just passing this url as temporary when preview url is called it gets updated with the ngrok url
                    extention_type: answers.type.toLowerCase(),
                    // Adding this for backward compatibility for v1.8.X
                    callbacks: {
                        setup: `http://localdev.fynd.com/fp/setup`,
                        install: `http://localdev.fynd.com/fp/install`,
                        auth: `http://localdev.fynd.com/fp/auth`,
                        uninstall: `http://localdev.fynd.com/fp/uninstall`,
                        auto_install: `http://localdev.fynd.com/fp/auto_install`,
                    },
                };
                const { current_user: user } = ConfigStore.get(
                    CONFIG_KEYS.AUTH_TOKEN,
                );
                const activeEmail = user.emails.find(
                    (e) => e.active && e.primary,
                )?.email;
                data.developed_by_name = `${user.first_name} ${user.last_name}`;
                if (activeEmail) {
                    data.contact_email = activeEmail;
                }
                try {
                    spinner.start();
                    let extension_data: Object =
                        await ExtensionService.registerExtensionPartners(data);
                    answers.extension_api_key = extension_data.client_id;
                    answers.extension_api_secret = extension_data.secret;
                    answers.base_url = extension_data.launch_url;
                    spinner.succeed();
                } catch (error) {
                    spinner.fail();
                    throw new CommandError(error.message);
                }
            }

            spinner = new Spinner('Installing Dependencies');
            try {
                spinner.start();
                if (
                    answers.project_type === JAVA_VUE ||
                    answers.project_type === JAVA_REACT
                ) {
                    const ymlData = `\n\next :\n  api_key : "${
                        answers.extension_api_key
                    }"\n  api_secret : "${
                        answers.extension_api_secret
                    }"\n  scopes : ""\n  base_url : "${
                        answers.base_url
                    }"\n  cluster : "${getBaseURL()}"`;
                    fs.writeFileSync(
                        `${answers.targetDir}/src/main/resources/application.yml`,
                        ymlData,
                        { flag: 'a+' },
                    );
                } else {
                    const envData = `EXTENSION_API_KEY="${
                        answers.extension_api_key
                    }"\nEXTENSION_API_SECRET="${
                        answers.extension_api_secret
                    }"\nEXTENSION_BASE_URL="${
                        answers.base_url
                    }"\nEXTENSION_CLUSTER_URL="${getBaseURL()}"`;
                    fs.writeFileSync(`${answers.targetDir}/.env`, envData);
                }
                await Extension.replaceGrootWithExtensionName(
                    answers.targetDir,
                    answers,
                );
                await Extension.installDependencies(answers);
                spinner.succeed();
            } catch (error) {
                spinner.fail();
            }

            let text =
                chalk.green.bold('DONE ') +
                chalk.green.bold('Project ready\n') +
                chalk.yellowBright.bold('NOTE: ') +
                chalk.green.bold(`cd ${targetDir} to continue...`);

            Logger.info(
                boxen(text, { padding: 1, borderColor: 'greenBright' }),
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    // check for system dependencies
    static checkDependencies(project_type: string) {
        const missingDependencies: string[] = [];
        const requiredDependencies: string[] = ['npm'];

        if (project_type === JAVA_REACT || project_type === JAVA_VUE) {
            requiredDependencies.push('mvn');
        }

        if (project_type === PYTHON_REACT || project_type === PYTHON_VUE) {
            const osPlatform = process.platform;

            if (osPlatform === 'darwin' || osPlatform === 'linux') {
                requiredDependencies.push('python3');
            } else if (osPlatform === 'win32') {
                requiredDependencies.push('python');
            }
        }

        for (const dependency of requiredDependencies) {
            try {
                which.sync(dependency);
            } catch (error) {
                missingDependencies.push(dependency);
            }
        }

        if (missingDependencies.length > 0) {
            throw new CommandError(
                `Missing Dependencies: ${missingDependencies.join(
                    ', ',
                )} \nInstall the required dependencies on your system before creating an extension.`,
            );
        }
    }

    // command handler for "extension init"
    public static async initExtensionHandler(options: Object) {
        try {
            let answers: Object = {};

            await inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'Enter Extension name :',
                        validate: validateEmpty,
                    },
                ])
                .then((value) => {
                    answers.name = value.name;
                });
            answers.targetDir = options['targetDir'] || answers.name;

            Extension.checkFolderAndGitExists(answers.targetDir);

            const extensionTypeQuestions = [
                {
                    type: 'list',
                    choices: ['Private', 'Public'],
                    default: 'Private',
                    name: 'type',
                    message: 'Extension type :',
                    validate: validateEmpty,
                },
                {
                    type: 'list',
                    choices: [
                        NODE_VUE,
                        NODE_REACT,
                        PYTHON_VUE,
                        PYTHON_REACT,
                        JAVA_VUE,
                        JAVA_REACT,
                    ],
                    default: NODE_VUE,
                    name: 'project_type',
                    message: 'Development Language :',
                    validate: validateEmpty,
                },
                {
                    type: 'list',
                    choices: [
                        { name: 'Vue 2', value: 'vue2' },
                        { name: 'Vue 3', value: 'vue3' },
                    ],
                    default: 'vue2',
                    name: 'vue_version',
                    message: 'Vue Version: ',
                    when: Extension.checkForVue,
                    validate: validateEmpty,
                },
            ];

            let prompt_answers: Object = await inquirer.prompt(
                extensionTypeQuestions,
            );

            Extension.checkDependencies(prompt_answers.project_type);

            answers.launch_url = 'http://localdev.fyndx0.de';
            answers.project_url = PROJECT_REPOS[prompt_answers.project_type];
            answers = {
                ...answers,
                ...prompt_answers,
            };

            await Extension.createExtension(answers, true);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    private static checkFolderAndGitExists(folderPath: string) {
        if (fs.existsSync(folderPath)) {
            throw new CommandError(
                `Folder at "${path}" already exists. Please choose another name or directory.`,
            );
        }
        if (fs.existsSync(path.join(folderPath, '/.git'))) {
            throw new CommandError(
                `Cannot initialize extension at '${path.resolve(
                    folderPath,
                )}', as it already contains Git repository.`,
            );
        }
        return false;
    }

    public static updateExtensionEnvValue(launch_url: string) {
        let java_env_file_path = path.join(
            'src',
            'main',
            'resources',
            'application.yml',
        );

        if (fs.existsSync('./.env')) {
            let envData = readFile('./.env');
            envData = replaceContent(
                envData,
                `EXTENSION_BASE_URL=.*[\n]`,
                `EXTENSION_BASE_URL="${launch_url}"\n`,
            );
            writeFile('./.env', envData);
        } else if (fs.existsSync(java_env_file_path)) {
            let envData = readFile(java_env_file_path);
            envData = replaceContent(
                envData,
                `base_url.*[\n]`,
                `base_url: '${launch_url}'\n`,
            );
            writeFile(java_env_file_path, envData);
        } else {
            return true;
        }
        return false;
    }

    // command handler for "extension setup"
    public static async setupExtensionHandler(options) {
        try {
            let answers: Object;

            let questions = [
                {
                    type: 'input',
                    name: 'extension_api_key',
                    message: 'Enter Extension API Key :',
                    validate: validateEmpty,
                },
                {
                    type: 'input',
                    name: 'extension_api_secret',
                    message: 'Enter Extension API Secret :',
                    validate: validateEmpty,
                },
                {
                    type: 'list',
                    choices: [
                        NODE_VUE,
                        NODE_REACT,
                        PYTHON_VUE,
                        PYTHON_REACT,
                        JAVA_VUE,
                        JAVA_REACT,
                    ],
                    default: NODE_VUE,
                    name: 'project_type',
                    message: 'Development Language :',
                    validate: validateEmpty,
                },
                {
                    type: 'list',
                    choices: [
                        { name: 'Vue 2', value: 'vue2' },
                        { name: 'Vue 3', value: 'vue3' },
                    ],
                    default: 'vue2',
                    name: 'vue_version',
                    message: 'Vue Version: ',
                    when: Extension.checkForVue,
                    validate: validateEmpty,
                },
            ];

            answers = { ...answers, ...(await inquirer.prompt(questions)) };
            answers.project_url = PROJECT_REPOS[answers.project_type];

            Extension.checkDependencies(answers.project_type);

            let extension_data: Object;
            let spinner = new Spinner('Verifying API Keys');
            try {
                spinner.start();
                extension_data =
                    await ExtensionService.getExtensionDataPartners(
                        answers.extension_api_key,
                    );
                if (!extension_data) {
                    throw new Error();
                }
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(
                    ErrorCodes.INVALID_KEYS.message,
                    ErrorCodes.INVALID_KEYS.code,
                );
            }

            answers.base_url = extension_data.base_url;
            answers.name = extension_data.name;
            answers.targetDir = options['targetDir'] || answers.name;
            Extension.checkFolderAndGitExists(answers.targetDir);

            await Extension.createExtension(answers, false);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
}
