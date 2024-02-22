import CommandError, { ErrorCodes } from "../lib/CommandError";
import { ConfigEvent } from "./functions.types";

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