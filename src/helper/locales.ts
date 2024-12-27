import axios, { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';
import * as path from 'path';


interface ApiConfig {
    baseUrl: string;
    headers: Record<string, string>;
}

interface LocaleResource {
    locale: string;
    resource: Record<string, any>;
}

const apiConfig: ApiConfig = {
    baseUrl: 'http://localhost:7071/v1.0/organization/2323232/company/6/application/671b70ecfde3892821bd4f5d/static-resources',
    headers: {
        'x-user-data': '{"debug":{"source":"grimlock","platform":"000000000000000000000001"},"gender":"male","accountType":"user","active":true,"profilePicUrl":"https://d2co8r51m5ca2d.cloudfront.net/inapp_banners/default_profile_img.png","hasOldPasswordHash":false,"_id":"5e199e6998cfe1776f1385dc","firstName":"Fynd","lastName":"App","username":"app@fynd.com","phoneNumbers":[{"active":true,"primary":true,"verified":true,"phone":"9999632145","countryCode":91}]}',
        'authorization': 'Bearer oa-cbfdf63cd52092d314ba7b377d767255942e68fe',
        'Content-Type': 'application/json'
    }
};

export const syncLocales = async (): Promise<void> => {
    const localFirst: boolean = process.env.LOCAL_FIRST?.toLowerCase() === 'true';
    console.log(`Starting fetchData with LOCAL_FIRST=${localFirst}`);

    try {
        const response: AxiosResponse = await axios.get(
            `${apiConfig.baseUrl}?template_theme_id=674d7532cf6c66c4b308af58&page_size=500`,
            {
                headers: apiConfig.headers,
                timeout: 10000,
            }
        );
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
                    if (localFirst) {
                        console.log(`Creating new resource in API for locale: ${locale}`);
                        await createLocaleInAPI(localData, locale, 'locale');
                    }
                } else {
                    if (localFirst) {
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
                const unmatchedFilePath: string = path.join(localesFolder, 'unmatched_locales.log');
                try {
                    await fs.writeFile(
                        unmatchedFilePath,
                        unmatchedLocales.map(locale => JSON.stringify(locale)).join('\n'),
                        'utf-8'
                    );
                    console.log(`Unmatched locales written to file: ${unmatchedFilePath}`);
                } catch (err) {
                    console.error(`Error writing unmatched locales to file: ${(err as Error).message}`);
                }
            }

            if (!localFirst) {
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
        const response: AxiosResponse = await axios.post(
            apiConfig.baseUrl,
            {
                template_theme_id: '674d7532cf6c66c4b308af58',
                locale: locale,
                resource: data,
                type: type,
                is_template: false,
            },
            { headers: apiConfig.headers }
        );
        console.log('Locale created in API:', response.data);
    } catch (error) {
        console.error('Error creating locale in API:', (error as Error).message);
    }
};

const updateLocaleInAPI = async (data: Record<string, any>, id: string): Promise<void> => {
    try {
        console.log(`Updating resource in API for ID: ${id}`);
        const response: AxiosResponse = await axios.put(
            `${apiConfig.baseUrl}/${id}`,
            { resource: data },
            { headers: apiConfig.headers }
        );
        console.log('Locale updated in API:', response.data);
    } catch (error) {
        console.error('Error updating locale in API:', (error as Error).message);
    }
};

const updateLocaleFile = async (filePath: string, data: Record<string, any>, id: string): Promise<void> => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Locale file updated: ${filePath}`);
        await updateLocaleInAPI(data, id);
    } catch (err) {
        console.error(`Error writing to file ${filePath}: ${(err as Error).message}`);
    }
};
