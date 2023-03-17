import chalk from 'chalk';
import inquirer from 'inquirer';
import Listr from 'listr';

import configStore, { CONFIG_KEYS } from './Config'; 
import ExtensionService from './api/services/extension.service';
import { 
  Object,
  validateEmpty,
} from '../helper/extension_utils'

export default class Partner {

  public static async connectHandler(options: Object) {
    let answers: Object;
    let organizationInfo: any;

    try {
      answers = await inquirer.prompt([{
        type: 'input',
        name: 'partner_access_token',
        message: 'Enter partner access token :',
        validate: validateEmpty
      }])

      await new Listr([
        {
          title: 'Verifying Access Token',
          task: async () => {            
            organizationInfo = await ExtensionService.getOrganizationData(answers.partner_access_token);
          }
        }
      ]).run();
      
      if (!organizationInfo) {
        console.log(chalk.red('Invalid or expired token. Please add valid token'));
        process.exit(1);
      }
      if (!options.readOnly) {
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, answers.partner_access_token);
        console.log(chalk.green('Updated partner token'));
      }

    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
    return organizationInfo;
  }
}