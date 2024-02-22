import inquirer from "inquirer";
import CommandError, { ErrorCodes } from "./CommandError";
import { 
    FOLDER_NAME, 
    FUNCTION_TYPE, 
    USER_ACTIONS, 
    convertToSlug, 
    validateFunctionName, 
    validateUniqueEventNames
} from "../helper/functions.utils";
import { validateEmpty, validateEmptyArray } from "../helper/extension_utils";
import { ConfigEvent, CreateOptions, Event, EventChoices, FunctionConfig, FunctionType, SyncOptions, UserActions } from "../helper/functions.types";
import ExtensionService from './api/services/extension.service';
import path from "path";
import fs from "fs-extra";
import { 
    checkExtensionRepository, 
} from "../helper/extension_context.utils";
import chalk from 'chalk';

export default class FunctionCommands {

    public static async syncHandler(options: SyncOptions) {
        try {
            const currentContext = checkExtensionRepository();

            const functionFolderPath = path.join(process.cwd(), FOLDER_NAME);
            const items = fs.readdirSync(functionFolderPath);
            const folders = items.filter(item => fs.statSync(path.join(functionFolderPath, item)).isDirectory());

            let slug = options.slug;
            if (!slug) {
                slug = await FunctionCommands.promptFunctionSlugChoice(folders);
            }
            
            if(!folders.includes(slug)){
                throw new CommandError(ErrorCodes.INVALID_FUNCTION_SLUG.message(folders.join(', ')), ErrorCodes.INVALID_FUNCTION_SLUG.code);
            }

            const slugFolderPath = path.join(functionFolderPath, slug);
            const configData: FunctionConfig = require(path.join(slugFolderPath, 'config.js'));
            const codeSnippet: string = fs.readFileSync(path.join(slugFolderPath, 'index.js'), 'utf-8');

            if (configData.slug !== slug) {
                throw new CommandError(
                    ErrorCodes.FUNCTION_SLUG_MISMATCH.message,
                    ErrorCodes.FUNCTION_SLUG_MISMATCH.code
                )
            }


            // TODO: validate if there is exactly one function in index.js for each event
            validateUniqueEventNames(configData.events);

            const [isFunctionExists, data] = await ExtensionService.getFunctionByFunctionIdOrSlug(currentContext.extension_id, slug);

            if (!isFunctionExists) {
                // create function with version data
                const requestPayload = {
                    name: configData.name,
                    description: configData.description ?? " ",
                    type: configData.type,
                    events: configData.events.map((el) => ({event_slug: el.name, event_version: el.version})),
                    code_snippet: codeSnippet
                }
                await ExtensionService.createExtensionFunction(requestPayload, currentContext.extension_id);
                console.log(chalk.green(`Function "${slug}" synced successfully`));
                return;
            }
            
            // If function exists

            // compare changes
            const isFunctionUpdated = (configData.name !== data.name || configData.description !== data.description);
            const isFunctionVersionUpdated = (FunctionCommands.isEventsUpdated(configData.events, data.events) || codeSnippet !== data.code_snippet);

            if (!isFunctionUpdated && !isFunctionVersionUpdated) {
                throw new CommandError(
                    ErrorCodes.NO_CHANGES.message,
                    ErrorCodes.NO_CHANGES.code
                )
            }

            // give options to user if pull/push/cancel
            const userAction = await FunctionCommands.promptUserActions();

            if (userAction === USER_ACTIONS.CANCEL) {
                console.log(
                    chalk.green(`Sync operation cancelled`)
                );
                return;
            }
            
            if (userAction === USER_ACTIONS.PULL) {
                const config: FunctionConfig = {
                    name: data.name,
                    description: data.description,
                    slug: data.slug,
                    type: data.type,
                    events: data.events.map((el) => ({name: el.event_slug, version: el.event_version}))
                }

                await fs.outputFile(path.join(slugFolderPath, 'config.js'), `const config = ${JSON.stringify(config, null, 2)};\n module.exports = config;`);
                await fs.outputFile(path.join(slugFolderPath, 'index.js'), data.code_snippet);

                console.log(
                    chalk.green(`Function '${slug}' pulled successfully`)
                );

                return;
            }

            if (userAction === USER_ACTIONS.PUSH) {
                
                if (isFunctionUpdated) {
                    await ExtensionService.updateExtensionFunction(
                        { name: configData.name, description: configData.description },
                        currentContext.extension_id,
                        data._id
                    )
                }

                if (isFunctionVersionUpdated) {
                    await ExtensionService.updateFunctionVersion(
                        { code_snippet: codeSnippet, events: configData.events.map((el) => ({event_slug:el.name, event_version:el.version})) },
                        currentContext.extension_id,
                        data._id,
                        data.version_id
                    )
                }
                console.log(
                    chalk.green(`Function '${slug}' pushed successfully`)
                );

                return;
            }

        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static isEventsUpdated(configEvents: ConfigEvent[], events: Event[]): boolean {
        // check if events are updated or not
        if (configEvents.length !== events.length) {
            return true;
        }

        const configEventMap = new Map<string, string>();
        configEvents.forEach(event => {
            configEventMap.set(event.name, event.version);
        })

        for (const event of events) {
            const configVersion = configEventMap.get(event.event_slug);
            if (!configVersion || configVersion !== event.event_version) {
                return true;
            }
        }

        return false;
    }

    public static async createHandler(options: CreateOptions) {
        try {
            const currentContext = checkExtensionRepository();
            const { extension_id } = currentContext;
            if (!options.name) {
                options.name = await FunctionCommands.promptFunctionName();
            }

            validateFunctionName(options.name);
            const slug = convertToSlug(options.name);
            if (!options.type) {
                options.type = await FunctionCommands.promptFunctionType();
            }

            if (!Object.values(FUNCTION_TYPE).includes(options.type)) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_TYPE.message,
                    ErrorCodes.INVALID_FUNCTION_TYPE.code
                )
            }

            const [isSlugExists, data] = await ExtensionService.getFunctionByFunctionIdOrSlug(extension_id, slug);
            
            if(isSlugExists){
                throw new CommandError(
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.message(slug),
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.code
                ) 
            }

            const functionFolderPath = path.join(process.cwd(), FOLDER_NAME);
            if(!fs.existsSync(functionFolderPath)){
                fs.mkdirSync(functionFolderPath, {recursive: true});
            }

            const slugFolderPath = path.join(functionFolderPath, slug);
            if(fs.existsSync(slugFolderPath)){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(slug),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                ); 
            }
            else{
                fs.mkdirSync(slugFolderPath, {recursive: true});
            }

            const events = await ExtensionService.getFunctionsAllEvent();
            const selectedEventsSlug = await FunctionCommands.selectFunctionEvents(
                events.map((el)=> ({name: el.name, value: el.slug}))
            );
            
            const selectedEventsData = events.filter((el) => selectedEventsSlug.includes(el.slug));

            const config = {
                name: options.name,
                slug,
                description: '',
                type: options.type,
                events: selectedEventsData.map((el) => ({ name: el.name, version: el.version })),
            };
            
            const indexData = selectedEventsData.map((element) => `function ${element.slug}(context, payload) {\n\n}\n`).join('\n');
            const configFileData = `const config = ${JSON.stringify(config, null, 2)};\n module.exports = config;`
            
            const configFilePath = path.join(process.cwd(), FOLDER_NAME, slug, 'config.js');
            const indexFilePath = path.join(process.cwd(), FOLDER_NAME, slug, 'index.js');
            
            await fs.outputFile(configFilePath, configFileData);
            await fs.outputFile(indexFilePath, indexData);
            
            console.log(chalk.green(`Function created successfully. You can verify the functions at ${path.join(process.cwd(), FOLDER_NAME, slug)}`));
            
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async initializeFunction(options) {
        try{
            const currentContext = checkExtensionRepository();

            let slug = options.slug;
            if (!slug) {
                slug = await FunctionCommands.promptFunctionSlug();
            }

            const [isSlugExists, functionData] = await ExtensionService.getFunctionByFunctionIdOrSlug(currentContext.extension_id, slug);

            if (!isSlugExists) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(''),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const functionFolderPath = path.join(process.cwd(),  FOLDER_NAME);
            const slugFolderPath = path.join(functionFolderPath, functionData.slug);

            if(fs.existsSync(path.join(slugFolderPath))){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(functionData.slug),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                ); 
            }

            const config = {
                name: functionData.name,
                slug: functionData.slug,
                description: functionData.description,
                type: functionData.type,
                events: functionData.events.map((el) => ({name: el.event_slug, version: el.event_version}))
            };

            await fs.outputFile(path.join(slugFolderPath, 'config.js'), `const config = ${JSON.stringify(config, null, 2)};\n module.exports = config;`);
            await fs.outputFile(path.join(slugFolderPath, 'index.js'), functionData.code_snippet);

            console.log(chalk.green(`Function initialized successfully you can verify the function at ${path.join(slugFolderPath)}`));
        }
        catch(err){
            throw err;
        }
    }

