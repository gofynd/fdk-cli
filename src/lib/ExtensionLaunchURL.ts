import Listr from "listr";
import fs from 'fs';
import { 
  getDefaultContextData, 
  getActiveContext, 
  replaceContent,
  Object
} from "../helper/extension_utils";
import Partner from "./Partner";
import { readFile, writeFile } from "../helper/file.utils";
import chalk from "chalk";
import ExtensionService from "./api/services/extension.service"


export default class ExtensionLaunchURL {

  public static async setLaunchURLHandler(options) {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
      contextData = getActiveContext(true);
    } catch(err) {}

    if (!contextData.partner_access_token) {
      contextData.partner_access_token = (await Partner.connectHandler({readOnly: true, ...options})).partner_access_token;
    }

    let ctx = {
      host: options.host || contextData.host,
      launch_url: options.url,
      token: contextData.partner_access_token,
      extension_id: options.apiKey,
      verbose: options.verbose
    }

    ExtensionLaunchURL.updateLaunchURL(ctx.extension_id, ctx.token, ctx.launch_url);
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
    let contextData = getDefaultContextData().partners.contexts.default;
    
    try {
      contextData = getActiveContext(true);
    } catch(err) {}

    if (!contextData.partner_access_token) {
      contextData.partner_access_token = (await Partner.connectHandler({readOnly: true, ...options})).partner_access_token;
    }

    
    let ctx = {
      host: options.host || contextData.host,
      launch_url: options.url,
      token: contextData.partner_access_token,
      extension_id: options.apiKey,
      verbose: options.verbose
    }

    try {
      let launchURL: string;
      await new Listr([
        {
          title: "Fetching Launch URL",
          task: async () => {
            
            let extension_data = await ExtensionService.getExtensionDataUsingToken(ctx.extension_id, ctx.token);            
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