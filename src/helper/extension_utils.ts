import { readFile, writeFile } from './file.utils';
import _ from 'lodash';
import inquirer from 'inquirer';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import ExtensionService from '../lib/api/services/extension.service';
import { getPlatformUrls } from '../lib/api/services/url';
import CommandError, { ErrorCodes } from '../lib/CommandError';
import Logger from '../lib/Logger';
import urljoin from 'url-join';
import chalk from 'chalk';
import { getOrganizationDisplayName } from './utils';

export interface Object {
    [key: string]: any;
}

export const getPartnerAccessToken = (): string => {
    return configStore.get(CONFIG_KEYS.PARTNER_ACCESS_TOKEN);
};

export const getDefaultContextData = (): Object => {
    return {
        partners: {
            current_context: '',
            contexts: {
                default: {
                    name: 'default',
                    host: 'api.fynd.com',
                },
            },
        },
    };
};

export const getCompanyId = async (promptMessage = undefined) => {
    let developmentCompanyData = await ExtensionService.getDevelopmentAccounts(
        1,
        9999,
    );

    let choices = [];
    developmentCompanyData.items.map((data) => {
        choices.push({ name: data.company.name, value: data.company.uid });
    });

    if (choices.length === 0) {
        const organizationId = configStore.get(CONFIG_KEYS.ORGANIZATION);
        const createDevelopmentCompanyFormURL = organizationId
            ? urljoin(
                  getPlatformUrls().partners,
                  'organizations',
                  organizationId,
                  'accounts',
              )
            : getPlatformUrls().partners;
        Logger.info(
            chalk.yellowBright(
                `You don't have development account under organization ${getOrganizationDisplayName()}, You can create development account from ${createDevelopmentCompanyFormURL} and try again.`,
            ),
        );

        throw new CommandError(
            ErrorCodes.NO_DEVELOPMENT_COMPANY.message,
            ErrorCodes.NO_DEVELOPMENT_COMPANY.code,
        );
    }

    return await promptDevelopmentCompany(choices, promptMessage);
};

export const selectExtensionFromList = async (prefetchedExtensionList = undefined) => {
    let extensionList;

    if (prefetchedExtensionList) {
        extensionList = prefetchedExtensionList;
    } else {
        extensionList = await ExtensionService.getExtensionList(
            1,
            9999,
        );
    }
    let choices = [];
    extensionList.items.map((data) => {
        choices.push({ name: data.name, value: { id: data._id, name: data.name } });
    });

    if (choices.length === 0) {
        throw new CommandError(
            ErrorCodes.NO_EXTENSION_FOUND.message,
            ErrorCodes.NO_EXTENSION_FOUND.code,
        );
    }

    return await promptExtensionList(choices);
};

async function promptExtensionList(choices): Promise<Object> {
    try {
        return await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                name: 'extension',
                message: 'Select the existing extension to use:',
                pageSize: 6,
                validate: validateEmpty,
            },
        ]);
    } catch (error) {
        throw new CommandError(error.message);
    }
}

async function promptDevelopmentCompany(choices, promptMessage = undefined): Promise<number> {
    let companyId: number;
    try {
        let answers = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                name: 'company_id',
                message: promptMessage || 'Development Company :',
                pageSize: 6,
                validate: validateEmpty,
            },
        ]);
        companyId = answers.company_id;
    } catch (error) {
        throw new CommandError(error.message);
    }
    return companyId;
}

export const getActiveContext = (throwError = false) => {
    let contextData: Object = {};
    try {
        contextData = JSON.parse(readFile('./.fdk/context.json'));
    } catch (err) {}

    if (
        contextData.partners.current_context &&
        contextData.partners.current_context.length > 0 &&
        contextData.partners.contexts[contextData.partners.current_context]
    ) {
        const currentContext = contextData.partners.current_context;
        const currentContextObj = contextData.partners.contexts[currentContext];
        return currentContextObj;
    } else {
        if (!throwError) {
            return Promise.reject('No active context set');
        } else {
            throw Error('No active context set');
        }
    }
};

export const validateEmpty = (input: any): boolean => {
    return input !== '';
};

export const replaceContent = (
    content: string,
    searchPattern: string,
    replaceStr: string,
): string => {
    return content.replace(new RegExp(`${searchPattern}`, 'g'), replaceStr);
};

export const writeContextData = (
    contextName,
    newContext,
    targetDir,
    upsert = false,
) => {
    targetDir = targetDir || './.fdk/context.json';
    let contextData: Object = {};
    try {
        contextData = JSON.parse(readFile(targetDir) || '{}');
    } catch (err) {}
    if (contextData.contexts && contextData.contexts[contextName] && !upsert) {
        return Promise.reject('Context with the same name already exists');
    }
    _.set(contextData, `partners.contexts.${contextName}`, newContext);
    if (Object.keys(contextData.partners.contexts).length === 1) {
        contextData.partners.current_context = contextName;
    }
    writeFile(targetDir, JSON.stringify(contextData, undefined, 2));
};
