import ngrok from "ngrok";
import chalk from "chalk";
import boxen from "boxen";
import urljoin from "url-join";
import inquirer from "inquirer";


import Debug from "./Debug";
import Partner from "./Partner";
import { getBaseURL } from "./api/services/url";
import configStore, { CONFIG_KEYS } from "./Config";
import ExtensionLaunchURL from "./ExtensionLaunchURL";
import ExtensionService from "./api/services/extension.service";
import {
  Object,
  validateEmpty,
} from '../helper/extension_utils'
import Listr from "listr";

export default class ExtensionPreviewURL {
  extension_api_key: string;
  organizationInfo: Object;
  publicNgrokURL: string;
  options: Object;

  // command handler for "extension preview-url"
  public static async previewUrlExtensionHandler(options) {
    Debug(`Ngrok version: ${await ngrok.getVersion()}`);

    // initialize class instance
    const extension = new ExtensionPreviewURL();
    extension.options = options;

    // get the companyId
    if (!extension.options.companyId) {
      extension.options.companyId = await extension.getCompanyId();
    }

    // get the extension api key
    extension.extension_api_key = await extension.promptExtensionApiKey();
    

    // start Ngrok tunnel
    await new Listr([{
      title: "Starting Ngrok tunnel",
      task: async () => {
        let authtoken = await extension.getAuthtoken();
        extension.publicNgrokURL = await extension.startTunnel(authtoken);
      }
    }]).run();


    // update launch url on partners panel
    await ExtensionLaunchURL.updateLaunchURL(
      extension.extension_api_key, 
      extension.organizationInfo.partner_access_token,
      extension.publicNgrokURL
    )  
    
    // get preview URL
    const previewURL = extension.getPreviewURL();

    console.log(boxen(
      chalk.bold.black(`NGROK URL: ${extension.publicNgrokURL}\nPREVIEW URL: ${previewURL}`),
      {
        borderStyle: {
          topLeft: ' ',
          topRight: ' ',
          bottomLeft: ' ',
          bottomRight: ' ',
          horizontal: ' ',
          vertical: ' ',
        },
        padding: 2,
        backgroundColor: 'greenBright',
        textAlignment: 'center',
      }
    ));
  }

  private getPreviewURL() {
    let baseURL = getBaseURL().replace('api', 'platform');
    return urljoin(baseURL, `/company/${this.options.companyId}`, `/extensions/${this.extension_api_key}`);
  }


  private async getCompanyId() {
    this.organizationInfo = await Partner.connectHandler({readOnly: true, ...this.options});
    let developmentCompanyData = await ExtensionService.getDevelopmentAccounts(this.organizationInfo.id, 1, 9999);

    let choices = [];
    developmentCompanyData.items.map((data) => {
      choices.push({name: data.company.name, value: data.company.uid})
    });

    return await this.promptDevelopmentCompany(choices);
  }
  
  private async startTunnel(authtoken: string) {
    Debug(`Starting Ngrok tunnel on port ${this.options.port}`);
    return await ngrok.connect({
      proto: 'http',
      addr: this.options.port,
      region: 'in',
      authtoken: authtoken,
      onStatusChange: async (status) => {
        if (status === 'connected') {
          await this.connectedTunnelHandler();
        }

        if (status === 'closed') {
          await this.closedTunnelHandler();
        }
      },
    });
  }
  
  private async getAuthtoken() {
    if (!configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN) || this.options.updateAuthtoken) {
      let authtoken = await this.promptNgrokAuthtoken();
      configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, authtoken);
      return authtoken
    } else {
      return configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN);
    }
  }
  
  private async connectedTunnelHandler() {
    Debug("Ngrok tunnel Connected");
  }
  
  private async closedTunnelHandler() {
    Debug("Ngrok tunnel Closed");
  }

  private async promptExtensionApiKey(): Promise<string> {
    let extension_api_key: string;
    try {
      let answers = await inquirer.prompt([{
        type: 'input',
        name: 'extension_api_key',
        message: 'Enter Extension API Key :',
        validate: validateEmpty
      }])
      extension_api_key = answers.extension_api_key
    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
    return extension_api_key;
  }
  
  private async promptDevelopmentCompany(choices): Promise<number> {
    let companyId: number;
    try {
      let answers = await inquirer.prompt([{
        type: 'list',
        choices: choices,
        name: 'company_id',
        message: 'Development Company :',
        pageSize: 5,
        validate: validateEmpty
      }]);
      companyId = answers.company_id
    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
    return companyId;
  }

  private async promptNgrokAuthtoken(): Promise<string> {
    let authtoken: string;
    try {
      let answers = await inquirer.prompt([{
        type: 'input',
        name: 'ngrok_authtoken',
        message: 'Enter Ngrok Authtoken :',
        validate: validateEmpty
      }])
      authtoken = answers.ngrok_authtoken;
    } catch(error) {
      console.log(chalk.red(error.message));
      process.exit(1);
    }
    return authtoken;
  }
}