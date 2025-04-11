import axios, { AxiosResponse } from 'axios';
import { getActiveContext } from '../helper/utils';
import { promises as fs } from 'fs';
import fs_sync from 'fs';
import * as path from 'path';
import LocalesService from '../lib/api/services/locales.service';
import Logger from '../lib/Logger';

/**
 * Defines the synchronization mode for locale operations
 * @enum {string}
 */
export enum SyncMode {
    /** Pull changes from remote to local */
    PULL = 'pull',
    /** Push changes from local to remote */
    PUSH = 'push'
}

interface ApiConfig {
    baseUrl: string;
    headers: Record<string, string>;
}

interface LocaleResource {
    locale: string;
    resource: Record<string, any>;
    type: string;
}

export const hasAnyDeltaBetweenLocalAndRemoteLocales = async (): Promise<boolean> => {
    let comparedFiles = 0; // Track the number of files compared
    try {
        Logger.debug('Starting comparison between local and remote data');

        const localesFolder: string = path.resolve(process.cwd(), 'theme/locales');
        
        if (!fs_sync.existsSync(localesFolder)) {
            Logger.debug('Locales folder does not exist');
            return false;
        }
        

        // Fetch remote data from the API
        const response: AxiosResponse = await LocalesService.getLocalesByThemeId(null);

        Logger.debug('Response received from API:', response.status);

        if (response.status === 200) {
            const data = response.data; // Extract the data from the API response
            Logger.debug('Remote data retrieved:', data);

            // Ensure the locales folder exists
            await fs.mkdir(localesFolder, { recursive: true });
            Logger.debug('Locales folder ensured at:', localesFolder);

            // Read all files in the local locales folder
            const localFiles = await fs.readdir(localesFolder);
            Logger.debug('Local files found:', localFiles);

            // Compare each local file with the corresponding remote resource
            for (const file of localFiles) {
                let locale = path.basename(file, '.json'); // Extract the locale name from the file name
                Logger.debug('Processing local file:', file);

                const localeType = locale.includes('schema') ? 'locale_schema' : 'locale';
                locale = locale.includes('schema') ? locale.replace('.schema', '') : locale;

                const localData = JSON.parse(await fs.readFile(path.join(localesFolder, file), 'utf-8')); // Read and parse the local file
                const matchingItem = data.items.find((item: LocaleResource) => item.locale === locale && item.type === localeType); // Find the corresponding remote item

                if (!matchingItem) { // If no matching remote item exists
                    Logger.debug('No matching remote item found for locale:', locale);
                    return true; // Changes detected
                }

                if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) { // Compare the local and remote data
                    Logger.debug(`Data mismatch found for locale: ${locale}, Type: ${localeType}`);
                    return true; // Changes detected
                }

                comparedFiles++; // Increment compared file count
            }

            // Compare each remote resource with the corresponding local file
            for (const item of data.items) {
                const localeFile = path.join(localesFolder, `${item.locale}${item.type === 'locale_schema' ? '.schema' : ''}.json`);; // Construct the local file path
                Logger.debug('Processing remote item for locale file:', localeFile);

                const localeData = item.resource; // Extract the remote resource data
                let currentData = {};

                try {
                    // Attempt to read and parse the local file
                    currentData = JSON.parse(await fs.readFile(localeFile, 'utf-8'));
                } catch (error) {
                    Logger.debug('Error reading local file or file not found for locale:', item.locale, error);
                    currentData = {}; // Default to an empty object if the file is missing or invalid
                }

                if (JSON.stringify(currentData) !== JSON.stringify(localeData)) { // Compare the local and remote data
                    Logger.debug(`Data mismatch found for remote locale: ${item.locale}, Type: ${item?.type}`);
                    return true; // Changes detected
                }

                comparedFiles++; // Increment compared file count
            }
        } else {
            Logger.error(`Unexpected status code: ${response.status}.`); // Handle unexpected response status codes
            return false;
        }
    } catch (error) {
        Logger.error('Error checking for changes:', error); // Log errors during the comparison process
        return false;
    }

    Logger.debug(`Comparison completed. Total files compared: ${comparedFiles}`); // Log the summary of comparisons
    Logger.debug('No changes detected between local and remote data'); // Log when no changes are detected
    return false; // Return false if no changes were found
};

