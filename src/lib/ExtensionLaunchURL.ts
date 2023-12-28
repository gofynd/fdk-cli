import fs from 'fs';
import {
    replaceContent,
    Object,
} from '../helper/extension_utils';
import { readFile, writeFile } from '../helper/file.utils';
import chalk from 'chalk';
import ExtensionService from './api/services/extension.service';
import CommandError from './CommandError';
import Spinner from '../helper/spinner';
import path from 'path';

export default class ExtensionLaunchURL {
    public static async setLaunchURLHandler(options) {
        try {
            ExtensionLaunchURL.updateLaunchURL(
                options.apiKey,
                options.url,
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async updateLaunchURL(
        extension_api_key: string,
        launch_url: string,
    ): Promise<void> {
        try {
            let java_env_file_path = path.join('src', 'main', 'resources', 'application.yml');
            let spinner = new Spinner('Updating Launch URL');
            try {
                spinner.start();
                let manualUpdateRequired = false;
                await ExtensionService.updateLaunchURL(
                    extension_api_key,
                    { base_url: launch_url },
                );

                if (fs.existsSync('./.env')) {
                    let envData = readFile('./.env');
                    envData = replaceContent(
                        envData,
                        `EXTENSION_BASE_URL=.*[\n]`,
                        `EXTENSION_BASE_URL="${launch_url}"\n`,
                    );
                    writeFile('./.env', envData);
                }
                else if (fs.existsSync(java_env_file_path)) {
                    let envData = readFile(java_env_file_path);
                    envData = replaceContent(
                        envData,
                        `base_url.*[\n]`,
                        `base_url: '${launch_url}'\n`,
                    );
                    writeFile(java_env_file_path, envData);
                }
                else {
                    manualUpdateRequired = true;
                }
                spinner.succeed();
                console.log(
                    chalk.greenBright(
                        `Launch url set successfully${
                            manualUpdateRequired
                                ? '. Please update launch url in your code.'
                                : ''
                        }`,
                    ),
                );
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async getLaunchURLHandler(options: Object) {
        try {

            let spinner = new Spinner('Fetching Launch URL');
            try {
                spinner.start();
                let extension_data =
                    await ExtensionService.getExtensionData(
                        options.apiKey,
                    );
                let launchURL: string = extension_data.base_url;

                spinner.succeed();
                console.log(
                    chalk.greenBright(`Current launch URL: ${launchURL}`),
                );
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
}
