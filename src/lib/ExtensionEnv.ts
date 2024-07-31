import path from 'path'
import fs from 'fs';
import { readFile, writeFile } from '../helper/file.utils';
import { replaceContent } from '../helper/extension_utils';
import { getExtensionId } from "../helper/extension_utils";
import extensionService from './api/services/extension.service';

export default class ExtensionEnv {

    static replaceContent(
        content: string,
        searchPattern: RegExp,
        replaceStr: string,
    ): string {
        return content.replace(searchPattern, replaceStr);
    };
    

    static updateExtensionEnvValues(launch_url: string, api_key: string, api_secret: string) {
        const envFilePath = './.env';
        const ymlFilePath = path.join('src', 'main', 'resources', 'application.yml');
    
        if (fs.existsSync(envFilePath)) {
            let envData = readFile(envFilePath);
            envData = replaceContent(envData, `EXTENSION_BASE_URL[ ]*=[ ]*.*[\n]`, `EXTENSION_BASE_URL="${launch_url}"\n`);
            envData = replaceContent(envData, `EXTENSION_API_KEY[ ]*=[ ]*.*[\n]`, `EXTENSION_API_KEY="${api_key}"\n`);
            envData = replaceContent(envData, `EXTENSION_API_SECRET[ ]*=[ ]*.*[\n]`, `EXTENSION_API_SECRET="${api_secret}"\n`);
            writeFile(envFilePath, envData)
        } 
        else if (fs.existsSync(ymlFilePath)) {
            let ymlData = readFile(ymlFilePath);
            ymlData = this.replaceContent(ymlData, /base_url[ ]*:[ ]*.*[\n]/, `base_url : '${launch_url}'\n`);
            ymlData = this.replaceContent(ymlData, /api_key[ ]*:[ ]*.*[\n]/, `api_key : '${api_key}'\n`);
            ymlData = this.replaceContent(ymlData, /api_secret[ ]*:[ ]*.*[\n]/, `api_secret : '${api_secret}'\n`);
            writeFile(ymlFilePath, ymlData);
        } else {
            console.log(`EXTENSION_BASE_URL="${launch_url}"`);
            console.log(`EXTENSION_API_KEY="${api_key}"`);
            console.log(`EXTENSION_API_SECRET="${api_secret}"`);
            // Create .env file with the new values
            const newEnvData = `EXTENSION_BASE_URL="${launch_url}"\nEXTENSION_API_KEY="${api_key}"\nEXTENSION_API_SECRET="${api_secret}"\n`;
            writeFile(envFilePath, newEnvData);
        }
    };
    

    public static async extensionEnvPullHandler(){
        const extension_id = await getExtensionId();
        const extension = await extensionService.getExtensionDataPartners(extension_id);
        ExtensionEnv.updateExtensionEnvValues(extension.base_url, extension._id, extension.client_data.secret[0]);
    }
}