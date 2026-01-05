import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

import { getPlatformUrls } from './api/services/url';
import Spinner from '../helper/spinner';
import { OutputFormatter, successBox } from '../helper/formatter';
import CommandError, { ErrorCodes } from './CommandError';
import ExtensionService, {
    RegisterExtensionPayloadNew,
} from './api/services/extension.service';

import {
    Object,
    validateEmpty,
    replaceContent,
    selectExtensionFromList,
    checkAndValidatePaymentSlug
} from '../helper/extension_utils';

import { createDirectory, writeFile, readFile } from '../helper/file.utils';
import ConfigStore, { CONFIG_KEYS } from './Config';
import {
    installNpmPackages,
    installJavaPackages,
    checkRequiredDependencies,
} from '../helper/utils';
import Logger from './Logger';
import urljoin from 'url-join';
import Debug from './Debug';
import {
    TEMP_DIR_NAME,
    EXTENSION_CONTEXT_FILE_NAME,
    EXTENSION_BRANCH,
    TEMPLATES,
    INIT_ACTIONS,
    LAUNCH_TYPES,
    getRepoUrlForTemplate,
    getTemplateChoices,
    INIT_ACTION_LIST,
    PROJECT_REPOS
} from '../helper/constants';
import { cloneGitRepository } from '../helper/clone_git_repository';

export default class Extension {

    /**
     * Handler for initializing an extension. Handles user prompts, template selection, and extension creation/registration.
     * @param {Object} options - Options passed from the CLI command.
     */
    public static async initExtensionHandler(options: Object) {
        let answers: Object = {};
        try {
            let selected_ext_type;
            let action = INIT_ACTIONS.create_extension;

            // Checking required dependency
            checkRequiredDependencies([
                {
                    name: 'npm',
                    errorMessage: 'Please Install NPM to create Node.js based extension. Refer https://docs.npmjs.com/downloading-and-installing-node-js-and-npm to install Node.js'
                }
            ])

            const template = options.template;
            let launchTypes;
            if (!!template) {
                if (!Object.keys(TEMPLATES).includes(template)) {
                    throw new CommandError(
                        "Invalid template passed. Available options are: " + Object.keys(TEMPLATES).join(", ")+"",
                        ErrorCodes.INVALID_INPUT.code
                    );
                }
                const templateObj = TEMPLATES[template];
                launchTypes = templateObj.launchTypes;
            }
            const extensionList = await ExtensionService.getExtensionList(1, 9999, launchTypes);

            // If developer already has extensions in their organization, provide option to either:
            // 1. Create a new extension
            // 2. Select an existing extension to set up boilerplate code
            if(extensionList.items.length){
                action = await Extension.confirmInitAction();
            }
            
            let isExtensionNameFixed = false;

            let prompt_answers: Object = {};
            // if developer wants to select from existing extension
            if(action === INIT_ACTIONS.select_extension){
                const selected_extension = await selectExtensionFromList(extensionList);
                const selected_ext_api_key = selected_extension.extension.id;
                const extensionDetails = await ExtensionService.getExtensionDataPartners(selected_ext_api_key);
                selected_ext_type = extensionDetails.extention_type;
                const selected_ext_launch_type = extensionDetails.launch_type;
                
                // set answers for createExtension function, this will be use to set data in extension config
                answers.name = selected_extension.extension.name;
                answers.type = selected_ext_type;
                answers.extension_api_key = selected_ext_api_key;
                answers.extension_api_secret = extensionDetails.client_data.secret[0];
                isExtensionNameFixed = true;
                // Set launch_type in prompt_answers for later template selection
                prompt_answers.launch_type = selected_ext_launch_type;
                
                // Extract payment_mode_slug from existing extension config if available
                if (selected_ext_launch_type === LAUNCH_TYPES.PAYMENT && extensionDetails.config?.payment_mode_slug) {
                    prompt_answers.payment_mode_slug = extensionDetails.config.payment_mode_slug;
                }
            } else {
                // ask new extension name
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
                        answers.name = String(value.name).trim();
                    });
            }
            answers.targetDir = options['targetDir'] || answers.name;

            Extension.checkFolderAndGitExists(answers.targetDir, isExtensionNameFixed);

