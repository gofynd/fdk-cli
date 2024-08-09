import { Object, getPartnerAccessToken } from '../helper/extension_utils';
import { readFile, writeFile } from '../helper/file.utils';
import chalk from 'chalk';
import ExtensionService from './api/services/extension.service';
import CommandError from './CommandError';
import Spinner from '../helper/spinner';
import path from 'path';
import Extension from './Extension';

export default class ExtensionLaunchURL {
    public static async setLaunchURLHandler(options) {
        try {
            let partner_access_token = getPartnerAccessToken();

            ExtensionLaunchURL.updateLaunchURL(
                options.apiKey,
                partner_access_token || options.accessToken,
                options.url,
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    public static async updateLaunchURL(
        extension_api_key: string,
        partner_access_token: string,
        launch_url: string,
    ): Promise<void> {
        try {
            // let java_env_file_path = path.join(
            //     'src',
            //     'main',
            //     'resources',
            //     'application.yml',
            // );
            let spinner = new Spinner('Updating Launch URL on Partners Panel');
            try {
                spinner.start();
                //let manualUpdateRequired = false;

                try {
                    await ExtensionService.updateLaunchURLPartners(
                        extension_api_key,
                        { base_url: launch_url },
                    );
                    spinner.succeed();
                } catch (err) {
                    if (
                        err.response.status === 404 &&
                        err?.response?.data?.message === 'not found'
                    ) {
                        if (!partner_access_token) {
                            spinner.fail();
                            throw new CommandError(
                                'Please provide partner access token eg --access-token partnerAccessToken',
                            );
                        }
                        const res = await ExtensionService.updateLaunchURL(
                            extension_api_key,
                            partner_access_token,
                            { base_url: launch_url },
                        );
                        if (res.code) {
                            spinner.fail();
                            throw new CommandError(
                                'Failed updating Launch Url on Partners Panel',
                            );
                        }
                    } else {
                        spinner.fail();
                        throw new CommandError(
                            err?.response?.data?.message ||
                                'Failed updating Launch Url on Partners Panel',
                        );
                    }
                }

                // spinner = new Spinner('Updating Launch URL environment variable in extension code');
                // spinner.start();

                // manualUpdateRequired =
                //     Extension.updateExtensionEnvValue(launch_url);
                
                // if (manualUpdateRequired) {
                //     spinner.fail();
                //     console.log(
                //         chalk.blueBright(
                //             '\nPlease update extension launch url in your extension code manually.',
                //         ),
                //     );
                // }
                // else{
                //     spinner.succeed();
                // }
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
                    await ExtensionService.getExtensionDataPartners(
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
