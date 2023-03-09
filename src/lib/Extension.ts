import inquirer from "inquirer";
import chalk from "chalk";
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import execa from "execa";
import rimraf from 'rimraf';
import Listr, { ListrTask } from "listr";
import os from 'os';


import Partner from "./Partner";
import ExtensionService from "./api/services/extension.service"

import { 
  getActiveContext, 
  getDefaultContextData, 
  Object,
  validateEmpty,
  writeContextData,
  replaceContent
} from '../helper/extension_utils';

import { 
  createDirectory, 
  writeFile, 
  readFile 
} from "../helper/file.utils";

export const NODE_VUE = 'Node + Vue.js'
export const NODE_REACT = 'Node + React.js'
export const PYTHON_VUE = 'Python + Vue.js'
export const PYTHON_REACT = 'Python + React.js'
export const JAVA_VUE = 'Java + Vue.js'
export const JAVA_REACT = 'Java + React.js'

export const PROJECT_REPOS = {
  [NODE_VUE]: "https://github.com/gofynd/example-extension-javascript.git",
  [NODE_REACT]: "https://github.com/gofynd/example-extension-javascript-react.git",
  [PYTHON_VUE]: "https://github.com/gofynd/example-extension-python-vue.git",
  [PYTHON_REACT]: "https://github.com/gofynd/example-extension-python-react.git",
  [JAVA_VUE]: "https://github.com/gofynd/example-extension-java-vue.git",
  [JAVA_REACT]: "https://github.com/gofynd/example-extension-java-react.git",
}
export default class Extension {



  private static checkForVue(answers: Object): boolean {
    if (
      answers.project_type === NODE_VUE 
      || answers.project_type === JAVA_VUE 
      || answers.project_type === PYTHON_VUE
    ) {
      return true
    }
    return false
  }


  // clone extension boilerplate from github
  private static async copyTemplateFiles(targetDirectory: string, answers: Object) {
    try {
      if (!fs.existsSync(targetDirectory)) {
        createDirectory(targetDirectory);
      }
      await execa('git', ['init'], { cwd: targetDirectory });
      await execa('git', ['remote', 'add', 'origin', answers.project_url], { cwd: targetDirectory });
      if (answers.vue_version === 'vue3') {
        await execa('git', ['pull', 'origin', 'main-vue3:main-vue3'], { cwd: targetDirectory });
      } else {
        await execa('git', ['pull', 'origin', 'main:main'], { cwd: targetDirectory });
      }
      rimraf.sync(`${targetDirectory}/.git`); // unmark as git repo
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // replaces package name
  private static async replaceGrootWithExtensionName(targetDir: string, answerObject: Object): Promise<void> {
    let readMe = readFile(`${targetDir}/README.md`);
    writeFile(`${targetDir}/README.md`, replaceContent(readMe, 'groot', answerObject.name));

    if (answerObject.project_type === JAVA_VUE || answerObject.project_type === JAVA_REACT) {
      let pomXml = readFile(`${targetDir}/pom.xml`)
      writeFile(`${targetDir}/pom.xml`, replaceContent(pomXml, 'groot', answerObject.name))
      
      targetDir = `${targetDir}/app`
    }

    let packageJson = readFile(`${targetDir}/package.json`);
    let packageName = answerObject.name.toLowerCase().replace(/\s/g, "_");
    writeFile(`${targetDir}/package.json`, replaceContent(packageJson, 'groot', packageName));
  }


  // installing NPM packages
  private static async installNpmPackages(targetDir: string): Promise<void> {
    await execa('npm', ['i'], { cwd: targetDir });
    await execa('npm', ['run', 'build'], { cwd: targetDir });
  }

  // installing Python libraries
  private static async installPythonDependencies(targetDir: string): Promise<void> {
    const os_platform = os.platform()
    if (os_platform === 'darwin' || os_platform === 'linux') {
      await execa('python3', ['-m', 'venv', 'venv'], {cwd: targetDir});
      await execa('./venv/bin/pip', ["install", '-r', 'requirements.txt'], {cwd: targetDir});
    } else if (os_platform === 'win32') {
      await execa('python', ['-m', 'venv', 'venv'], {cwd:targetDir});
      await execa('venv\\Scripts\\pip', ['install', '-r', 'requirements.txt'], {cwd: targetDir});
    }
  }

  // installing Java packages
  private static async installJavaPackages(targetDir: string): Promise<void> {
    await execa('mvn', ['clean'], {cwd: targetDir});
    await execa('mvn', ['package'], {cwd: targetDir});
  }

  // wrapper function for installing dependencies in extension
  static async installDependencies(answers: Object): Promise<void> {
    let project_type = answers.project_type
    if (project_type === NODE_VUE || project_type === NODE_REACT) {
        // installing dependencies for Node projects
        await Extension.installNpmPackages(answers.targetDir);
        } 
    
    else if (project_type === PYTHON_VUE || project_type === PYTHON_REACT ) {
        // installing dependencies for Python projects
        await Extension.installNpmPackages(answers.targetDir);
        await Extension.installPythonDependencies(answers.targetDir);
        }

    else if (project_type === JAVA_VUE || project_type === JAVA_REACT) {
        // installing dependencies for java projects
        await Extension.installNpmPackages(`${answers.targetDir}/app`);
        await Extension.installJavaPackages(answers.targetDir);
    }
  }


  // main function for creating extension
  private static async createExtension(answers: Object, isRegisterExtension: boolean): Promise<void> {
    try {
      let targetDir = answers.targetDir;

      let tasks: ListrTask<any>[] = [];
      tasks.push(
        {
          title: 'Fetching Template Files',
          task: async (ctx) => {
            await Extension.copyTemplateFiles(targetDir, answers);
            ctx.partner_access_token = answers.partner_access_token;
            ctx.host = answers.host;
            ctx.extensionData = {
              name: answers.name,
              targetDir: targetDir,
              host: answers.host
            }
          }
        },
        {
          title: "Storing context",
          task: async (ctx) => {
            let contextData = getDefaultContextData();
            if(!fs.existsSync(path.join(targetDir, '.fdk'))) {
              createDirectory(path.join(targetDir, '.fdk'));
              writeFile(
                path.join(targetDir, '.fdk', 'context.json'),
                JSON.stringify(contextData, undefined, 2)
              );
            }

            answers.contextName = answers.contextName || 'default';
            const contextObj = {
              partner_access_token: ctx.partner_access_token,
              host: answers.host,
            }

            writeContextData(
              answers.contextName, 
              contextObj, 
              path.join(targetDir, '.fdk', 'context.json'), 
              true
            );
          }
        }
      )

      if (isRegisterExtension) {
        tasks.push({
          title: 'Registering Extension', 
          task: async (ctx) => {
            let extension_data: Object = await ExtensionService.registerExtension(
              ctx.partner_access_token,
              {
                name: answers.name,
                base_url: 'http://localdev.fynd.com',
                extension_type: answers.type
              }
            )
            answers.extension_api_key = extension_data.client_id;
            answers.extension_api_secret = extension_data.secret;
            answers.base_url = extension_data.launch_url;
          }
        })
      }

      tasks.push({
        title: "Installing Dependencies",
        task: async (ctx) => {
          if ( answers.project_type === JAVA_VUE || answers.project_type === JAVA_REACT) {
            const ymlData = `\n\next :\n  api_key : "${answers.extension_api_key}"\n  api_secret : "${answers.extension_api_secret}"\n  scopes : ""\n  base_url : "${answers.base_url}"\n  cluster : "https://${answers.host}"`;
            fs.writeFileSync(`${answers.targetDir}/src/main/resources/application.yml`, ymlData, {flag:'a+'});
          } else {
            const envData=`EXTENSION_API_KEY="${answers.extension_api_key}"\nEXTENSION_API_SECRET="${answers.extension_api_secret}"\nEXTENSION_BASE_URL="${answers.base_url}"\nEXTENSION_CLUSTER_URL="https://${answers.host}"`;
            fs.writeFileSync(`${answers.targetDir}/.env`, envData);
          }
          await Extension.replaceGrootWithExtensionName(answers.targetDir, answers);
          await Extension.installDependencies(answers);
        }
      })
      
      // run the define tasks
      await new Listr(tasks).run().then((ctx) => {
        let text = chalk.green.bold('DONE ') 
          + chalk.green.bold('Project ready\n')
          + chalk.yellowBright.bold('NOTE: ')
          + chalk.green.bold(`cd ${targetDir} to continue...`)
        console.log(boxen(text, {padding: 1, borderColor: "greenBright"}));

      }).catch((error) => {
        console.log(chalk.red(error.message));
        if (fs.existsSync(targetDir)) {
          rimraf.sync(targetDir);
        }
        process.exit(1);
      })

    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
  }


  // command handler for "extension init"
  public static async initExtensionHandler(options: Object) {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
      contextData = getActiveContext(true);
    }
    catch(err) {}

    let answers: Object = {
      host: options.host || contextData.host,
      verbose: options.verbose
    }

    await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter Extension name :',
        validate: validateEmpty
      }
    ]).then((value) => {
      answers.name = value.name
    })

