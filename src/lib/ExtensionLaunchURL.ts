import Listr from "listr";
import fs from 'fs';
import { 
  replaceContent,
  Object,
  getPartnerAccessToken
} from "../helper/extension_utils";
import Partner from "./Partner";
import { readFile, writeFile } from "../helper/file.utils";
import chalk from "chalk";
import ExtensionService from "./api/services/extension.service"


export default class ExtensionLaunchURL {

  public static async setLaunchURLHandler(options) {
    let partner_access_token = getPartnerAccessToken();

    if (!partner_access_token) {
      partner_access_token = (await Partner.connectHandler({readOnly: true, ...options})).partner_access_token;
    }

    ExtensionLaunchURL.updateLaunchURL(options.apiKey, partner_access_token, options.url);
  }

  public static async updateLaunchURL(extension_api_key: string, partner_access_token: string, launch_url: string): Promise<void> {
    try {
      let manualUpdateRequired = false;
      await new Listr([{
        title: 'Updating Launch URL',
        task: async () => {
          await ExtensionService.updateLaunchURL(
            extension_api_key,
            partner_access_token,
            { base_url: launch_url }
          )

          if (fs.existsSync('./.env')) {
            // update launch url in .env file for python/node projects
            let envData = readFile('./.env');
            envData = replaceContent(envData, `EXTENSION_BASE_URL=.*[\n]`, `EXTENSION_BASE_URL="${launch_url}"\n`);
            writeFile('./.env', envData);

          } else if (fs.existsSync('./src/main/resources/application.yml')) {
            // update launch url in application.yml file for java projects
            let ymlData = readFile('./src/main/resources/application.yml');
            ymlData = replaceContent(ymlData, `base_url :.*[\n]`, `base_url : "${launch_url}"\n`);
            writeFile('./src/main/resources/application.yml', ymlData);

          } else {
            manualUpdateRequired = true;
          }
        }
      }]).run()

      console.log(chalk.greenBright(`Launch url set successfully${manualUpdateRequired? '. Please update launch url in your code.': ''}`));

    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
  }


  public static async getLaunchURLHandler(options: Object) {
    let partner_access_token = getPartnerAccessToken();

    if (!partner_access_token) {
      partner_access_token = (await Partner.connectHandler({readOnly: true, ...options})).partner_access_token;
    }

    try {
      let launchURL: string;
      await new Listr([
        {
          title: "Fetching Launch URL",
          task: async () => {
            
            let extension_data = await ExtensionService.getExtensionDataUsingToken(options.apiKey, partner_access_token);
            launchURL = extension_data.base_url;
          }
        }
      ]).run()
      console.log(chalk.greenBright(`Current launch URL: ${launchURL}`));
    
    } catch(error) {
      console.log(chalk.red(error.message));
    }
  }
}