            const extensionTypeQuestions = [];

            // If user wants to create new extension then ask type else it is already set in above section
            if (action === INIT_ACTIONS.create_extension) {
                extensionTypeQuestions.push({
                    type: 'list',
                    choices: ['Private', 'Public'],
                    default: 'Private',
                    name: 'type',
                    message: 'Extension type :',
                    validate: validateEmpty,
                });

                extensionTypeQuestions.push({
                    type: 'list',
                    choices: Object.values(LAUNCH_TYPES),
                    default: LAUNCH_TYPES.COMPANY,
                    name: 'launch_type',
                    message: 'Extension launch type :',
                    validate: validateEmpty,
                });
            }

            if (extensionTypeQuestions.length > 0) {
                prompt_answers = await inquirer.prompt(
                    extensionTypeQuestions,
                );
            }

            // If launch type is Payment, ask for payment mode slug right after launch type selection
            // Only ask for new extensions, not when selecting existing extensions
            if (prompt_answers.launch_type === LAUNCH_TYPES.PAYMENT && action === INIT_ACTIONS.create_extension) {
                const paymentModeAnswer = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'payment_mode_slug',
                        message: 'Enter Payment Mode Slug:',
                        validate: checkAndValidatePaymentSlug,
                    },
                ]);
                prompt_answers = { ...prompt_answers, ...paymentModeAnswer };
            }

            if(template){
                const selectedLaunchType = prompt_answers.launch_type;
                if(TEMPLATES[template].launchTypes.includes(selectedLaunchType)){
                    prompt_answers.project_type = TEMPLATES[template].name;
                } else {
                    throw new CommandError(
                        `Invalid Extension launch type for "${template}" template. Available options are:  ${TEMPLATES[template].launchTypes.join(", ")}`,
                        ErrorCodes.INVALID_INPUT.code
                    );
                }

            } else {
                // Always prompt for template selection after launch_type is set
                const templateAnswer = await inquirer.prompt([
                    Extension.getTemplateQuestion(prompt_answers.launch_type || LAUNCH_TYPES.COMPANY)
                ]);
                prompt_answers = { ...prompt_answers, ...templateAnswer };
            }

            if(action === INIT_ACTIONS.select_extension){
                prompt_answers.type = selected_ext_type;
            }

            // if (prompt_answers.project_type === TEMPLATES['java-react'].name || prompt_answers.project_type === TEMPLATES['java-vue'].name) {
            //     checkRequiredDependencies([
            //         {
            //             name: 'mvn',
            //             errorMessage: 'Please Install Maven to create Java based extension. Refer https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html to install Maven'
            //         }
            //     ])   
            // }

            answers.launch_url = 'http://localdev.fyndx0.de';
            answers.project_url = getRepoUrlForTemplate(prompt_answers.project_type);
            answers = {
                ...answers,
                ...prompt_answers,
            };
            
            await Extension.createExtension(answers, action === INIT_ACTIONS.create_extension);
        } catch (error) {
            // Cleanup: Remove the target directory if it was created
            try {
                if (answers && answers.targetDir && fs.existsSync(answers.targetDir)) {
                    fs.removeSync(answers.targetDir);
                    Debug(`Cleaned up directory: ${answers.targetDir}`);
                }
            } catch (cleanupError) {
                Debug(`Failed to cleanup directory: ${answers?.targetDir}. Error: ${cleanupError.message}`);
            }
            // Suggest running in Debug mode
            let message = error && error.message ? error.message : String(error);
            message += `\n${chalk.yellow('Tip:')} Try running the command again with ${chalk.cyan('--debug')} for more details.`;
            throw new CommandError(message, error.code);
        }
    }

    /**
     * Copies template files from the remote repository to the target directory using the cloneGitRepository utility.
     * @param {string} targetDirectory - The directory where the template files will be copied.
     * @param {Object} answers - The answers object containing project details.
     * @returns {Promise<boolean>} - Resolves true if successful, rejects on error.
     */
    private static async copyTemplateFiles(
        targetDirectory: string,
        answers: Object,
      ) {
        try {
          // Use the cloneGitRepository utility function with EXTENSION_BRANCH
          await cloneGitRepository(answers.project_url, targetDirectory, EXTENSION_BRANCH);
          Debug(`All extension files moved successfully.`);
          return true;
        } catch (error) {
          return Promise.reject(error);
        }
      }

    /**
     * Replaces occurrences of 'groot' with the extension name in README, pom.xml, and package.json files.
     * @param {string} targetDir - The target directory of the extension.
     * @param {Object} answerObject - The answers object containing project details.
     * @returns {Promise<void>}
     */
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
            answerObject.project_type === TEMPLATES['java-vue'].name ||
            answerObject.project_type === TEMPLATES['java-react'].name
        ) {
            let pomXml = readFile(`${targetDir}/pom.xml`);
            writeFile(
                `${targetDir}/pom.xml`,
                replaceContent(pomXml, 'groot', answerObject.name),
            );
            targetDir = `${targetDir}/frontend`;
        }

        let packageJson = readFile(`${targetDir}/package.json`);
        let packageName = answerObject.name.toLowerCase().replace(/\s/g, '_');
        writeFile(
            `${targetDir}/package.json`,
            replaceContent(packageJson, 'groot', packageName),
        );
    }

    /**
     * Updates the extension context file with API key and secret.
     * @param {string} targetDir - The target directory of the extension.
     * @param {string} extension_api_key - The extension API key.
     * @param {string} extension_api_secret - The extension API secret.
     */
    private static async updateExtensionContextFile(
        targetDir: string,
        extension_api_key: string, 
        extension_api_secret: string,
        launch_type: string
    ){
        const extensionContext = {
            EXTENSION_API_KEY: extension_api_key,
            EXTENSION_API_SECRET: extension_api_secret,
            LAUNCH_TYPE: launch_type
        };

        fs.writeFileSync(path.join(targetDir, EXTENSION_CONTEXT_FILE_NAME), JSON.stringify(extensionContext, null, 4));
    }

    /**
     * Installs project dependencies based on the selected template type (Node or Java).
     * @param {Object} answers - The answers object containing project details.
     * @returns {Promise<void>}
     */
    static async installDependencies(answers: Object): Promise<void> {
        let project_type = answers.project_type;
        if (
            project_type === TEMPLATES['node-vue'].name ||
            project_type === TEMPLATES['node-react'].name ||
            project_type === TEMPLATES['payment-node-react'].name // Payment extension support
        ) {
            // installing dependencies for Node projects
            await installNpmPackages(answers.targetDir);
            //added to support new boilerplate structure
            await installNpmPackages(path.join(answers.targetDir, 'frontend'));
        } else if (project_type === TEMPLATES['java-vue'].name || project_type === TEMPLATES['java-react'].name) {
            // installing dependencies for java projects
            await installNpmPackages(path.join(answers.targetDir, 'frontend'));
            await installJavaPackages(answers.targetDir);
        }
    }

    /**
     * Creates a new extension project, optionally registers it, and installs dependencies.
     * @param {Object} answers - The answers object containing project details.
     * @param {boolean} isRegisterExtension - Whether to register the extension with the platform.
     * @returns {Promise<void>}
     */
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

            spinner = new Spinner('Installing Dependencies');
            try {
                spinner.start();
                await Extension.installDependencies(answers);
                spinner.succeed();
            } catch (error) {
                Debug(JSON.stringify(error));
                spinner.fail();
            }

            if (isRegisterExtension) {
                spinner = new Spinner('Registering Extension');
                const data: RegisterExtensionPayloadNew = {
                    name: answers.name,
                    base_url: 'http://localdev.fynd.com',
                    // We are just passing this url as temporary when preview url is called it gets updated with the tunnel url
                    extention_type: answers.type.toLowerCase(),
                    // Adding this for backward compatibility for v1.8.X
                    callbacks: {
                        setup: `http://localdev.fynd.com/fp/setup`,
                        install: `http://localdev.fynd.com/fp/install`,
                        auth: `http://localdev.fynd.com/fp/auth`,
                        uninstall: `http://localdev.fynd.com/fp/uninstall`,
                        auto_install: `http://localdev.fynd.com/fp/auto_install`,
                    },
                    launch_type: answers.launch_type.toLowerCase()
                };

                // Add config with payment_mode_slug for Payment launch type
                if (answers.launch_type === LAUNCH_TYPES.PAYMENT && answers.payment_mode_slug) {
                    data.config = {
                        payment_mode_slug: answers.payment_mode_slug
                    };
                }

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
                    answers.extension_api_secret = extension_data.secret[0];
                    answers.base_url = extension_data.base_url;
                    spinner.succeed();
                } catch (error) {
                    spinner.fail();
                    throw new CommandError(error.message);
                }
            }

            // Update context file and replace groot after registration (when api key/secret are available)
            try {
                await Extension.updateExtensionContextFile(
                    answers.targetDir,
                    answers.extension_api_key,
                    answers.extension_api_secret,
                    answers.launch_type.toLowerCase()
                );
                await Extension.replaceGrootWithExtensionName(
                    answers.targetDir,
                    answers,
                );
            } catch (error) {
                Debug(JSON.stringify(error));
            }

            const organizationId = ConfigStore.get(CONFIG_KEYS.ORGANIZATION);
            const createDevelopmentCompanyFormURL = organizationId
                ? urljoin(
                      getPlatformUrls().partners,
                      'organizations',
                      organizationId,
                      'extensions',
                      'overview',
                      answers.extension_api_key,
                      '?created=true'
                  )
                : getPlatformUrls().partners;
            let text =
                chalk.green(`Success! ${isRegisterExtension ? 'Created' : 'Initiated'} your extension at `) + chalk.bold.blue(targetDir) +
                chalk.green('\nInside that directory, you can run several commands:\n\n') +
                `  ${OutputFormatter.command('fdk extension preview')}\n` +
                `  ${OutputFormatter.command('fdk extension launch-url')}\n\n` +
                chalk.green('We suggest that you begin by typing:\n\n') +
                `  ${OutputFormatter.command(`cd ${targetDir}`)}\n` +
                `  ${OutputFormatter.command('fdk extension preview')}\n\n` +
                chalk.green.bold(
                    `${OutputFormatter.link(createDevelopmentCompanyFormURL, 'Check your extension:')}\n\n`,
                ) + 'Happy coding!';

            Logger.info(
                successBox({
                    text: text,
                }),
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    /**
     * Prompts the user to confirm the initialization action (create new or select existing extension).
     * @returns {Promise<string>} - The selected action.
     */
    private static async confirmInitAction(){
        const extensionTypeQuestions = [
            {
                type: 'list',
                choices: INIT_ACTION_LIST,
                name: 'action',
                message: 'Do you want to :',
                validate: validateEmpty,
            }
        ];
        
        let prompt_answers: Object = await inquirer.prompt(
            extensionTypeQuestions,
        );

        return prompt_answers.action
    }

    /**
     * Creates a template selection question based on launch type
     * @param {string} launchType - The launch type to get template choices for
     * @returns {Object} The template question object for inquirer
     */
    private static getTemplateQuestion(launchType: string) {
        return {
            type: 'list',
            choices: getTemplateChoices(launchType),
            default: TEMPLATES['node-react'].name,
            name: 'project_type',
            message: 'Template :',
            validate: validateEmpty,
        };
    }

    /**
     * Checks if the target folder or a .git repository already exists and throws an error if so.
     * @param {string} folderPath - The path to check.
     * @param {boolean} [fixedExtensionName=false] - Whether the extension name is fixed (affects error message).
     * @returns {boolean} - Returns false if no conflicts are found.
     * @throws {CommandError} - If the directory or .git repo exists.
     */
    private static checkFolderAndGitExists(folderPath: string, fixedExtensionName = false) {
        if (fs.existsSync(folderPath)) {
            throw new CommandError(`Directory "${folderPath}" already exists in the current directory.

${chalk.yellow('What you can do:')}${chalk.green(`${fixedExtensionName ? '' : "\n- Specify a different extension name to initialize the extension"}
- Run the ${OutputFormatter.command('fdk extension init')} command from a different directory
- Use the ${OutputFormatter.command('--target-dir')} flag to specify a different target directory to initialize the extension`)}
`);
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
}
