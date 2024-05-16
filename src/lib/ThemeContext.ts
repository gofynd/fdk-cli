import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import {
    createContext,
    getActiveContext,
    hasContext,
    isAThemeDirectory,
} from '../helper/utils';
import ConfigurationService from './api/services/configuration.service';
import ThemeService from './api/services/theme.service';
import Theme from '../lib/Theme';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { createDirectory } from '../helper/file.utils';
const FDK_PATH = () => path.join(process.cwd(), '.fdk');
const CONTEXT_PATH = () => path.join(FDK_PATH(), 'context.json');
export const DEFAULT_CONTEXT = {
    theme: { active_context: '', contexts: {} },
    partners: {},
};
export default class ThemeContext {
    constructor() {}

    public static async addThemeContext(options) {
        try {
            if (!isAThemeDirectory()) createDirectory(FDK_PATH());
            if (!hasContext()) {
                await fs.writeJSON(CONTEXT_PATH(), DEFAULT_CONTEXT);
            }
            let contextsData = await fs.readJSON(CONTEXT_PATH());
            if (contextsData.theme.contexts[options.name])
                throw new CommandError(
                    'Context with the same name already exists',
                );
            let configObj = await Theme.selectCompanyAndStore();
            configObj = await Theme.selectTheme(configObj);
            const { data: appConfig } =
                await ConfigurationService.getApplicationDetails(configObj);
            const { data: themeData } =
                await ThemeService.getThemeById(configObj);
            const themeName = themeData?.name || 'default';
            let context: any = {
                name: options.name,
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: themeData._id,
                application_token: appConfig.token,
                theme_type: themeData.theme_type,
            };
            Logger.info('Saving context');
            await createContext(context);
            Logger.info('Setting as current context');
            Logger.info('DONE');
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async listThemeContext() {
        try {
            if (!isAThemeDirectory()) {
                throw new CommandError(
                    ErrorCodes.INVALID_THEME_DIRECTORY.message,
                    ErrorCodes.INVALID_THEME_DIRECTORY.code,
                );
            }
            if (!hasContext()) {
                Logger.warn('No theme contexts available');
                Logger.info(
                    'Add a theme context using fdk theme context -n [context-name]',
                );
                return;
            }
            const contextPath = path.join(
                process.cwd(),
                '.fdk',
                'context.json',
            );
            let contextJSON = await fs.readJSON(contextPath);
            let contextObj = contextJSON.theme;
            Logger.info(`Active context: ${contextObj.active_context}`);
            const questions = [
                {
                    type: 'list',
                    name: 'listContext',
                    message:
                        'Availabe Context. Select on to set active context',
                    choices: Object.keys(contextObj.contexts),
                },
            ];
            await inquirer.prompt(questions).then(async (answers) => {
                try {
                    contextObj.active_context = answers.listContext;
                    contextJSON.theme = contextObj;
                    await fs.writeJson(contextPath, contextJSON, {
                        spaces: 2,
                    });
                } catch (error) {
                    throw new CommandError(error.message, error.code);
                }
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static activeContext() {
        try {
            let context = getActiveContext();
            Logger.info(`Active context: ${context.name}`);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
}