export const syncLocales = async (syncMode: SyncMode): Promise<void> => {
    Logger.debug(`Starting fetchData with SyncMode=${syncMode}`);

    try {
        const response: AxiosResponse = await LocalesService.getLocalesByThemeId(null);

        Logger.debug('API response received');

        if (response.status === 200) {
            const data = response.data;
            Logger.debug(`Fetched ${data.items.length} items from API`);
        
            const localesFolder: string = path.resolve(process.cwd(),'theme/locales');

            try {
                await fs.mkdir(localesFolder, { recursive: true });
                Logger.debug('Ensured locales folder exists');
            } catch (err) {
                Logger.error(`Error ensuring locales folder exists: ${(err as Error).message}`);
                return;
            }

            const unmatchedLocales: LocaleResource[] = [];

            let localFiles: string[];
            try {
                localFiles = await fs.readdir(localesFolder);
                Logger.debug(`Found ${localFiles.length} local files`);
            } catch (err) {
                Logger.error(`Error reading locales folder: ${(err as Error).message}`);
                return;
            }

            for (const file of localFiles) {
                let locale: string = path.basename(file, '.json');
                Logger.debug(`Processing local file: ${locale}`);
                const localeType = locale.includes('schema') ? 'locale_schema' : 'locale';
                locale = locale.includes('schema') ? locale.replace('.schema', '') : locale;
                let localData: Record<string, any>;
                try {
                    localData = JSON.parse(await fs.readFile(path.join(localesFolder, file), 'utf-8'));
                } catch (err) {
                    Logger.error(`Error reading file ${file}: ${(err as Error).message}`);
                    continue;
                }
                const matchingItem = data.items.find((item: LocaleResource) => item.locale === locale && item.type === localeType);
                if (!matchingItem) {
                    Logger.debug(`No matching item found for locale: ${locale}`);
                    unmatchedLocales.push({ locale, resource: localData, type: localeType });
                    if (syncMode === SyncMode.PUSH) {
                        Logger.debug(`Creating new resource in API for locale: ${locale}`);
                        await createLocaleInAPI(localData, locale, localeType);
                    }
                } else {
                    if (syncMode === SyncMode.PUSH) {
                        if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) {
                            Logger.debug(`Updating API resource for locale: ${locale}`);
                            await updateLocaleInAPI(localData, matchingItem._id);
                        } else {
                            Logger.debug(`No changes detected for API resource: ${locale}`);
                        }
                    } else {
                        if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) {
                            Logger.debug(`Updating local file for locale: ${locale}`);
                            await updateLocaleFile(path.join(localesFolder, file), matchingItem.resource, matchingItem._id);
                        } else {
                            Logger.debug(`No changes detected for local file: ${locale}`);
                        }
                    }
                }
            }

            if (unmatchedLocales.length > 0) {
                Logger.debug('Unmatched locales:', unmatchedLocales);
            }

            if (syncMode === SyncMode.PULL) {
                for (const item of data.items) {
                    const locale: string = item.locale;
                    const localeFile = path.join(localesFolder, `${item.locale}${item.type === 'locale_schema' ? '.schema' : ''}.json`);
                    const localeData: Record<string, any> = item.resource;
                    if (!localeData) {
                        Logger.debug(`Skipping empty resource for locale: ${locale}`);
                        continue;
                    }

                    let currentData: Record<string, any>;
                    try {
                        currentData = JSON.parse(await fs.readFile(localeFile, 'utf-8').catch(() => '{}'));
                    } catch (err) {
                        Logger.error(`Error reading file ${localeFile}: ${(err as Error).message}`);
                        continue;
                    }

                    if (JSON.stringify(currentData) !== JSON.stringify(localeData)) {
                        try {
                            Logger.debug(`Writing updated data to local file: ${localeFile}`);
                            await fs.writeFile(localeFile, JSON.stringify(localeData, null, 2), 'utf-8');
                        } catch (err) {
                            Logger.error(`Error writing to file ${localeFile}: ${(err as Error).message}`);
                        }
                    } else {
                        Logger.debug(`No changes detected for local file: ${locale}`);
                    }
                }
            }

            Logger.debug('Sync completed successfully.');
        } else {
            Logger.error(`Unexpected status code: ${response.status}.`);
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            Logger.error('Error: The request timed out. Please try again later.');
        } else {
            Logger.error(`Error fetching data: ${error?.response?.status} - ${error?.response?.statusText || error?.message}`);
        }
    }
};

const createLocaleInAPI = async (data: Record<string, any>, locale: string, localeType: string): Promise<void> => {
    try {
        Logger.debug(`Creating resource in API for locale: ${locale}`);
        const activeContext = getActiveContext();
        const response: AxiosResponse = await LocalesService.createLocale(null, {
            theme_id: activeContext.theme_id,
            locale: locale,
            resource: data.resource,
            type: localeType,
            template: false,
        })
        Logger.debug('Locale created in API:', response.data);
    } catch (error) {
        Logger.debug(error);
        Logger.error('Error creating locale in API:', (error as Error).message);
    }
};

const updateLocaleInAPI = async (data: Record<string, any>, id: string): Promise<void> => {
    try {
        Logger.debug(`Updating resource in API for ID: ${id}`);

        const response: AxiosResponse = await LocalesService.updateLocale(null, id, { resource: data.resource });

        Logger.debug('Locale updated in API:', response.data);
    } catch (error) {
        Logger.debug(error);
        Logger.error('Error updating locale in API:', (error as Error).message);
    }
};

const updateLocaleFile = async (filePath: string, data: Record<string, any>, id: string): Promise<void> => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        Logger.debug(`Locale file updated: ${filePath}`);
    } catch (err) {
        Logger.error(`Error writing to file ${filePath}: ${(err as Error).message}`);
    }
};