import axios, { AxiosResponse } from 'axios';
import { getActiveContext } from '../helper/utils';
import { promises as fs } from 'fs';
import fs_sync from 'fs';
import * as path from 'path';
import LocalesService from '../lib/api/services/locales.service';

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
}

export const hasAnyDeltaBetweenLocalAndRemoteLocales = async (): Promise<boolean> => {
    let comparedFiles = 0; // Track the number of files compared
    try {
        console.log('Starting comparison between local and remote data');

        const localesFolder: string = path.resolve(process.cwd(), 'theme/locales');
        
        if (!fs_sync.existsSync(localesFolder)) {
            console.log('Locales folder does not exist');
            return false;
        }
        

        // Fetch remote data from the API
        const response: AxiosResponse = await LocalesService.getLocalesByThemeId(null);

        console.log('Response received from API:', response.status);

        if (response.status === 200) {
            const data = response.data; // Extract the data from the API response
            console.log('Remote data retrieved:', data);

            // Ensure the locales folder exists
            await fs.mkdir(localesFolder, { recursive: true });
            console.log('Locales folder ensured at:', localesFolder);

            // Read all files in the local locales folder
            const localFiles = await fs.readdir(localesFolder);
            console.log('Local files found:', localFiles);

            // Compare each local file with the corresponding remote resource
            for (const file of localFiles) {
                const locale = path.basename(file, '.json'); // Extract the locale name from the file name
                console.log('Processing local file:', file);

                const localData = JSON.parse(await fs.readFile(path.join(localesFolder, file), 'utf-8')); // Read and parse the local file
                const matchingItem = data.items.find((item: LocaleResource) => item.locale === locale); // Find the corresponding remote item

                if (!matchingItem) { // If no matching remote item exists
                    console.log('No matching remote item found for locale:', locale);
                    return true; // Changes detected
                }

                if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) { // Compare the local and remote data
                    console.log('Data mismatch found for locale:', locale);
                    return true; // Changes detected
                }

                comparedFiles++; // Increment compared file count
            }

            // Compare each remote resource with the corresponding local file
            for (const item of data.items) {
                const localeFile = path.join(localesFolder, `${item.locale}.json`); // Construct the local file path
                console.log('Processing remote item for locale file:', localeFile);

                const localeData = item.resource; // Extract the remote resource data
                let currentData = {};

                try {
                    // Attempt to read and parse the local file
                    currentData = JSON.parse(await fs.readFile(localeFile, 'utf-8'));
                } catch (error) {
                    console.log('Error reading local file or file not found for locale:', item.locale, error);
                    currentData = {}; // Default to an empty object if the file is missing or invalid
                }

                if (JSON.stringify(currentData) !== JSON.stringify(localeData)) { // Compare the local and remote data
                    console.log('Data mismatch found for remote locale:', item.locale);
                    return true; // Changes detected
                }

                comparedFiles++; // Increment compared file count
            }
        } else {
            console.error(`Unexpected status code: ${response.status}.`); // Handle unexpected response status codes
            return false;
        }
    } catch (error) {
        console.error('Error checking for changes:', error); // Log errors during the comparison process
        return false;
    }

    console.log(`Comparison completed. Total files compared: ${comparedFiles}`); // Log the summary of comparisons
    console.log('No changes detected between local and remote data'); // Log when no changes are detected
    return false; // Return false if no changes were found
};

