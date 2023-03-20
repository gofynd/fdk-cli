import chalk from 'chalk';
import inquirer from 'inquirer';

import ExtensionService from './api/services/extension.service';
import { 
  getActiveContext, 
  getDefaultContextData, 
  Object,
  validateEmpty,
  writeContextData
} from '../helper/extension_utils'
import CommandError, { ErrorCodes } from './CommandError';
import Spinner from '../helper/spinner';

export default class Partner {

  public static async connectHandler(options: Object) {
    try {
      let contextData = getDefaultContextData().partners.contexts.default;
      try {
        contextData = getActiveContext(true);
      }
      catch (err) { }

      let answers: Object;
      let organizationInfo: Object;

      answers = await inquirer.prompt([{
        type: 'input',
        name: 'partner_access_token',
        message: 'Enter partner access token :',
        validate: validateEmpty
      }])

      contextData.partner_access_token = answers.partner_access_token;
      let host = options.host || contextData.host;
      contextData.host = host;

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
        if (!options.readOnly) {
          writeContextData(contextData.name, contextData, `./.fdk/context.json`, true);
          console.log(chalk.green('Updated partner token'));
        }
        spinner.succeed();
      } catch(error) {
        spinner.fail();
        throw new CommandError(error.message, error.code);
      }
      return contextData.partner_access_token;
    } catch(error) {
      throw new CommandError(error.message, error.code);
    }
  }
}