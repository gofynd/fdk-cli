import _ from 'lodash';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import urljoin from 'url-join';
import chalk from 'chalk';
import Logger from '../lib/Logger';
import detectPort from 'detect-port'

import configStore, { CONFIG_KEYS } from '../lib/Config';
import CommandError, { ErrorCodes } from '../lib/CommandError';
import ExtensionService from '../lib/api/services/extension.service';
import { getPlatformUrls } from '../lib/api/services/url';
import { getOrganizationDisplayName } from './utils';
import { readFile, writeFile } from './file.utils';
import { OutputFormatter } from './formatter';

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
                `You don't have development account under organization "${getOrganizationDisplayName()}", You can create development account from ${OutputFormatter.link(createDevelopmentCompanyFormURL)} and try again.`,
            ),
        );

        throw new CommandError(
            ErrorCodes.NO_DEVELOPMENT_COMPANY.message,
            ErrorCodes.NO_DEVELOPMENT_COMPANY.code,
        );
    }

    return await promptDevelopmentCompany(choices, promptMessage);
};

export const selectExtensionFromList = async (prefetchedExtensionList = undefined, launch_type: string | string[] = undefined) => {
    let extensionList;

    if (prefetchedExtensionList) {
        extensionList = prefetchedExtensionList;
    } else {
        extensionList = await ExtensionService.getExtensionList(
            1,
            9999,
            launch_type
        );
    }
    let choices = [];
    extensionList.items.map((data) => {
        choices.push({ name: data.name, value: { id: data._id, name: data.name } });
    });

    if (choices.length === 0) {
        const organizationId = configStore.get(CONFIG_KEYS.ORGANIZATION);
        const createExtensionFormURL = organizationId
            ? urljoin(
                  getPlatformUrls().partners,
                  'organizations',
                  organizationId,
                  'extensions',
              )
            : getPlatformUrls().partners;
        Logger.info(
            chalk.yellowBright(
                `You don't have any extension under organization "${getOrganizationDisplayName()}", You can create extension from ${OutputFormatter.link(createExtensionFormURL)} and try again.`,
            ),
        );

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
                message: 'Select from the existing extension:',
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

async function promptApplicationId(choices, promptMessage = undefined): Promise<number> {
    let applicationId: number;
    try {
        let answers = await inquirer.prompt([
            {
                type: 'list',
                choices: choices,
                name: 'application_id',
                message: promptMessage || 'Application Id:',
                pageSize: 6,
                validate: validateEmpty,
            },
        ]);
        applicationId = answers.application_id;
    } catch (error) {
        throw new CommandError(error.message);
    }
    return applicationId;
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
    if(typeof input === 'string'){
        return input.trim() !== '';
    }
    else if(input === null || input === undefined){
        return false;
    }
    else if (typeof input === 'object') {
        return Object.keys(input).length > 0;
    }
    return true;
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


export function findAllFilePathFromCurrentDirWithName(fileName: Array<String>) {
    const files = [];
    const dir = process.cwd();

    const search = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                search(fullPath);
            } else if (fileName.includes(entry.name)) {
                files.push(fullPath);
            }
        }
    };

    search(dir);
    return files;
}

export async function getRandomFreePort(excluded_port = []) {

    const randomPort = Math.floor(Math.random() * (10000)) + 40000;
    if (excluded_port.includes(randomPort)) {
        return await getRandomFreePort(excluded_port);
    }
    const availablePort = await detectPort(randomPort);

    // If the randomly selected port is free, return it. Otherwise, retry until a free port is found.
    if (availablePort === randomPort) {
        return randomPort;
    } else {
        return await getRandomFreePort([...excluded_port, randomPort]);
    }
}

export const getApplicationId = async (companyId: number, promptMessage = undefined) => {
    const applicationList = await ExtensionService.getApplicationList(companyId, 1, 9999);
    let choices = [];
    applicationList.items.map((data) => {
        choices.push({ name: data.name, value: data._id });
    });

    if (choices.length === 0) {
        const createApplicationFormURL =  urljoin(
                getPlatformUrls().platform,
                'company',
                companyId.toString(),
            )
           
        Logger.info(
            chalk.yellowBright(
                `You don't have application under company "${companyId}", You can create application from ${OutputFormatter.link(createApplicationFormURL)} and try again.`,
            ),
        );

        throw new CommandError(
            ErrorCodes.NO_DEVELOPMENT_COMPANY.message,
            ErrorCodes.NO_DEVELOPMENT_COMPANY.code,
        );
    }

    return await promptApplicationId(choices, promptMessage);
}

export const checkAndValidatePaymentSlug = async(slug: string) => {
    const validInput =  validateEmpty(slug);
    if(!validInput){
        return 'Slug is required';
    }

    const isSlugAvailable = await ExtensionService.checkPaymentSlug(slug);
    if(!isSlugAvailable.is_valid && isSlugAvailable.error_message){
        return isSlugAvailable.error_message;
    }

    return true;
}