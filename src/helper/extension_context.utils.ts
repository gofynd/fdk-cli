import fs from 'fs-extra';
import { CONTEXT_PATH, FDK_PATH, isAThemeOrExtensionDirectory } from './utils';
import CommandError, { ErrorCodes } from '../lib/CommandError';
import { COMMON_LOG_MESSAGES } from '../lib/Logger';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { createDirectory } from './file.utils';


export const hasExtensionContext = () => {
    return (
        fs.existsSync(CONTEXT_PATH()) &&
        fs.readJSONSync(CONTEXT_PATH()).extension.contexts
    );
};

export const getExtensionActiveContext = () => {
    if (isAThemeOrExtensionDirectory() && hasExtensionContext()) {
        const contextData = fs.readJSONSync(CONTEXT_PATH());
        if (!contextData)
            throw new CommandError(
                `${ErrorCodes.INVALID_CONTEXT.message}.\n${COMMON_LOG_MESSAGES.ContextNotSet}`,
                ErrorCodes.INVALID_CONTEXT.code,
            );
        return contextData.extension.contexts[contextData.extension.active_context];
    }
    throw new CommandError(
        ErrorCodes.INVALID_EXTENSION_DIRECTORY.message,
        ErrorCodes.INVALID_EXTENSION_DIRECTORY.code,
    );
};

type ActiveExtensionContext = {
    name: string,
    extension_id: string,
    cluster_url: string,
    organization_id: string
}

export const checkExtensionRepository = (): ActiveExtensionContext => {
    const extensionContext = getExtensionActiveContext();
    const currentOrganization = configStore.get(CONFIG_KEYS.ORGANIZATION);
    if(extensionContext.organization_id !== currentOrganization){
        throw new CommandError(
            ErrorCodes.MISMATCH_ORGANIZATION_ID.message(currentOrganization, extensionContext.organization_id), 
            ErrorCodes.MISMATCH_ORGANIZATION_ID.code
        );
    };
    return extensionContext;
}

export const createExtensionContext = async context => {
    try {
        // this is needed for extension init command, as we are cloning extension template and will be using for functions.
        if (!isAThemeOrExtensionDirectory()) createDirectory(FDK_PATH());
        if (!hasExtensionContext()) {
            await fs.writeJSON(CONTEXT_PATH(), { extension: {active_context: "", contexts: {}}});
        }
        let contextsData = await fs.readJSON(CONTEXT_PATH());
        contextsData.extension.active_context = context.extension_id;
        contextsData.extension.contexts[context.extension_id] = context;
        await fs.writeJSON(CONTEXT_PATH(), contextsData, {
            spaces: 2,
        });
    } catch (error) {
        throw new CommandError(error.message, error.code);
    }
}