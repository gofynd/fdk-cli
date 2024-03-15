import inquirer from "inquirer";
import CommandError, { ErrorCodes } from "./CommandError";
import { 
    FOLDER_NAME, 
    FUNCTION_TYPE, 
    USER_ACTIONS, 
    convertToSlug, 
    filterTestResponse, 
    getAvailableFunctionList, 
    getFunctionData, 
    getStatusString, 
    getTestMessage, 
    stringifyTests, 
    validateFunctionName,
    writeFunctionCode,
    writeFunctionConfig,
    writeFunctionTest
} from "../helper/functions.utils";
import { validateEmpty, validateEmptyArray } from "../helper/extension_utils";
import { 
    ConfigEvent, 
    CreateOptions, 
    Event, 
    EventChoices, 
    Function,
    FunctionConfig,
    FunctionTest,
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
import { ActiveExtensionContext } from "../helper/context.types";
import _ from 'lodash';

export default class FunctionCommands {

    public static async syncHandler(options: SyncOptions) {
        try {
            const currentContext = checkExtensionRepository();

            const slugList = getAvailableFunctionList()
            const slug = options.slug || await FunctionCommands.promptFunctionSlugChoice(slugList);
            
            if(!slugList.includes(slug)){
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(`Please select a slug from the available list: ${slugList.join(', ')}`),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const [configData, codeSnippet, tests] = await getFunctionData(slug);
            const [isFunctionExists, data] = await ExtensionService.getFunctionBySlug(currentContext.extension_id, slug);

            if (!isFunctionExists) {
                const requestPayload = {
                    name: configData.name,
                    description: configData.description ?? " ",
                    type: configData.type,
                    events: configData.events.map((el) => ({event_slug: el.name, event_version: el.version})),
                    code_snippet: codeSnippet
                }

                let hash: string;

                const createFunctionResponse = await ExtensionService.createExtensionFunction(requestPayload, currentContext.extension_id);
                hash = createFunctionResponse.hash;

                if (tests.length > 0) {
                    const updateTestsResponse = await ExtensionService.updateFunctionTests(tests, currentContext.extension_id, createFunctionResponse._id);
                    hash = updateTestsResponse.function_data.hash;
                }

                updateFunctionContext(currentContext, slug, hash);
                console.log(chalk.green(`Function '${slug}' synced successfully`));
                return;
            }

            const testsResponse = filterTestResponse(await ExtensionService.getAllFunctionTests(currentContext.extension_id, data._id));

            // compare changes
            const isFunctionUpdated = (configData.name !== data.name || configData.description !== data.description);
            const isFunctionVersionUpdated = (
                FunctionCommands.isEventsUpdated(configData.events, data.version_data.events) 
                || codeSnippet !== data.version_data.code_snippet
            );
            const isFunctionTestsUpdated = FunctionCommands.isTestsUpdated(tests, testsResponse);

            if (!isFunctionUpdated && !isFunctionVersionUpdated && !isFunctionTestsUpdated) {
                throw new CommandError(
                    ErrorCodes.NO_CHANGES.message,
                    ErrorCodes.NO_CHANGES.code
                )
            }

            // check conflicts
            const contextHash = currentContext.functions.find((item) => (item.slug === slug))?.hash;
            const isThereConflicts = !contextHash || contextHash !== data.hash;

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

                    writeFunctionConfig(data.name, data.description, data.slug, data.type, data.version_data.events);
                    writeFunctionCode(data.slug, data.version_data.code_snippet);
                    writeFunctionTest(data.slug, testsResponse);
                    updateFunctionContext(currentContext, slug, data.hash);

                    console.log(
                        chalk.green(`Function '${slug}' pulled successfully`)
                    );
                    return;
                }
    
                if (userAction === USER_ACTIONS.PUSH) {

                    await FunctionCommands.handleFunctionPush(
                        slug, currentContext, data._id, data.version_data._id,
                        configData, codeSnippet, tests,
                        isFunctionTestsUpdated, isFunctionUpdated, isFunctionVersionUpdated
                    );

                    console.log(
                        chalk.green(`Function '${slug}' pushed successfully`)
                    );
                    return;
                }
            }

            else {

                await FunctionCommands.handleFunctionPush(
                    slug, currentContext, data._id, data.version_data._id,
                    configData, codeSnippet, tests,
                    isFunctionTestsUpdated, isFunctionUpdated, isFunctionVersionUpdated
                );

                console.log(
                    chalk.green(`Function '${slug}' synced successfully`)
                );
                return;
            }

        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static async handleFunctionPush(
        slug: string, currentContext: ActiveExtensionContext, function_id: string, version_id: string,
        configData: FunctionConfig, codeSnippet: string, tests: FunctionTest[],
        isFunctionTestsUpdated: boolean = true, isFunctionUpdated: boolean = true, isFunctionVersionUpdated: boolean = true,
    ): Promise<void> {
        
        let hash: string;

        if (isFunctionTestsUpdated) {
            const updatedTestsData = await ExtensionService.updateFunctionTests(
                tests, currentContext.extension_id, function_id
            );
            hash = updatedTestsData.function_data.hash;
        }

        if (isFunctionUpdated) {
            const updatedFunctionData: Function = await ExtensionService.updateExtensionFunction(
                { name: configData.name, description: configData.description },
                currentContext.extension_id,
                function_id
            )
            hash = updatedFunctionData.hash;
        }

        if (isFunctionVersionUpdated) {
            const updatedVersionData: UpdateFunctionVersionResponse = await ExtensionService.updateFunctionVersion(
                { code_snippet: codeSnippet, events: configData.events.map((el) => ({event_slug:el.name, event_version:el.version})) },
                currentContext.extension_id,
                function_id,
                version_id
            )
            hash = updatedVersionData.function_data.hash;
        }

        updateFunctionContext(currentContext, slug, hash);
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
    
    static isTestsUpdated(localTests: FunctionTest[], serverTests: FunctionTest[]) {
        if (localTests.length !== serverTests.length) return true; // Different number of tests
    
        for (let test of localTests) {
            const matchingTest = serverTests.find(t => t.name === test.name);
            if (!matchingTest) return true; // No matching test found by name
    
            if (test.events.length !== matchingTest.events.length) return true; // Different number of events in the tests
    
            for (let event of test.events) {
                const matchingEvent = matchingTest.events.find(
                    e => e.event_slug === event.event_slug && e.event_version === event.event_version
                );
                if (!matchingEvent) return true; // No matching event found by slug and version
    
                // Deep comparison of the event objects to ensure they are identical
                if (!_.isEqual(event, matchingEvent)) return true;
            }
        }
    
        return false; // If all checks pass, the JSON objects are considered the same
    }

    public static async createHandler(options: CreateOptions) {
        try {
            const currentContext = checkExtensionRepository();
            const { extension_id } = currentContext;
            
            options.name = options.name || await FunctionCommands.promptFunctionName();

            validateFunctionName(options.name);
            const slug = convertToSlug(options.name);

            // options.type = options.type || await FunctionCommands.promptFunctionType();

            // if (!Object.values(FUNCTION_TYPE).includes(options.type)) {
            //     throw new CommandError(
            //         ErrorCodes.INVALID_FUNCTION_TYPE.message,
            //         ErrorCodes.INVALID_FUNCTION_TYPE.code
            //     )
            // }
            options.type = 'inhook';

            const [isSlugExists] = await ExtensionService.getFunctionBySlug(extension_id, slug);
            
            if(isSlugExists){
                throw new CommandError(
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.message(slug),
                    ErrorCodes.FUNCTION_WITH_SLUG_ALREADY_EXIST.code
                ) 
            }

            const functionFolderPath = path.join(process.cwd(), FOLDER_NAME);
            fs.ensureDirSync(functionFolderPath);

            const slugFolderPath = path.join(functionFolderPath, slug);
            if (fs.existsSync(slugFolderPath)) {
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(slug, `Use another name for function`),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                ); 
            }
            fs.ensureDirSync(slugFolderPath)

            const events = await ExtensionService.getFunctionsAllEvent();
            const selectedEventsSlug = await FunctionCommands.selectFunctionEvents(
                events.map((el)=> ({name: el.name, value: el.slug}))
            );
            
            const selectedEventsData = events.filter((el) => selectedEventsSlug.includes(el.slug));
            const configEvents = selectedEventsData.map((el) => ({event_slug: el.slug, event_version: el.version}));
            const indexData = selectedEventsData.map((element) => `function ${element.slug}(context, payload) {\n\n}\n`).join('\n');
            
            writeFunctionConfig(options.name, ' ', slug, options.type, configEvents);
            writeFunctionCode(slug, indexData);
            writeFunctionTest(slug, []);
            
            console.log(chalk.green(`Function created successfully.`));
            console.log(chalk.green(`You can verify the functions at ${path.join(process.cwd(), FOLDER_NAME, slug)}`))
            
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async initHandler(options: InitOptions) {
        try{
            const currentContext = checkExtensionRepository();

            const slug = options.slug || await FunctionCommands.promptFunctionSlug();
            const [isSlugExists, data] = await ExtensionService.getFunctionBySlug(currentContext.extension_id, slug);

            if (!isSlugExists) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(`Function '${slug}' does not exists.`),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const slugFolderPath = path.join(process.cwd(), FOLDER_NAME, data.slug);

            if(fs.existsSync(path.join(slugFolderPath)) && !options.force){
                throw new CommandError(
                    ErrorCodes.FOLDER_ALREADY_EXISTS.message(data.slug, `Delete folder and Try again or use '-f' to force init`),
                    ErrorCodes.FOLDER_ALREADY_EXISTS.code
                );
            }

            const testResponse = await ExtensionService.getAllFunctionTests(currentContext.extension_id, data._id);
            const tests = filterTestResponse(testResponse);

            writeFunctionConfig(data.name, data.description, data.slug, data.type, data.version_data.events);
            writeFunctionCode(data.slug, data.version_data.code_snippet);
            writeFunctionTest(slug, tests);
            updateFunctionContext(currentContext, data.slug, data.hash);

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
                    ErrorCodes.INVALID_FUNCTION_SLUG.message(`Please select a slug from the available list: ${slugList.join(', ')}`),
                    ErrorCodes.INVALID_FUNCTION_SLUG.code
                );
            }

            const [configData, codeSnippet, tests] = await getFunctionData(slug);
            const updatedTests = stringifyTests(tests)

            const [isFunctionExists, functionData] = await ExtensionService.getFunctionBySlug(currentContext.extension_id, slug);

            if (!isFunctionExists) {
                throw new CommandError(
                    ErrorCodes.SYNC_BEFORE_TEST.message,
                    ErrorCodes.SYNC_BEFORE_TEST.code
                )
            }

            const testResult = await ExtensionService.runFunctionTests(currentContext.extension_id, functionData._id, { 
                code: codeSnippet, 
                events: configData.events.map((el) => ({event_slug: el.name, event_version: el.version})),
                tests: updatedTests
            });

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
                        console.log(chalk.green(`    \u2714 ${eventResult.type} - ${getTestMessage(eventResult.message)}`));
                    } else {
                        console.log(chalk.red(`    \u2716 ${eventResult.type} - ${getTestMessage(eventResult.message)}`));
                    }
                }

                console.log();
            }

            count++;
        }
    }

    static async promptFunctionSlugChoice(choices: string[]): Promise<string> {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                name: 'slug',
                message: 'Select Function Slug:',
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