    static async promptFunctionSlugChoice(choices): Promise<string> {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                name: 'slug',
                message: 'Select Function Slug to Sync:',
                validate: validateEmpty
            }
        ])
        return answer.slug;
    }

    static async promptFunctionSlug(): Promise<string> {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'function_slug',
            message: 'Enter Function slug:',
            validate: validateEmpty
        }])
        return answer.function_slug;
    }

    static async promptFunctionName(): Promise<string> {
        try {
            let answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'function_name',
                    message: 'Enter Function name:',
                    validate: validateEmpty
                }
            ]);
            return answers.function_name;
        } catch(error) {
            throw new CommandError(error.message);
        }
    }

    static async promptFunctionType(): Promise<FunctionType> {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                choices: Object.values(FUNCTION_TYPE),
                default: FUNCTION_TYPE.IN_HOOK,
                name: 'function_type',
                message: 'Select Function type:',
                validate: validateEmpty
            }
        ])
        return answers.function_type;
    }

    static async selectFunctionEvents(choices: EventChoices): Promise<Array<String>> { 
        const answers = await inquirer.prompt([{
            type: "checkbox",
            choices,
            message: 'Select events needed for function ?',
            name: "selectedEvents",
            validate: validateEmptyArray
        }])
        return answers.selectedEvents;
    }

    static async promptUserActions(): Promise<UserActions> {
        const choices = [
            {
                name: 'pull - take a pull of function from Partners panel and update in local',
                value: USER_ACTIONS.PULL
            },
            {
                name: 'push - push your local function changes to Partners panel',
                value: USER_ACTIONS.PUSH
            },
            {
                name: 'cancel - cancel sync operation',
                value: USER_ACTIONS.CANCEL
            }
        ]
        const answers = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                default: USER_ACTIONS.PULL,
                name: 'action',
                message: `${chalk.yellow('Code is updated either using Partners panel or using CLI')} \nPlease choose one of the below option:`
            }
        ])
        return answers.action;
    }
}