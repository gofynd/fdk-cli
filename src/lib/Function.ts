import inquirer from "inquirer";
import CommandError, { ErrorCodes } from "./CommandError";
import { 
    FOLDER_NAME, 
    FUNCTION_TYPE, 
    USER_ACTIONS, 
    convertToSlug, 
    getAvailableFunctionList, 
    getStatusString, 
    readFunctionCode, 
    readFunctionConfig, 
    validateFunctionName, 
    validateUniqueEventNames,
    writeFunctionCode,
    writeFunctionConfig
} from "../helper/functions.utils";
import { validateEmpty, validateEmptyArray } from "../helper/extension_utils";
import { 
    ConfigEvent, 
    CreateOptions, 
    Event, 
    EventChoices, 
    Function,
    FunctionType, 
    InitOptions, 
    SyncOptions, 
    TestOptions, 
    TestResult, 
    UpdateFunctionVersionResponse, 
    UserActions 
} from "../helper/functions.types";
import ExtensionService from './api/services/extension.service';
import path from "path";
import fs from "fs-extra";
import {
    checkExtensionRepository,
    updateFunctionContext, 
} from "../helper/extension_context.utils";
import chalk from 'chalk';

export default class FunctionCommands {

    public static async syncHandler(options: SyncOptions) {
        try {
            const currentContext = checkExtensionRepository();

            const slugList = getAvailableFunctionList()
            const slug = options.slug || await FunctionCommands.promptFunctionSlugChoice(slugList);
            
            if(!slugList.includes(slug)){
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(slugList.join(', ')),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const configData = readFunctionConfig(slug);
            const codeSnippet = readFunctionCode(slug);

            if (configData.slug !== slug) {
                throw new CommandError(
                    ErrorCodes.FUNCTION_SLUG_MISMATCH.message,
                    ErrorCodes.FUNCTION_SLUG_MISMATCH.code
                )
            }

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
                const data = await ExtensionService.createExtensionFunction(requestPayload, currentContext.extension_id);
                updateFunctionContext(currentContext, slug, data.modified_at, data.version_data.modified_at);
                console.log(chalk.green(`Function '${slug}' synced successfully`));
                return;
            }
            
            // If function exists

            // compare changes
            const isFunctionUpdated = (configData.name !== data.name || configData.description !== data.description);
            const isFunctionVersionUpdated = (
                FunctionCommands.isEventsUpdated(configData.events, data.version_data.events) 
                || codeSnippet !== data.version_data.code_snippet
            );

            if (!isFunctionUpdated && !isFunctionVersionUpdated) {
                throw new CommandError(
                    ErrorCodes.NO_CHANGES.message,
                    ErrorCodes.NO_CHANGES.code
                )
            }

            // check for conflicts
            let isThereConflicts: boolean = false;
            
            let newFunctionTimestamp: string;
            let newVersionTimestamp: string;
            
            const index = currentContext.functions.findIndex((value) => (value.slug === slug));
            if (index !== -1) {
                const [functionTimestamp, versionTimestamp] = Buffer.from(currentContext.functions[index].hash, 'base64').toString('utf-8').split('=');

                if (isFunctionUpdated && new Date(data.modified_at) > new Date(functionTimestamp)) {
                    isThereConflicts =  true;
                }

                if (isFunctionVersionUpdated && new Date(data.version_data.modified_at) > new Date(versionTimestamp)) {
                    isThereConflicts = true;
                }
            }

            if (isThereConflicts) {

                // give options to user if pull/push/cancel
                const userAction = await FunctionCommands.promptUserActions();
    
                if (userAction === USER_ACTIONS.CANCEL) {
                    console.log(
                        chalk.green(`Sync operation cancelled`)
                    );
                    return;
                }
                
                if (userAction === USER_ACTIONS.PULL) {                    
                    writeFunctionConfig(data.name, data.description, data.slug, data.type, data.version_data.events)
                    writeFunctionCode(data.slug, data.version_data.code_snippet)
                    updateFunctionContext(currentContext, slug, data.modified_at, data.version_data.modified_at)

                    console.log(
                        chalk.green(`Function '${slug}' pulled successfully`)
                    );
                    return;
                }
    
                if (userAction === USER_ACTIONS.PUSH) {
                    
                    if (isFunctionUpdated) {
                        const updatedFunctionData: Function = await ExtensionService.updateExtensionFunction(
                            { name: configData.name, description: configData.description },
                            currentContext.extension_id,
                            data._id
                        )
                        newFunctionTimestamp = updatedFunctionData.modified_at;
                        newVersionTimestamp = data.version_data.modified_at;
                    }
    
                    if (isFunctionVersionUpdated) {
                        const updatedVersionData: UpdateFunctionVersionResponse = await ExtensionService.updateFunctionVersion(
                            { code_snippet: codeSnippet, events: configData.events.map((el) => ({event_slug:el.name, event_version:el.version})) },
                            currentContext.extension_id,
                            data._id,
                            data.version_data._id
                        )
                        newFunctionTimestamp = updatedVersionData.function_data.modified_at;
                        newVersionTimestamp = updatedVersionData.modified_at;
                    }

                    console.log(
                        chalk.green(`Function '${slug}' pushed successfully`)
                    );
                    return;
                }
            }

            else {
                if (isFunctionUpdated) {
                    const updatedFunctionData: Function = await ExtensionService.updateExtensionFunction(
                        { name: configData.name, description: configData.description },
                        currentContext.extension_id,
                        data._id
                    )
                    newFunctionTimestamp = updatedFunctionData.modified_at;
                    newVersionTimestamp = data.version_data.modified_at;
                }

                if (isFunctionVersionUpdated) {
                    const updatedVersionData: UpdateFunctionVersionResponse = await ExtensionService.updateFunctionVersion(
                        { code_snippet: codeSnippet, events: configData.events.map((el) => ({event_slug:el.name, event_version:el.version})) },
                        currentContext.extension_id,
                        data._id,
                        data.version_data._id
                    )
                    newVersionTimestamp = updatedVersionData.modified_at;
                    newFunctionTimestamp = updatedVersionData.function_data.modified_at;
                }

                console.log(
                    chalk.green(`Function '${slug}' synced successfully`)
                );

                return;
            }

            updateFunctionContext(currentContext, slug, newFunctionTimestamp, newVersionTimestamp);

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
            const indexData = selectedEventsData.map((element) => `function ${element.slug}(context, payload) {\n\n}\n`).join('\n');        
            
            writeFunctionConfig(options.name, '', slug, options.type, selectedEventsData)
            writeFunctionCode(slug, indexData)
            
            console.log(chalk.green(`Function created successfully. You can verify the functions at ${path.join(process.cwd(), FOLDER_NAME, slug)}`));
            
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async initializeFunction(options: InitOptions) {
        try{
            const currentContext = checkExtensionRepository();

            const slug = options.slug || await FunctionCommands.promptFunctionSlug();
            const [isSlugExists, data] = await ExtensionService.getFunctionByFunctionIdOrSlug(currentContext.extension_id, slug);

            if (!isSlugExists) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(''),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const slugFolderPath = path.join(process.cwd(), FOLDER_NAME, data.slug);

            if(fs.existsSync(path.join(slugFolderPath))){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(data.slug),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                );
            }

            writeFunctionConfig(data.name, data.description, data.slug, data.type, data.version_data.events);
            writeFunctionCode(data.slug, data.version_data.code_snippet);
            updateFunctionContext(currentContext, data.slug, data.modified_at, data.version_data.modified_at);

            console.log(chalk.green(`Function initialized successfully.\nVerify the function at ${path.join(slugFolderPath)}`));
        }
        catch(err){
            throw err;
        }
    }

    public static async testHandler(options: TestOptions) {
        try {
            const currentContext = checkExtensionRepository();

            const slugList = getAvailableFunctionList();
            const slug = options.slug || await FunctionCommands.promptFunctionSlugChoice(slugList);

            if(!slugList.includes(slug)){
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(slugList.join(', ')),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const codeSnippet = readFunctionCode(slug);
            const config = readFunctionConfig(slug);

            const [isFunctionExists, functionData] = await ExtensionService.getFunctionByFunctionIdOrSlug(currentContext.extension_id, slug);

            if (!isFunctionExists) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(''),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                )
            }

            const testResult = await ExtensionService.runFunctionTests(currentContext.extension_id, functionData._id, { 
                code: codeSnippet, 
                events: config.events.map((el) => ({event_slug: el.name, event_version: el.version}))
            })        

            FunctionCommands.printTestResultString(testResult);

        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static printTestResultString(testResult: TestResult): void {
        let count = 1;

        for (const testCase of testResult.items) {
            console.log(chalk.blue(`${count}. ${testCase.name} ${getStatusString(testCase.status)}\n`));
            
            for (const testEvent of testCase.events) {
                console.log(chalk.blue(`  - ${testEvent.event_slug} ${testEvent.event_version} ${getStatusString(testEvent.status)}`));

                for (const eventResult of testEvent.results) {
                    eventResult.type
                    if (eventResult.status === 'PASS') {
                        console.log(chalk.green(`    \u2714 ${eventResult.type} - ${eventResult.message}`));
                    } else {
                        console.log(chalk.red(`    \u2716 ${eventResult.type} - ${eventResult.message}`));
                    }
                }

                console.log();
            }

            count++;
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