import chalk from 'chalk';
import inquirer from 'inquirer';

import configStore, { CONFIG_KEYS } from './Config'; 
import ExtensionService from './api/services/extension.service';
import { 
  Object,
  validateEmpty,
} from '../helper/extension_utils'
import CommandError, { ErrorCodes } from './CommandError';
import Spinner from '../helper/spinner';

export default class Partner {

  public static async connectHandler(options: Object) {
    try {
      let answers: Object;
      let organizationInfo;

      answers = await inquirer.prompt([{
        type: 'input',
        name: 'partner_access_token',
        message: 'Enter partner access token :',
        validate: validateEmpty
      }])

      let spinner = new Spinner('Verifying Access Token');
      try {
        spinner.start();
        organizationInfo = await ExtensionService.getOrganizationData(answers.partner_access_token);
        
        if (!organizationInfo) {
          throw new CommandError(
            ErrorCodes.INVALID_PARTNER_TOKEN.message,
            ErrorCodes.INVALID_PARTNER_TOKEN.code
          )
        }
        spinner.succeed();
      } catch(error) {
        spinner.fail();
        throw new CommandError(error.message, error.code);
      }
      
      if (!options.readOnly) {
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, answers.partner_access_token);
        console.log(chalk.green('Updated partner token'));
      }

      return organizationInfo;
      
    } catch(error) {
      throw new CommandError(error.message, error.code);
    }
  }
}