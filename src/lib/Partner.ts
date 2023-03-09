import chalk from 'chalk';
import inquirer from 'inquirer';
import Listr from 'listr';

import ExtensionService from './api/services/extension.service';
import { 
  getActiveContext, 
  getDefaultContextData, 
  Object,
  validateEmpty,
  writeContextData
} from '../helper/extension_utils'

export default class Partner {

  public static async connectHandler(options: Object) {
    let contextData = getDefaultContextData().partners.contexts.default;
    try {
      contextData = getActiveContext(true);
    }
    catch (err) { }

    let answers: Object;
    let organizationInfo: Object;

    try {
      answers = await inquirer.prompt([{
        type: 'input',
        name: 'partner_access_token',
        message: 'Enter partner access token :',
        validate: validateEmpty
      }])

      contextData.partner_access_token = answers.partner_access_token;
      let host = options.host || contextData.host;
      contextData.host = host;

      await new Listr([
        {
          title: 'Verifying Access Token',
          task: async ctx => {            
            organizationInfo = await ExtensionService.getOrganizationData(answers.partner_access_token);
          }
        }
      ]).run();
      
      if (!organizationInfo) {
        console.log(chalk.red('Invalid or expired token. Please add valid token'));
        process.exit(1);
      }
      if (!options.readOnly) {
        writeContextData(contextData.name, contextData, `./.fdk/context.json`, true);
        console.log(chalk.green('Updated partner token'));
      }

    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
    return contextData.partner_access_token;
  }
}