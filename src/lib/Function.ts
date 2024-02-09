import inquirer from "inquirer";
import CommandError, { ErrorCodes } from "./CommandError";
import { FUNCTION_TYPE, convertToSlug, validateFunctionName } from "../helper/functions.utils";
import { validateEmpty, validateEmptyArray } from "../helper/extension_utils";
import { CreateFunctionOptions, FunctionType } from "../helper/functions.types";
import ExtensionService from './api/services/extension.service';
import path from "path";
import fs from "fs-extra";
import { getExtensionActiveContext } from '../helper/utils';
import configStore ,{ CONFIG_KEYS } from './Config';
import chalk from 'chalk';

export default class FunctionCommands {

    public static async syncHandler(options) {
        try {
        const currentContext = await FunctionCommands.checkExtensionRepository();
        let slug = options?.name;
        const functionFolderPath = path.join(process.cwd(), 'functions');
        const items = fs.readdirSync(functionFolderPath);
        const folders = items.filter(item => fs.statSync(path.join(functionFolderPath, item)).isDirectory());
        if(!slug){
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    choices: folders,
                    name: 'slug',
                    message: 'Select Function Slug to Sync:',
                    validate: validateEmpty
                }
            ]);
            slug = answer.slug;
        }
        if(!folders.includes(slug)){
            throw new CommandError(ErrorCodes.INVALID_FUNCTION_SLUG.message(folders.join(', ')), ErrorCodes.INVALID_FUNCTION_SLUG.code);
        }
        const isSlugAlreadyCreated = await ExtensionService.getFunctionByFunctionIdOrSlug(currentContext.extension_id, slug);
        let functionData;
        const slugFolderPath = path.join(functionFolderPath, slug);
        const slugConfigJsData = require(path.join(slugFolderPath, 'config.js'));
        const payload = {
            name: slugConfigJsData.name,
            description: slugConfigJsData.description || 'example-description',
            type: slugConfigJsData.type
        };
        if(!isSlugAlreadyCreated){
            functionData = await ExtensionService.createExtensionFunction(payload, currentContext.extension_id);
            console.log(chalk.green(`Function Created Successfully`));
        }
        else{
            functionData = await ExtensionService.updateExtensionFunction(payload,currentContext.extension_id, isSlugAlreadyCreated._id);
            console.log(chalk.green(`Function Updated Successfully`));
        }
        const code_snippet = fs.readFileSync(path.join(slugFolderPath, 'index.js'),  { encoding: 'utf-8' });
        const versionUpdatePayload = {
            code_snippet: code_snippet,
            events: slugConfigJsData.events.map((el)=> ({event_slug: el.name, event_version: 
            el.version})),
            description: slugConfigJsData.description || 'example-description',
            name: slugConfigJsData.name,
            type: slugConfigJsData.type
        };
        await ExtensionService.updateFunctionVersion(versionUpdatePayload, currentContext.extension_id, functionData._id, functionData.version_id );
        console.log(chalk.green(`Function ${slugConfigJsData.name} synced succesfully.`));
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }


    public static async createHandler(options: CreateFunctionOptions) {
        try {
            const currentContext = await FunctionCommands.checkExtensionRepository();
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
            // const { _id: extensionId } = await FunctionCommands.selectExtension();

            const isSlugAlreadyUsed = await ExtensionService.getFunctionByFunctionIdOrSlug(extension_id, slug);
            
            if(isSlugAlreadyUsed){
                throw new CommandError(
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.message(slug),
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.code
                ) 
            }

            const functionFolderPath = path.join(process.cwd(),'functions');
            if(!fs.existsSync(functionFolderPath)){
                fs.mkdirSync(functionFolderPath, {recursive: true});
            }
            const events = await ExtensionService.getFunctionsAllEvent();
            const selectedEventsSlug = await FunctionCommands.selectFunctionEvents(events.map((el)=> ({name: el.name, value: el.slug})));
            const slugFolderPath = path.join(functionFolderPath,slug);
            if(fs.existsSync(slugFolderPath)){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(slug),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                ); 
            }
            else{
                fs.mkdirSync(slugFolderPath, {recursive: true});
            }
            const selectedEventsData = events.filter((el) => selectedEventsSlug.includes(el.slug));

            const config = {
                name: options.name,
                slug,
                description: '',
                type: options.type,
                events: selectedEventsData.map((el) => ({ name: el.name, version: el.version })),
            };
            
            const indexData = selectedEventsData.map((element) => `function ${element.slug}(context, payload) {\n\n}\n`).join('\n');
            
            const configFilePath = path.join(process.cwd(), 'functions', slug, 'config.js');
            const indexFilePath = path.join(process.cwd(), 'functions', slug, 'index.js');
            
            await fs.outputFile(configFilePath, `const config = ${JSON.stringify(config, null, 2)};\n module.exports = config;`);
            await fs.outputFile(indexFilePath, indexData);
            
            console.log(chalk.green(`Functions created successfully. You can verify the functions at ${path.join(process.cwd(), 'functions', slug)}`));
            
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async initializeFunction() {
        try{
            const currentContext = await FunctionCommands.checkExtensionRepository();
            const pageSize = 1000;
            let pageNo = 1;
            let functionList = await ExtensionService.getExtensionFunctionsList(currentContext.extension_id, pageNo, pageSize);
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'functions',
                    message: 'Enter Function slug:',
                    validate: validateEmpty
                }
            ]);
            const selectedFunctionData = functionList.items.find((el)=> el.slug === answers.functions);
            if(!selectedFunctionData){
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(''),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                ); 
            }
            const functionFolderPath = path.join(process.cwd(),'functions');
            const slugFolderPath = path.join(functionFolderPath, selectedFunctionData.slug);
            if(fs.existsSync(path.join(slugFolderPath))){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(selectedFunctionData.slug),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                ); 
            }
            const functionSnippet = await ExtensionService.getFunctionVersionByVersionId(currentContext.extension_id,selectedFunctionData._id,selectedFunctionData.version_id);

            const config = {
                name: functionSnippet.function_data.name,
                slug: functionSnippet.function_data.slug,
                description: functionSnippet.function_data.description,
                type: functionSnippet.function_data.type,
                events: functionSnippet.events.map((el)=> ({name: el.event_slug, version: el.event_version }))
            };

            await fs.outputFile(path.join(slugFolderPath, 'config.js'), `const config = ${JSON.stringify(config, null, 2)};\n module.exports = config;`);
            await fs.outputFile(path.join(slugFolderPath, 'index.js'), functionSnippet.code_snippet);

            console.log(chalk.green(`Function initialized successfully you can verify the function at ${path.join(slugFolderPath)}`));
        }
        catch(err){
            throw err;
        }
    }

    public static async changeContext () {
        try{
        getExtensionActiveContext();
        const contextJsonPath = path.join(process.cwd(),'.fdk', 'context.json');
        const completeContext = fs.readJSONSync(contextJsonPath);
        const contextData = completeContext.extension.contexts;
        const contextArray = Object.keys(contextData).map((el)=> contextData[el]);
        const choices = contextArray.map((el)=> ({name: `${el.name} (${el.extension_id})`, 
        value: el.extension_id }));
        let answers = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                prefix: `${chalk.yellowBright(`Note: List of context followed by Extension name and extension api key`)}`,
                name: 'context_id',
                message: '\nSelect the Context to use for extension:',
                validate: validateEmpty
            }
        ]);
        const activeContextId = answers.context_id;
        completeContext.extension.active_context = activeContextId;
        await fs.writeJSONSync(contextJsonPath, completeContext);

        console.log(chalk.green(`Context changed to Extension ${contextData[activeContextId].name} Successfully`));
        }
        catch(err){
            throw err;
        }
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
        try {
            let answers = await inquirer.prompt([
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
        catch(err){
        console.log(err);
        };
    }

    static async selectFunctionEvents(choices) {
        const answers = await inquirer.prompt([{
            type: "checkbox",
            choices,
            message: 'Select events needed for function ?',
            name: "selectedEvents",
            validate: validateEmptyArray
        }])
        return answers.selectedEvents;
    }

    static async checkExtensionRepository() {
        const extensionContext = getExtensionActiveContext();
        const currentOrganization = configStore.get(CONFIG_KEYS.ORGANIZATION);
        if(extensionContext.organization_id !== currentOrganization){
            throw new CommandError(ErrorCodes.MISMATCH_ORGANIZATION_ID.message(currentOrganization, extensionContext.organization_id), ErrorCodes.MISMATCH_ORGANIZATION_ID.code);
        };
        return extensionContext;
    }

}