import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

import urljoin from 'url-join';
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
} from '../helper/extension_utils';

import { createDirectory, writeFile, readFile } from '../helper/file.utils';
import ConfigStore, { CONFIG_KEYS } from './Config';
import {
  installNpmPackages,
  installJavaPackages,
  checkRequiredDependencies,
} from '../helper/utils';
import Logger from './Logger';
import Debug from './Debug';
import { TEMP_DIR_NAME, EXTENSION_CONTEXT_FILE_NAME } from '../helper/constants';
import { cloneGitRepository } from '../helper/clone_git_repository';

export const NODE_VUE = 'Node + Vue 3 + SQLite';
export const NODE_REACT = 'Node + React.js + SQLite';
export const NODE_NEXT = 'Node + Next.js + SQLite';
export const JAVA_VUE = 'Java + Vue 2 + SQLite';
export const JAVA_REACT = 'Java + React.js + SQLite';
export const EXTENSION_BRANCH = 'main';

const TEMPLATES = {
  'node-vue': NODE_VUE,
  'node-react': NODE_REACT,
  'node-next': NODE_NEXT,
  'java-vue': JAVA_VUE,
  'java-react': JAVA_REACT,
};

const INIT_ACTIONS = {
  create_extension: 'create_extension',
  select_extension: 'select_extension',
};

const INIT_ACTION_LIST = [
  { name: 'Create new extension', value: INIT_ACTIONS.create_extension },
  { name: 'Select existing extension', value: INIT_ACTIONS.select_extension },
];

