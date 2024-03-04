import CommandError, { ErrorCodes } from "../lib/CommandError";
import {
    Event, 
    ConfigEvent,
    FunctionType,
    FunctionTest, 
    FunctionConfig, 
    FunctionTestModel,
    TestPayload,
} from "./functions.types";
import path from 'path';
import fs from 'fs-extra';
import chalk from "chalk";

export const validateFunctionName = (name: string): void => {
    const minLength: number = 3;

    // Rule 1: at least 3 character long
    if (name.length < minLength) {
        throw new CommandError(
            ErrorCodes.INVALID_FUNCTION_NAME.message(`Name must be at least ${minLength} characters long`),
            ErrorCodes.INVALID_FUNCTION_NAME.code
        )
    }

    // Rule 2: only contain alphabets a-z,A-Z and digits 0-9 (no special characters)
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
        throw new CommandError(
            ErrorCodes.INVALID_FUNCTION_NAME.message('Name must only contain alphabets and digits (no special characters)'),
            ErrorCodes.INVALID_FUNCTION_NAME.code
        )
    }

    // Rule 3: should not start with a digit
    if (/^\d/.test(name)) {
        throw new CommandError(
            ErrorCodes.INVALID_FUNCTION_NAME.message('Name should not start with a digit'),
            ErrorCodes.INVALID_FUNCTION_NAME.code
        )
    }
}

export const validateUniqueEventNames = (events: ConfigEvent[]): boolean => {
    const eventNames = new Set();

    for (const event of events) {
        if (eventNames.has(event.name)) {
            throw new CommandError(
                ErrorCodes.INVALID_FUNCTION_EVENTS_ARRAY.message,
                ErrorCodes.INVALID_FUNCTION_EVENTS_ARRAY.code
            )
        }

        eventNames.add(event.name);
    }

    return true;
}

export const validateFunctionTests = (tests: FunctionTest[], validEvents: ConfigEvent[]): boolean => {
    const names = new Set();

    for (const test of tests) {

        if(!test.name || !test.events) {
            throw new CommandError(
                ErrorCodes.INVALID_FUNCTION_TESTS.message(`All test cases must have required fields name and events`),
                ErrorCodes.INVALID_FUNCTION_TESTS.code
            );
        }

        if (names.has(test.name)) {
            throw new CommandError(
                ErrorCodes.INVALID_FUNCTION_TESTS.message(`${test.name} name used for multiple test cases.`),
                ErrorCodes.INVALID_FUNCTION_TESTS.code
            );
        }
        names.add(test.name);

        if (test.events.length === 0) {
            throw new CommandError(
                ErrorCodes.INVALID_FUNCTION_TESTS.message(`${test.name} must have at least one event.`),
                ErrorCodes.INVALID_FUNCTION_TESTS.code
            );
        }

        for (const event of test.events) {
            if (!event.event_slug || !event.event_version || !event.input_data || !event.output_data) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_TESTS.message(`${test.name} events must have all the required fields`),
                    ErrorCodes.INVALID_FUNCTION_TESTS.code
                );
            }

            const isValidEvent = validEvents.some(validEvent => validEvent.name === event.event_slug && validEvent.version === event.event_version);
            if (!isValidEvent) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_TESTS.message(`${event.event_slug} ${event.event_version} does not exits in function`),
                    ErrorCodes.INVALID_FUNCTION_TESTS.code
                );
            }
        }
    }

    return true
}

export const convertToSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export const FUNCTION_TYPE = {
    IN_HOOK: 'inhook',
    INGRESS: 'ingress'
}

export const FOLDER_NAME = 'functions';
export const CONFIG_FILE = 'config.json';
export const INDEX_FILE = 'index.js';
export const TEST_FILE = 'test.json';

export const USER_ACTIONS = {
    PULL: 'pull',
    PUSH: 'push',
    CANCEL: 'cancel'
}

export const writeFunctionConfig = (name: string, description: string, slug: string, type: FunctionType, events: Event[]):void => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, CONFIG_FILE);
    const configData: FunctionConfig = {
        name,
        description,
        slug,
        type,
        events: events.map((el) => ({name: el.event_slug, version: el.event_version}))
    }

    fs.outputFileSync(filePath, JSON.stringify(configData, null, 4));
}

