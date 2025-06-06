import axios, { AxiosResponse } from 'axios';
import { getActiveContext } from '../helper/utils';
import fs from 'fs-extra';
import * as path from 'path';
import LocalesService from '../lib/api/services/locales.service';
import Logger from '../lib/Logger';
import { isEqual } from 'lodash';
import CommandError from '../lib/CommandError';

/**
 * Defines the synchronization mode for locale operations
 */
export enum SyncMode {
  PULL = 'pull',
  PUSH = 'push',
}

/**
 * Minimal structure for locale resources returned by API
 */
interface LocaleResource {
  _id?: string;
  locale: string;
  type: 'locale' | 'locale_schema';
  resource: Record<string, any>;
}

const LOCALES_DIR = (targetDirectory: string) => path.resolve(targetDirectory, 'theme', 'locales');

/**
 * Ensures the locales directory exists
 */
async function ensureLocalesDir(targetDirectory: string): Promise<void> {
  await fs.ensureDir(LOCALES_DIR(targetDirectory));
}

/**
 * Reads JSON from file and throws on error (invalid JSON stops execution)
 */
async function readJson(filePath: string): Promise<any> {
  return await fs.readJSON(filePath); // Propagate errors on invalid JSON
}

/**
 * Fetches locale resources from API
 */
async function fetchRemoteItems(context?: any): Promise<LocaleResource[]> {
  const response: AxiosResponse = await LocalesService.getLocalesByThemeId(context || null);
  if (response.status !== 200) {
    throw new CommandError(`Unexpected status code: ${response.status}`, `${response.status}`);
  }
  return response.data.items as LocaleResource[];
}

/**
 * Determines filename for a given locale resource
 */
function getFileName(item: { locale: string; type: string }): string {
  return `${item.locale}${item.type === 'locale_schema' ? '.schema' : ''}.json`;
}

/**
 * Validates directory only contains JSON files and returns the JSON filenames
 */
async function getJsonFiles(targetDirectory: string): Promise<string[]> {
  const allFiles = await fs.readdir(LOCALES_DIR(targetDirectory));
  const invalid = allFiles.filter(f => path.extname(f).toLowerCase() !== '.json');
  if (invalid.length) {
    throw new CommandError(
      `Invalid files present: ${invalid.join(', ')}. Only .json locale files are allowed.`,
      'INVALID_FILE_TYPE'
    );
  }
  return allFiles;
}

/**
 * Checks if there is any difference between local and remote locale files
 */
export async function hasAnyDeltaBetweenLocalAndRemoteLocales(targetDirectory): Promise<boolean> {
  Logger.debug('Checking for locale deltas...');

  if (!fs.existsSync(LOCALES_DIR(targetDirectory))) {
    Logger.debug('Locales directory not found, skipping comparison.');
    return false;
  }

  const [remoteItems, localeFiles] = await Promise.all([
    fetchRemoteItems(),
    getJsonFiles(targetDirectory),
  ]);

  for (const item of remoteItems) {
    const filePath = path.join(LOCALES_DIR(targetDirectory), getFileName(item));
    if (!localeFiles.includes(getFileName(item))) {
      Logger.debug(`Missing locale file for locale '${item.locale}'.`);
      return true;
    }
    const localeData = await readJson(filePath);
    if (!isEqual(localeData, item.resource)) {
      Logger.debug(`Difference detected in locale '${item.locale}' of type '${item.type}'.`);
      return true;
    }
  }

  // Check for extra local .json files that aren't remote items
  const remoteNames = remoteItems.map(getFileName);
  for (const file of localeFiles) {
    if (!remoteNames.includes(file)) {
      Logger.debug(`Extra locale file detected: '${file}'.`);
      return true;
    }
  }

  Logger.debug('No differences detected.');
  return false;
}

/**
 * Synchronizes locale files by pushing local changes to API or pulling remote to local
 */
