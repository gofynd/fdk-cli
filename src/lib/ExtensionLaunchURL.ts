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
import CommandError from "./CommandError";
import Spinner from "../helper/spinner";


export default class ExtensionLaunchURL {

  public static async setLaunchURLHandler(options) {
    try {
      let contextData = getDefaultContextData().partners.contexts.default;

      try {
        contextData = getActiveContext(true);
      } catch(err) {}

      if (!contextData.partner_access_token) {
        contextData.partner_access_token = await Partner.connectHandler({readOnly: true, ...options});
      }

      let ctx = {
        host: options.host || contextData.host,
        launch_url: options.url,
        token: contextData.partner_access_token,
        extension_id: options.apiKey,
        verbose: options.verbose
      }

      let spinner = new Spinner('Updating Launch URL');
      try {
        spinner.start();
        let manualUpdateRequired = false;
        await ExtensionService.updateLaunchURL(
          ctx.extension_id,
          ctx.token,
          {base_url: ctx.launch_url}
        )

        if (fs.existsSync('./.env')) {
          let envData = readFile('./.env');
          envData = replaceContent(envData, `EXTENSION_BASE_URL=.*[\n]`, `EXTENSION_BASE_URL="${ctx.launch_url}"\n`);
          writeFile('./.env', envData);
        } else {
          manualUpdateRequired = true;
        }
        spinner.succeed();
        console.log(chalk.greenBright(`Launch url set successfully ${manualUpdateRequired? '. Please update launch url in your code.': ''}`));
        
      } catch(error) {
        spinner.fail();
        throw new CommandError('Error while updating Launch URL');
      }

    } catch(error) {
      throw new CommandError(error.message, error.code);
    }
  }


  public static async getLaunchURLHandler(options: Object) {
    try {
      let contextData = getDefaultContextData().partners.contexts.default;
      
      try {
        contextData = getActiveContext(true);
      } catch(err) {}

      if (!contextData.partner_access_token) {
        contextData.partner_access_token = await Partner.connectHandler({readOnly: true, ...options});
      }

      let ctx = {
        host: options.host || contextData.host,
        launch_url: options.url,
        token: contextData.partner_access_token,
        extension_id: options.apiKey,
        verbose: options.verbose
      }

      let spinner = new Spinner('Fetching Launch URL');
      try {
        spinner.start();
        let extension_data = await ExtensionService.getExtensionDataUsingToken(ctx.extension_id, ctx.token);
        let launchURL: string = extension_data.base_url;

        spinner.succeed();
        console.log(chalk.greenBright(`Current launch URL: ${launchURL}`));
      
      } catch(error) {
        spinner.fail();
        throw new CommandError('Error while Fetching Launch URL')
      }

    } catch(error) {
      throw new CommandError(error.message, error.code);
    }
  }
}