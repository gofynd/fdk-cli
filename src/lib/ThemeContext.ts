import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import { createContext,getActiveContext, decodeBase64, hasContext, isAThemeDirectory } from '../helper/utils';
import ConfigurationService from './api/services/configuration.service';
import ThemeService from './api/services/theme.service';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export default class ThemeContext {
    constructor() {}

    public static async addThemeContext(options) {
        try {
            Logger.info('Validating token');
            const configObj = JSON.parse(decodeBase64(options.token) || '{}');
            if (!configObj || !configObj.theme_id)
                throw new CommandError('Invalid token', ErrorCodes.INVALID_INPUT.code);
            const { data: appConfig } = await ConfigurationService.getApplicationDetails(configObj);
            const { data: themeConfig } = await ThemeService.getThemeById({
                application_id: appConfig._id,
                company_id: appConfig.company_id,
                theme_id: configObj.theme_id,
            });
            let context: any = {
                name: options.name,
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: themeConfig._id,
                themeType: options.type,
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
                    ErrorCodes.INVALID_THEME_DIRECTORY.code
                );
            }
            if (!hasContext()) {
                Logger.warn('No theme contexts available');
                Logger.info('Add a theme context using fdk theme context -t [your-theme-token] -n [context-name]');
                return;
            }
            const contextPath = path.join(process.cwd(), '.fdk','context.json');
            let contextJSON = await fs.readJSON(contextPath);
            let contextObj = contextJSON.theme;
            Logger.info(`Active context: ${contextObj.active_context}`);
            const questions = [
                {
                    type: 'list',
                    name: 'listContext',
                    message: 'Availabe Context. Select on to set active context',
                    choices: Object.keys(contextObj.contexts),
                },
            ];
            await inquirer.prompt(questions).then(async answers => {
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

    public static  activeContext() {
        try {
           let context =  getActiveContext()
            Logger.info(`Active context: ${context.name}`);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }}
      
}
