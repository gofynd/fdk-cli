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
  getPartnerAccessToken,
  Object,
  validateEmpty,
} from '../helper/extension_utils'
import Spinner from "../helper/spinner";
import CommandError from "./CommandError";

export default class ExtensionPreviewURL {
  organizationInfo: Object;
  publicNgrokURL: string;
  options: Object;
  firstTunnelConnection: boolean = true;

  // command handler for "extension preview-url"
  public static async previewUrlExtensionHandler(options) {
    try {
      Debug(`Ngrok version: ${await ngrok.getVersion()}`);

      // initialize class instance
      const extension = new ExtensionPreviewURL();
      extension.options = options;

      // get the companyId
      extension.organizationInfo = await extension.getOrganizationInfo();
      if (!extension.options.companyId) {
        extension.options.companyId = await extension.getCompanyId();
      }

      // get the extension api key
      if (!extension.options.apiKey) {
        extension.options.apiKey = await extension.promptExtensionApiKey();
      }
      

      // start Ngrok tunnel
      let authtoken = await extension.getAuthtoken();
      let spinner = new Spinner("Starting Ngrok tunnel");
      try {
        spinner.start();
        extension.publicNgrokURL = await extension.startTunnel(authtoken);
        spinner.succeed();
      } catch(error) {
        spinner.fail();
        throw new CommandError(error.message)
      }


      // update launch url on partners panel
      await ExtensionLaunchURL.updateLaunchURL(
        extension.options.apiKey,
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
    } catch(error) {
      throw new CommandError(error.message, error.code);
    }
  }

  private getPreviewURL() {
    let baseURL = getBaseURL().replace('api', 'platform');
    return urljoin(baseURL, `/company/${this.options.companyId}`, `/extensions/${this.options.apiKey}`);
  }

  private async getOrganizationInfo() {
    let partner_access_token = getPartnerAccessToken();
    if (partner_access_token) {
      return await ExtensionService.getOrganizationData(partner_access_token);
    } else {
      return await Partner.connectHandler({readOnly: true, ...this.options});
    }
  }


  private async getCompanyId() {
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
    if (this.firstTunnelConnection) {
      this.firstTunnelConnection = false;
      return;
    }
    console.log(chalk.gray("Ngrok tunnel Reconnected"));
  }
  
  private async closedTunnelHandler() {
    console.log(chalk.red("Ngrok tunnel Closed"));
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
      throw new CommandError(error.message);
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
      throw new CommandError(error.message);
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
      throw new CommandError(error.message);
    }
    return authtoken;
  }
}