    if (options['targetDir']) {
      answers.targetDir = options['targetDir']
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
        choices: [
          NODE_VUE, 
          NODE_REACT, 
          PYTHON_VUE, 
          PYTHON_REACT, 
          JAVA_VUE, 
          JAVA_REACT
        ],
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
        when: Extension.checkForVue,
        validate: validateEmpty
      }
  ];

    let prompt_answers: Object = await inquirer.prompt(extensionTypeQuestions);

    if (!contextData.partner_access_token) {
      contextData.partner_access_token = await Partner.connectHandler({readOnly: true, ...options});
    }

    answers.launch_url = "http://localdev.fyndx0.de"
    answers.partner_access_token = contextData.partner_access_token;
    answers.project_url = PROJECT_REPOS[prompt_answers.project_type];
    answers = {
      ...answers,
      ...prompt_answers
    }

    await Extension.createExtension(answers, true);
  }


  // command handler for "extension setup"
  public static async setupExtensionHandler(options) {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
      contextData = getActiveContext(true);
    } catch(err) {}

    let answers: Object = {
      host: options.host || contextData.host,
      verbose: options.verbose
    }


    let questions = [
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
        choices: [
          NODE_VUE, 
          NODE_REACT, 
          PYTHON_VUE, 
          PYTHON_REACT, 
          JAVA_VUE, 
          JAVA_REACT
        ],
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
        when: Extension.checkForVue,
        validate: validateEmpty
      }
    ]
    

    answers = {...answers, ...await inquirer.prompt(questions)}
    answers.project_url = PROJECT_REPOS[answers.project_type]

    let extension_data: Object;
    await new Listr([
      {
        title: "Verifying API Keys",
        task: async (ctx) => {
          extension_data = await ExtensionService.getExtensionData(
            answers.extension_api_key, 
            answers.extension_api_secret
          );
        }
      }
    ]).run();
    if (!extension_data) {
      console.log(chalk.red('Invalid API Key or API Secret. Please use valid keys.'));
      process.exit(1);
    }

    answers.base_url = extension_data.base_url;
    answers.name = extension_data.name;

    if (options['targetDir']) {
      answers.targetDir = options['targetDir']
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

    await Extension.createExtension(answers, false);
  }
}