export async function syncLocales(syncMode: SyncMode, targetDirectory = ""): Promise<void> {
  Logger.debug(`Starting locale sync in '${syncMode}' mode.`);
  try {
    const remoteItems = await fetchRemoteItems();
    await ensureLocalesDir(targetDirectory);
    const localFiles = await getJsonFiles(targetDirectory);

    // Map remote by filename for quick lookup
    const remoteMap = new Map<string, LocaleResource>();
    for (const item of remoteItems) {
      remoteMap.set(getFileName(item), item);
    }

    if (syncMode === SyncMode.PUSH) {
      // Push local changes to API
      for (const file of localFiles) {
        const filePath = path.join(LOCALES_DIR(targetDirectory), file);
        const localData = await readJson(filePath);
        const remoteItem = remoteMap.get(file);

        if (!remoteItem) {
          Logger.debug(`Creating new locale resource for '${file}'.`);
          await createOrUpdateLocaleInAPI(localData, file, 'create');
        } else if (!isEqual(localData, remoteItem.resource)) {
          Logger.debug(`Updating existing locale resource for '${file}'.`);
          await createOrUpdateLocaleInAPI(localData, file, 'update', remoteItem._id!);
        } else {
          Logger.debug(`No changes for '${file}', skipping.`);
        }
      }
    } else {
      // PULL: write remote items to local
      for (const item of remoteItems) {
        const fileName = getFileName(item);
        const filePath = path.join(LOCALES_DIR(targetDirectory), fileName);
        const localData = await readJson(filePath).catch(() => ({}));

        if (!isEqual(localData, item.resource)) {
          Logger.debug(`Writing remote resource to local file '${fileName}'.`);
          await fs.writeJSON(filePath, item.resource, { spaces: 2 });
        } else {
          Logger.debug(`Local file '${fileName}' is up to date.`);
        }
      }
    }

    Logger.debug('Locale sync completed successfully.');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new CommandError(`Locale API not found: ${error.response.statusText}`, '404');
    }
    throw error;
  }
}

/**
 * Creates or updates a locale resource in the API
 */
async function createOrUpdateLocaleInAPI(
  data: Record<string, any>,
  fileName: string,
  action: 'create' | 'update',
  id?: string
): Promise<void> {
  const locale = fileName.replace(/(\.schema)?\.json$/, '');
  const type = fileName.includes('.schema') ? 'locale_schema' : 'locale';
  const payload = { theme_id: getActiveContext().theme_id, locale, resource: data, type, template: false };

  try {
    if (action === 'create') {
      await LocalesService.createLocale(null, payload);
      Logger.debug(`Created '${locale}' resource in API.`);
    } else {
      await LocalesService.updateLocale(null, id!, { resource: data });
      Logger.debug(`Updated '${locale}' resource in API.`);
    }
  } catch (err) {
    const errMsg = `Failed to ${action} locale '${locale}': ${(err as Error).message}`
    Logger.error(errMsg);
    throw new CommandError(errMsg, err.code);
  }
}

/**
 * Updates locale files from API response (legacy support)
 */
export async function updateLocaleFiles(context: any, targetDirectory = ""): Promise<void> {
  try {
    const items = await fetchRemoteItems(context);
    await ensureLocalesDir(targetDirectory);

    // Remove non-json and clear existing .json files
    const all = await fs.readdir(LOCALES_DIR(targetDirectory));
    const invalid = all.filter(f => path.extname(f).toLowerCase() !== '.json');
    if (invalid.length) {
      throw new CommandError(
        `Invalid files present: ${invalid.join(', ')}. Only .json locale files are allowed.`,
        'INVALID_FILE_TYPE'
      );
    }
    await Promise.all(all.map(f => fs.remove(path.join(LOCALES_DIR(targetDirectory), f))));

    // Write fresh items
    for (const item of items) {
      const fileName = getFileName(item);
      await fs.writeJSON(path.join(LOCALES_DIR(targetDirectory), fileName), item.resource, { spaces: 2 });
    }

    Logger.debug('updateLocaleFiles: completed.');
  } catch (err) {
    Logger.error(`updateLocaleFiles failed: ${(err as Error).message}`);
    throw err;
  }
}
