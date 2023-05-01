import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import { getActiveContext, hasContext, isAThemeDirectory } from '../helper/utils';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
export default class ThemeContext {
    constructor() {}
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