export const PROJECT_REPOS = {
  [NODE_VUE]: 'https://github.com/gofynd/example-extension-javascript',
  [NODE_REACT]: 'https://github.com/gofynd/example-extension-javascript-react',
  [NODE_NEXT]: 'https://github.com/gofynd/example-extension-nextjs',
  [JAVA_VUE]: 'https://github.com/gofynd/example-extension-java-vue',
  [JAVA_REACT]: 'https://github.com/gofynd/example-extension-java-react',
};
export default class Extension {
  // clone extension boilerplate from github
  private static async copyTemplateFiles(
    targetDirectory: string,
    answers: Object,
  ) {
    try {
      // Use the cloneGitRepository utility function with EXTENSION_BRANCH
      await cloneGitRepository(answers.project_url, targetDirectory, EXTENSION_BRANCH);
      Debug('All extension files moved successfully.');
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
    const readMe = readFile(`${targetDir}/README.md`);
    writeFile(
      `${targetDir}/README.md`,
      replaceContent(readMe, 'groot', answerObject.name),
    );

    if (
      answerObject.project_type === JAVA_VUE
            || answerObject.project_type === JAVA_REACT
    ) {
      const pomXml = readFile(`${targetDir}/pom.xml`);
      writeFile(
        `${targetDir}/pom.xml`,
        replaceContent(pomXml, 'groot', answerObject.name),
      );
      targetDir = `${targetDir}/frontend`;
    }

    const packageJson = readFile(`${targetDir}/package.json`);
    const packageName = answerObject.name.toLowerCase().replace(/\s/g, '_');
    writeFile(
      `${targetDir}/package.json`,
      replaceContent(packageJson, 'groot', packageName),
    );
  }

  private static async updateExtensionContextFile(
    targetDir: string,
    extension_api_key: string,
    extension_api_secret: string,
  ) {
    const extensionContext = {
      EXTENSION_API_KEY: extension_api_key,
      EXTENSION_API_SECRET: extension_api_secret,
    };

    fs.writeFileSync(path.join(targetDir, EXTENSION_CONTEXT_FILE_NAME), JSON.stringify(extensionContext, null, 4));
  }

  // wrapper function for installing dependencies in extension
  static async installDependencies(answers: Object): Promise<void> {
    const { project_type } = answers;
    if (project_type === NODE_VUE || project_type === NODE_REACT) {
      // installing dependencies for Node projects
      await installNpmPackages(answers.targetDir);
      // added to support new boilerplate structure
      await installNpmPackages(path.join(answers.targetDir, 'frontend'));
    } else if (project_type === JAVA_VUE || project_type === JAVA_REACT) {
      // installing dependencies for java projects
      await installNpmPackages(path.join(answers.targetDir, 'frontend'));
      await installJavaPackages(answers.targetDir);
    }
  }

  // main function for creating extension
  private static async createExtension(
    answers: Object,
    isRegisterExtension: boolean,
  ): Promise<void> {
    try {
      const { targetDir } = answers;

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
          // We are just passing this url as temporary when preview url is called it gets updated with the tunnel url
          extention_type: answers.type.toLowerCase(),
          // Adding this for backward compatibility for v1.8.X
          callbacks: {
            setup: 'http://localdev.fynd.com/fp/setup',
            install: 'http://localdev.fynd.com/fp/install',
            auth: 'http://localdev.fynd.com/fp/auth',
            uninstall: 'http://localdev.fynd.com/fp/uninstall',
            auto_install: 'http://localdev.fynd.com/fp/auto_install',
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
          const extension_data: Object = await ExtensionService.registerExtensionPartners(data);
          answers.extension_api_key = extension_data.client_id;
          answers.extension_api_secret = extension_data.secret[0];
          answers.base_url = extension_data.base_url;
          spinner.succeed();
        } catch (error) {
          spinner.fail();
          throw new CommandError(error.message);
        }
      }

      spinner = new Spinner('Installing Dependencies');
      try {
        spinner.start();
        await Extension.updateExtensionContextFile(
          answers.targetDir,
          answers.extension_api_key,
          answers.extension_api_secret,
        );
        await Extension.replaceGrootWithExtensionName(
          answers.targetDir,
          answers,
        );
        await Extension.installDependencies(answers);
        spinner.succeed();
      } catch (error) {
        Debug(JSON.stringify(error));
        spinner.fail();
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
          '?created=true',
        )
        : getPlatformUrls().partners;
      const text = `${chalk.green(`Success! ${isRegisterExtension ? 'Created' : 'Initiated'} your extension at `) + chalk.bold.blue(targetDir)
                + chalk.green('\nInside that directory, you can run several commands:\n\n')
      }  ${OutputFormatter.command('fdk extension preview')}\n`
                + `  ${OutputFormatter.command('fdk extension launch-url')}\n\n${
                  chalk.green('We suggest that you begin by typing:\n\n')
                }  ${OutputFormatter.command(`cd ${targetDir}`)}\n`
                + `  ${OutputFormatter.command('fdk extension preview')}\n\n${
                  chalk.green.bold(
                    `${OutputFormatter.link(createDevelopmentCompanyFormURL, 'Check your extension:')}\n\n`,
                  )}Happy coding!`;

      Logger.info(
        successBox({
          text,
        }),
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  }

  private static async confirmInitAction() {
    const extensionTypeQuestions = [
      {
        type: 'list',
        choices: INIT_ACTION_LIST,
        name: 'action',
        message: 'Do you want to :',
        validate: validateEmpty,
      },
    ];

    const prompt_answers: Object = await inquirer.prompt(
      extensionTypeQuestions,
    );

    return prompt_answers.action;
  }

  // command handler for "extension init"
  public static async initExtensionHandler(options: Object) {
    try {
      let answers: Object = {};
      let selected_ext_type;

      // Checking required dependency
      checkRequiredDependencies([
        {
          name: 'npm',
          errorMessage: 'Please Install NPM to create Node.js based extension. Refer https://docs.npmjs.com/downloading-and-installing-node-js-and-npm to install Node.js',
        },
      ]);

      const { template } = options;
      if (template) {
        if (!Object.keys(TEMPLATES).includes(template)) {
          throw new CommandError(
            `Invalid template passed. Available options are: ${Object.keys(TEMPLATES).join(', ')}`,
            ErrorCodes.INVALID_INPUT.code,
          );
        }
      }

      let action = INIT_ACTIONS.create_extension;
      Debug("Checking if extensions exist in developer's organization...");
      const extensionList = await ExtensionService.getExtensionList(1, 9999);

      if (extensionList.items.length) {
        action = await Extension.confirmInitAction();
      }

      let isExtensionNameFixed = false;

      // if developer wants to select from existing extension
      if (action === INIT_ACTIONS.select_extension) {
        const selected_extension = await selectExtensionFromList(extensionList);
        const selected_ext_api_key = selected_extension.extension.id;
        const extensionDetails = await ExtensionService.getExtensionDataPartners(selected_ext_api_key);
        selected_ext_type = extensionDetails.extention_type;

        // set answers for createExtension function, this will be use to set data in extension config
        answers.name = selected_extension.extension.name;
        answers.type = selected_ext_type;
        answers.extension_api_key = selected_ext_api_key;
        answers.extension_api_secret = extensionDetails.client_data.secret[0];
        isExtensionNameFixed = true;
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
      answers.targetDir = options.targetDir || answers.name;

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
      }
      if (!template) {
        extensionTypeQuestions.push({
          type: 'list',
          choices: [
            NODE_REACT,
            NODE_VUE,
          ],
          default: NODE_REACT,
          name: 'project_type',
          message: 'Template :',
          validate: validateEmpty,
        });
      }

      let prompt_answers: Object = {};
      if (extensionTypeQuestions.length) {
        prompt_answers = await inquirer.prompt(
          extensionTypeQuestions,
        );
      }
      if (template) {
        prompt_answers.project_type = TEMPLATES[template];
      }
      if (action === INIT_ACTIONS.select_extension) {
        prompt_answers.type = selected_ext_type;
      }

      if (prompt_answers.project_type === JAVA_REACT || prompt_answers.project_type === JAVA_VUE) {
        checkRequiredDependencies([
          {
            name: 'mvn',
            errorMessage: 'Please Install Maven to create Java based extension. Refer https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html to install Maven',
          },
        ]);
      }

      answers.launch_url = 'http://localdev.fyndx0.de';
      answers.project_url = PROJECT_REPOS[prompt_answers.project_type];
      answers = {
        ...answers,
        ...prompt_answers,
      };

      await Extension.createExtension(answers, action === INIT_ACTIONS.create_extension);
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  }

  private static checkFolderAndGitExists(folderPath: string, fixedExtensionName = false) {
    if (fs.existsSync(folderPath)) {
      throw new CommandError(`Directory "${folderPath}" already exists in the current directory.

${chalk.yellow('What you can do:')}${chalk.green(`${fixedExtensionName ? '' : '\n- Specify a different extension name to initialize the extension'}
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

  public static updateExtensionEnvValue(launch_url: string) {
    const java_env_file_path = path.join(
      'src',
      'main',
      'resources',
      'application.yml',
    );

    if (fs.existsSync('./.env')) {
      let envData = readFile('./.env');
      envData = replaceContent(
        envData,
        'EXTENSION_BASE_URL=.*[\n]',
        `EXTENSION_BASE_URL="${launch_url}"\n`,
      );
      writeFile('./.env', envData);
    }
    if (fs.existsSync(java_env_file_path)) {
      let envData = readFile(java_env_file_path);
      envData = replaceContent(
        envData,
        'base_url.*[\n]',
        `base_url: '${launch_url}'\n`,
      );
      writeFile(java_env_file_path, envData);
    } else {
      return true;
    }
    return false;
  }
}
