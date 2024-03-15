
import path from 'path';
import fs from 'fs-extra';
import { createExtensionContext, getExtensionActiveContext, hasExtensionContext } from "../helper/extension_context.utils";
import CommandError from './CommandError';
import inquirer, { ChoiceOptions } from 'inquirer';
import chalk from 'chalk';
import { validateEmpty } from '../helper/extension_utils';
import ExtensionService from './api/services/extension.service';
import { CONTEXT_PATH, FDK_PATH, isAThemeOrExtensionDirectory } from '../helper/utils';
import { createDirectory } from '../helper/file.utils';
import { getBaseURL } from './api/services/url';
import configStore, { CONFIG_KEYS } from './Config';


export default class ExtensionContext {

    public static async changeContextHandler() {
        try {
            getExtensionActiveContext();

            const contextJsonPath = path.join(process.cwd(),'.fdk', 'context.json');
            const completeContext = fs.readJSONSync(contextJsonPath);
            const contextData = completeContext.extension.contexts;
            const contextArray = Object.keys(contextData).map((el)=> contextData[el]);

            const choices = contextArray.map(
                (el)=> ({name: `${el.name} (${el.extension_id})`, value: el.extension_id })
            );

            const activeContextId = await ExtensionContext.promptContextList(choices);

            completeContext.extension.active_context = activeContextId;
            fs.writeJSONSync(contextJsonPath, completeContext, { spaces: 2 })

            console.log(chalk.green(`Context changed to Extension ${contextData[activeContextId].name} Successfully`));

        } catch(error) {
            throw error;
        }
    }

    public static async addExtensionContextHandler(options) {
        try {
            let extensionAPIKey = options.apiKey;

            if (!extensionAPIKey) {
                extensionAPIKey = await ExtensionContext.promptExtensionAPIKey();
            }

            const extensionData = await ExtensionService.getExtension(extensionAPIKey);

            if (!isAThemeOrExtensionDirectory()) createDirectory(FDK_PATH());

            if (!hasExtensionContext()) {
                await fs.writeJSON(CONTEXT_PATH(), { extension: {active_context: "", contexts: {}}});
            }

            const context = {
                name: extensionData.name,
                extension_id: extensionAPIKey,
                cluster_url: getBaseURL(), 
                organization_id: configStore.get(CONFIG_KEYS.ORGANIZATION)
            };
            await createExtensionContext(context);
            console.log(chalk.green(`Extension context added for '${extensionData.name}'.`));

        } catch(error) {
            throw error;
        }
    }

    static async promptContextList(choices: Array<ChoiceOptions>): Promise<string> {
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    choices: choices,
                    prefix: `${chalk.yellowBright(`Note: List of context followed by Extension name and extension api key`)}`,
                    name: 'context_id',
                    message: '\nSelect the Context to use for extension:',
                    validate: validateEmpty
                }
            ])
            return answers.context_id;
        } catch(error) {
            throw new CommandError(error.message);
        }
    }

    static async promptExtensionAPIKey(): Promise<string> {
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    prefix:`${chalk.yellow('Note: You can find your extension API key in your extension details section on the partners panel.')}`,
                    message: `\nEnter Extension api key :`,
                    validate: validateEmpty,
                }
            ])
            return answers.name;
        } catch(error) {
            throw new CommandError(error.message);
        }
    }
}