export const syncLocales = async (syncMode: SyncMode): Promise<void> => {

    console.log(`Starting fetchData with SyncMode=${syncMode}`);

    try {
        const response: AxiosResponse = await LocalesService.getLocalesByThemeId(null);

        console.log('API response received');

        if (response.status === 200) {
            const data = response.data;
            console.log(`Fetched ${data.items.length} items from API`);
        
            const localesFolder: string = path.resolve(process.cwd(),'theme/locales');

            try {
                await fs.mkdir(localesFolder, { recursive: true });
                console.log('Ensured locales folder exists');
            } catch (err) {
                console.error(`Error ensuring locales folder exists: ${(err as Error).message}`);
                return;
            }

            const unmatchedLocales: LocaleResource[] = [];

            let localFiles: string[];
            try {
                localFiles = await fs.readdir(localesFolder);
                console.log(`Found ${localFiles.length} local files`);
            } catch (err) {
                console.error(`Error reading locales folder: ${(err as Error).message}`);
                return;
            }

            for (const file of localFiles) {
                const locale: string = path.basename(file, '.json');
                console.log(`Processing local file: ${locale}`);
                let localData: Record<string, any>;
                try {
                    localData = JSON.parse(await fs.readFile(path.join(localesFolder, file), 'utf-8'));
                } catch (err) {
                    console.error(`Error reading file ${file}: ${(err as Error).message}`);
                    continue;
                }

                const matchingItem = data.items.find((item: LocaleResource) => item.locale === locale);
                if (!matchingItem) {
                    console.log(`No matching item found for locale: ${locale}`);
                    unmatchedLocales.push({ locale, resource: localData });
                    if (syncMode === SyncMode.PUSH) {
                        console.log(`Creating new resource in API for locale: ${locale}`);
                        await createLocaleInAPI(localData, locale, 'locale');
                    }
                } else {
                    if (syncMode === SyncMode.PUSH) {
                        if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) {
                            console.log(`Updating API resource for locale: ${locale}`);
                            await updateLocaleInAPI(localData, matchingItem._id);
                        } else {
                            console.log(`No changes detected for API resource: ${locale}`);
                        }
                    } else {
                        if (JSON.stringify(localData) !== JSON.stringify(matchingItem.resource)) {
                            console.log(`Updating local file for locale: ${locale}`);
                            await updateLocaleFile(path.join(localesFolder, file), matchingItem.resource, matchingItem._id);
                        } else {
                            console.log(`No changes detected for local file: ${locale}`);
                        }
                    }
                }
            }

            if (unmatchedLocales.length > 0) {
                console.log('Unmatched locales:', unmatchedLocales);
            }

            if (syncMode === SyncMode.PULL) {
                for (const item of data.items) {
                    const locale: string = item.locale;
                    const localeFile: string = path.join(localesFolder, `${locale}.json`);
                    const localeData: Record<string, any> = item.resource;

                    if (!localeData) {
                        console.log(`Skipping empty resource for locale: ${locale}`);
                        continue;
                    }

                    let currentData: Record<string, any>;
                    try {
                        currentData = JSON.parse(await fs.readFile(localeFile, 'utf-8').catch(() => '{}'));
                    } catch (err) {
                        console.error(`Error reading file ${localeFile}: ${(err as Error).message}`);
                        continue;
                    }

                    if (JSON.stringify(currentData) !== JSON.stringify(localeData)) {
                        try {
                            console.log(`Writing updated data to local file: ${localeFile}`);
                            await fs.writeFile(localeFile, JSON.stringify(localeData, null, 2), 'utf-8');
                        } catch (err) {
                            console.error(`Error writing to file ${localeFile}: ${(err as Error).message}`);
                        }
                    } else {
                        console.log(`No changes detected for local file: ${locale}`);
                    }
                }
            }

            console.log('Sync completed successfully.');
        } else {
            console.error(`Unexpected status code: ${response.status}.`);
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error('Error: The request timed out. Please try again later.');
        } else {
            console.error(`Error fetching data: ${error?.response?.status} - ${error?.response?.statusText || error?.message}`);
        }
    }
};

const createLocaleInAPI = async (data: Record<string, any>, locale: string, type: string): Promise<void> => {
    try {
        console.log(`Creating resource in API for locale: ${locale}`);
        const activeContext = getActiveContext();
        const response: AxiosResponse = await LocalesService.createLocale(null, {
            theme_id: activeContext.theme_id,
            locale: locale,
            resource: data,
            type: type,
            template: false,
        })
        console.log('Locale created in API:', response.data);
    } catch (error) {
        console.log(error);
        console.error('Error creating locale in API:', (error as Error).message);
    }
};

const updateLocaleInAPI = async (data: Record<string, any>, id: string): Promise<void> => {
    try {
        console.log(`Updating resource in API for ID: ${id}`);

        const response: AxiosResponse = await LocalesService.updateLocale(null, id, { resource: data });

        console.log('Locale updated in API:', response.data);
    } catch (error) {
        console.log(error);
        console.error('Error updating locale in API:', (error as Error).message);
    }
};

const updateLocaleFile = async (filePath: string, data: Record<string, any>, id: string): Promise<void> => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Locale file updated: ${filePath}`);
    } catch (err) {
        console.error(`Error writing to file ${filePath}: ${(err as Error).message}`);
    }
};