export const getFunctionConfig = (slug: string): FunctionConfig => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, CONFIG_FILE);
    const configData = require(filePath);

    const requiredFields = ['name', 'description', 'slug', 'type', 'events'];
    const missingFields = requiredFields.filter(field => !configData.hasOwnProperty(field));
    if (missingFields.length > 0) {
        throw new CommandError(
            ErrorCodes.INVALID_FUNCTION_CONFIG.message(`Missing field(s) in function config file - ${missingFields.join(', ')}`),
            ErrorCodes.INVALID_FUNCTION_CONFIG.code
        )
    }

    if (configData.slug !== slug) {
        throw new CommandError(
            ErrorCodes.INVALID_FUNCTION_CONFIG.message('Slug mismatch in config file'),
            ErrorCodes.INVALID_FUNCTION_CONFIG.code
        )
    }

    validateUniqueEventNames(configData.events);

    return configData;
}

export const writeFunctionCode = (slug: string, code_snippet: string): void => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, INDEX_FILE);
    fs.outputFileSync(filePath, code_snippet);
}

export const getFunctionCode = (slug: string): string => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, INDEX_FILE);
    return fs.readFileSync(filePath, 'utf-8');
}

export const writeFunctionTest = (slug: string, tests: FunctionTest[]): void => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, TEST_FILE);
    fs.outputFileSync(filePath, JSON.stringify(tests, null, 4));
}

export const getFunctionTests = (slug: string, validEvents: ConfigEvent[]): FunctionTest[] => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, TEST_FILE);
    const tests = require(filePath);

    validateFunctionTests(tests, validEvents);

    return tests;
}

export const getAvailableFunctionList = (): string[] => {
    const folderPath = path.join(process.cwd(), FOLDER_NAME);

    if(!fs.existsSync(folderPath)) {
        throw new CommandError(
            ErrorCodes.NO_FUNCTIONS_FOLDER.message,
            ErrorCodes.NO_FUNCTIONS_FOLDER.code
        )
    }

    const items = fs.readdirSync(folderPath);
    const slugList = items.filter(item => fs.statSync(path.join(folderPath, item)).isDirectory());

    if (slugList.length === 0) {
        throw new CommandError(
            ErrorCodes.NO_FUNCTIONS_IN_FOLDER.message,
            ErrorCodes.NO_FUNCTIONS_IN_FOLDER.code
        )
    }

    return slugList;
}

export const getStatusString = (status: string): string => {
    return status === 'PASS' ? chalk.green(`${status} \u2714`) : chalk.red(`${status} \u2716`);
}

export const filterTestResponse = (response: FunctionTestModel[]): FunctionTest[] => {
    return response.map((item) => {
        const events = item.events.map((el) => ({
            event_slug: el.event_slug,
            event_version: el.event_version,
            input_data: JSON.parse(el.input_data),
            output_data: JSON.parse(el.output_data)
        }))
        return {
            name: item.name,
            events: events
        }
    })
}

export const stringifyTests = (tests: FunctionTest[]): TestPayload[] => {
    return tests.map((test) => {
        const events = test.events.map((el) => ({
            ...el,
            input_data: JSON.stringify(el.input_data),
            output_data: JSON.stringify(el.output_data)
        }))
        return {
            name: test.name,
            events
        }
    })
}

export const getFunctionData = (slug: string): [FunctionConfig, string, FunctionTest[]] => {
    const slugPath = path.join(process.cwd(), FOLDER_NAME, slug);

    if (!fs.existsSync(slugPath) || fs.readdirSync(slugPath).length === 0) {
        throw new CommandError(
            ErrorCodes.INVALID_SLUG_FOLDER.message(slug),
            ErrorCodes.INVALID_SLUG_FOLDER.code
        )
    }

    const requiredFiles = [CONFIG_FILE, INDEX_FILE, TEST_FILE];

    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(slugPath, file))) {
            throw new CommandError(
                ErrorCodes.MISSING_FILE.message(slug, file),
                ErrorCodes.MISSING_FILE.code
            )
        }
    }

    const configData = getFunctionConfig(slug);
    const codeSnippet = getFunctionCode(slug);
    const tests = getFunctionTests(slug, configData.events)

    return [configData, codeSnippet, tests];
}