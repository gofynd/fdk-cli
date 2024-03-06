import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import execa from 'execa';
import rimraf from 'rimraf';
import which from 'which';

import Partner from './Partner';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import ExtensionService, { RegisterExtensionPayloadNew } from './api/services/extension.service';

import {
    Object,
    validateEmpty,
    replaceContent,
    getPartnerAccessToken,
} from '../helper/extension_utils';

import { createDirectory, writeFile, readFile } from '../helper/file.utils';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { getBaseURL } from './api/services/url';
import {
    installNpmPackages,
    installJavaPackages,
    installPythonDependencies,
} from '../helper/utils';
import semver from 'semver';
import { CLI_EXT_VER_FOR_PTOKEN } from '../helper/constants';

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
            const notPartnerTokenRemovalVersion = answers.notPartnerTokenPltfmVersion || (await Extension.isPartnerTokenCliVersion()).notPartnerTokenPltfmVersion;
            // This variable is just condition matching to these will be only used until v1.10.0 is deployed on all cluster after that will be needed to remove. currently using just for backward compatibility
            if (isRegisterExtension && notPartnerTokenRemovalVersion) {
                spinner = new Spinner('Registering Extension');
                try {
                    spinner.start();
                    let extension_data: Object =
                        await ExtensionService.registerExtension(
                            answers.partner_access_token,
                            {
                                name: answers.name,
                                base_url: 'http://localdev.fynd.com',
                                extention_type: answers.type.toLowerCase(),
                            },
                        );
                    answers.extension_api_key = extension_data.client_id;
                    answers.extension_api_secret = extension_data.secret;
                    answers.base_url = extension_data.launch_url;
                    spinner.succeed();
                } catch (error) {
                    spinner.fail();
                    throw new CommandError(error.message);
                }
            }
            else if (isRegisterExtension && !notPartnerTokenRemovalVersion){
                spinner = new Spinner('Registering Extension');
                const data: RegisterExtensionPayloadNew = {
                    name: answers.name,
                    base_url: 'http://localdev.fynd.com',
                    // We are just passing this url as temporary when preview url is called it gets updated with the ngrok url
                    extention_type: answers.type.toLowerCase(),
                }
                const { current_user: user } = ConfigStore.get(
                    CONFIG_KEYS.AUTH_TOKEN,
                );
                const activeEmail = 
                    user.emails.find((e) => e.active && e.primary)?.email;
                data.developed_by_name = `${user.first_name} ${user.last_name}`;
                if(activeEmail){
                data.contact_email = activeEmail;
                }
                try{
                    let extension_data: Object = await ExtensionService.registerExtensionPartners(data);
                    answers.extension_api_key = extension_data.client_id;
                    answers.extension_api_secret = extension_data.secret;
                    answers.base_url = extension_data.launch_url;
                    spinner.succeed();
                }
                catch(err){
                    spinner.fail();
                    throw new CommandError(err.message);
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

            console.log(
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
            let partner_access_token = getPartnerAccessToken();
            const {notPartnerTokenPltfmVersion, platformVersion} = await Extension.isPartnerTokenCliVersion();

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

            if (options['targetDir']) {
                answers.targetDir = options['targetDir'];
                if (
                    answers.targetDir != '.' &&
                    fs.existsSync(answers.targetDir)
                ) {
                    throw new CommandError(
                        `Directory "${answers.targetDir}" already exists. Please choose another`,
                    );
                }
            } else {
                answers.targetDir = answers.name;
                if (fs.existsSync(answers.targetDir)) {
                    throw new CommandError(
                        `Folder with the same name as "${answers.targetDir}" already exists. Please choose another name or directory.`,
                    );
                }
            }

            if (fs.existsSync(path.join(answers.targetDir, '/.git'))) {
                throw new CommandError(
                    `Cannot initialize extension at '${path.resolve(
                        answers.targetDir,
                    )}', as it already contains Git repository.`,
                );
            }

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

            if (!partner_access_token && notPartnerTokenPltfmVersion) {
                partner_access_token = (
                    await Partner.connectHandler({ readOnly: true, ...options })
                ).partner_access_token;
            }

            answers.launch_url = 'http://localdev.fyndx0.de';
            answers.partner_access_token = partner_access_token;
            answers.project_url = PROJECT_REPOS[prompt_answers.project_type];
            answers = {
                ...answers,
                ...prompt_answers,
            };
            answers.platform_version = platformVersion;

            await Extension.createExtension(answers, true);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    // command handler for "extension setup"
    public static async setupExtensionHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();
            const {notPartnerTokenPltfmVersion,platformVersion} = await Extension.isPartnerTokenCliVersion();
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

            if(!notPartnerTokenPltfmVersion){
               questions.splice(1,1);
               // Removing the api specret question as it will not be required for platform version greater than v1.10.0
            }

            answers = { ...answers, ...(await inquirer.prompt(questions)) };
            answers.project_url = PROJECT_REPOS[answers.project_type];

            Extension.checkDependencies(answers.project_type);

            if (!partner_access_token && notPartnerTokenPltfmVersion) {
                partner_access_token = (
                    await Partner.connectHandler({ readOnly: true, ...options })
                ).partner_access_token;
            }

            let extension_data: Object;
            let spinner = new Spinner('Verifying API Keys');
            try {
                spinner.start();
                if(notPartnerTokenPltfmVersion){
// This is just been kept for backward compatibility as of now once v1.10.0 gets deployed on all cluster please remove this
                    extension_data = await ExtensionService.getExtensionData(
                        answers.extension_api_key,
                        answers.extension_api_secret,
                        partner_access_token,
                    );
                }
                else{
                    extension_data = await ExtensionService.getExtensionDataPartners(answers.extension_api_key);
                }
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

            if (options['targetDir']) {
                answers.targetDir = options['targetDir'];
                if (
                    answers.targetDir != '.' &&
                    fs.existsSync(answers.targetDir)
                ) {
                    throw new CommandError(
                        `Directory "${answers.targetDir}" already exists. Please choose another`,
                    );
                }
            } else {
                answers.targetDir = answers.name;
                if (fs.existsSync(answers.targetDir)) {
                    throw new CommandError(
                        `Folder with the same name as "${answers.targetDir}" already exists. Please choose another name or directory.`,
                    );
                }
            }
            answers.platform_version = platformVersion;
            answers.notPartnerTokenPltfmVersion = notPartnerTokenPltfmVersion;
            await Extension.createExtension(answers, false);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async isPartnerTokenCliVersion () {
        const platformVersion = await ExtensionService.getFyndPlatformVersion();
        const notPartnerTokenPltfmVersion = semver.lte(platformVersion?.version || '1.0.0', CLI_EXT_VER_FOR_PTOKEN);
        return {notPartnerTokenPltfmVersion,platformVersion};
    }
}
