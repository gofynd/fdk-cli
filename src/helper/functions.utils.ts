import CommandError, { ErrorCodes } from "../lib/CommandError";
import { ConfigEvent, Event, FunctionConfig, FunctionType } from "./functions.types";
import path from 'path';
import fs from 'fs-extra';

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

export const convertToSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export const FUNCTION_TYPE = {
    IN_HOOK: 'inhook',
    INGRESS: 'ingress'
}

export const FOLDER_NAME = 'functions';

export const USER_ACTIONS = {
    PULL: 'pull',
    PUSH: 'push',
    CANCEL: 'cancel'
}

export const writeFunctionConfig = (name: string, description: string, slug: string, type: FunctionType, events: Event[]):void => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, 'config.js');
    const configData: FunctionConfig = {
        name,
        description,
        slug,
        type,
        events: events.map((el) => ({name: el.event_slug, version: el.event_version}))
    }
    const fileData = `const config = ${JSON.stringify(configData, null, 2)};\nmodule.exports = config;`

    fs.outputFileSync(filePath, fileData);
}

export const readFunctionConfig = (slug: string): FunctionConfig => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, 'config.js');
    return require(filePath);
}

export const writeFunctionCode = (slug: string, code_snippet: string): void => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, 'index.js');
    fs.outputFileSync(filePath, code_snippet);
}

export const readFunctionCode = (slug: string): string => {
    const filePath = path.join(process.cwd(), FOLDER_NAME, slug, 'index.js');
    return fs.readFileSync(filePath, 'utf-8');
}