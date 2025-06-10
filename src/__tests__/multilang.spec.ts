import rimraf from 'rimraf';
import mockFunction, { commonDir } from './helper'; // Fixed import
import CommandError from '../lib/CommandError';
import { init }
    from '../fdk';
import {
    THEME_COMMANDS,
    THEME_CONFIG_FILE_NAME
} from '../helper/constants';
import {promises as fsPromises} from 'fs';
import { copyRecursive } from '../helper/file.utils';
const extensionPublishDebugLog = require('./fixtures/extension_publish_debug_log.json');
const path = require('path');
const nock = require('nock');
const { homedir } = require('os');
const chalk = require('chalk');
import inquirer from 'inquirer';
const EXTERNAL_EVENT_RETRY_COUNT = 5;
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { URLS } from '../lib/api/services/url';
import { startServer, stopServer } from '../lib/Auth';
const request = require('supertest');
const tokenData = require('./fixtures/partnertoken.json');
const organizationData = require('./fixtures/organizationData.json');
const appConfig = require('./fixtures/appConfig.json');
const themeList = require('./fixtures/themeList.json');
const availablePage = require('./fixtures/availablePage.json');
const availableSection = require('./fixtures/availableSection.json');
const syncSuccess = require('./fixtures/syncSuccess.json');
const syncError = require('./fixtures/syncError.json');
const syncWarning = require('./fixtures/syncWarning.json');
const syncPolling = require('./fixtures/syncPolling.json');
const startUploadFileResForTheme = require('./fixtures/startUploadThemeFileRes.json');
const startUploadFileResForImage = require('./fixtures/startUploadImageFileRes.json');
const completeUploadFileRes = require('./fixtures/completeUploadFileRes.json');
const themeById = require('./fixtures/themeById.json');
import Logger from '../lib/Logger';
import ThemeService from '../lib/Theme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
    getRandomFreePort
} from '../helper/extension_utils';
jest.mock('inquirer');
let program;
const партнеры = 'partners';
const партнерыDir = `${homedir()}/.fdk/context/${партнеры}.json`;
const THEME_DOWNLOAD_PATH = './.fdk/archive/609babc943c30e7a5155568d.zip';
const THEME_FOLDER_PATH = 'theme';
const THEME_PATH = path.resolve(THEME_FOLDER_PATH);
const IMAGE_PATH = path.resolve(THEME_FOLDER_PATH, 'assets/images/1.png');
const SRC_PATH = path.resolve(THEME_FOLDER_PATH, 'template/foundations.html');
const CSS_PATH = path.resolve(THEME_FOLDER_PATH, 'assets/css/main.css');
const JS_PATH = path.resolve(THEME_FOLDER_PATH, 'assets/js/main.js');
const CONFIG_PATH = path.resolve(THEME_FOLDER_PATH, 'config/settings_data.json');
const PRESET_PATH = path.resolve(THEME_FOLDER_PATH, 'config/settings_schema.json');
const apiVersion = configStore.get(CONFIG_KEYS.API_VERSION) || '1.0';
let mock;

export async function login() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const port =  await getRandomFreePort([]);
    const app = await startServer(port);
    const req = request(app);
    await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', 'api.fyndx1.de']);
    return await req.post('/token').send(tokenData);
}

describe('Multilang Commands', () => {
    beforeAll(async () => {
        rimraf.sync('./auth-test-cli.json');
        rimraf.sync('./theme-test-cli.json');
        program = await init('fdk');
        configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id);
        mock = new MockAdapter(axios);
        mock.onGet('https://api.fyndx1.de/service/application/content/_healthz').reply(200);
        mock.onGet(`${await URLS.GET_ORGANIZATION_DETAILS()}`).reply(
            200,
            organizationData,
        );
        mock.onGet(
            `${await URLS.GET_APPLICATION_DETAILS(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, appConfig);
        mock.onGet(
            `${await URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, appConfig);
        mock.onGet(
            `${await URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, themeList.items);
        mock.onGet(
            `${await URLS.GET_THEME_DEVELOPMENT_STATUS_URL(
                appConfig.application_id,
                appConfig.company_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, syncSuccess);
        mock.onPost(
            `${await URLS.SYNC_THEME(
                appConfig.application_id,
                appConfig.company_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, syncSuccess);
        mock.onPost(
            `${await URLS.PULL_THEME(
                appConfig.application_id,
                appConfig.company_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, {
            name: 'Namaste',
            version: '1.0.0',
            zip_url:
                'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/download/609babc943c30e7a5155568d.zip',
            _id: '609babc943c30e7a5155568d',
        });
        mock.onGet(
            `${await URLS.GET_THEME_ASSETS_URL(
                appConfig.company_id,
                appConfig.application_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, {
            items: [
                {
                    value: 'assets/images/1.png',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/images/1.png',
                },
                {
                    value: 'template/foundations.html',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/template/foundations.html',
                },
                {
                    value: 'assets/css/main.css',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/css/main.css',
                },
                {
                    value: 'assets/js/main.js',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/js/main.js',
                },
                {
                    value: 'config/settings_data.json',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/config/settings_data.json',
                },
                {
                    value: 'config/settings_schema.json',
                    link: 'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/config/settings_schema.json',
                },
            ],
        });
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/download/609babc943c30e7a5155568d.zip',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/images/1.png',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/template/foundations.html',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/css/main.css',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/assets/js/main.js',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/config/settings_data.json',
        ).reply(200, {});
        mock.onGet(
            'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addKart/themes/609babc943c30e7a5155568d/config/settings_schema.json',
        ).reply(200, {});
        mock.onPost(
            `${await URLS.ADD_THEME_TO_APPLICATION(
                appConfig.application_id,
                appConfig.company_id,
            )}`,
        ).reply(200, appConfig);
        mock.onPost(`${await URLS.UPDATE_LOCALE(
            appConfig.application_id,
            appConfig.company_id,
            appConfig.theme_id,
        )}.json`).reply(200, {"n":1,"ok":1,"updatedExisting":true});
        mock.onPost(
            `${await URLS.CREATE_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, themeById);
        mock.onPost(
            `${await URLS.START_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-images')}`,
            startUploadFileResForImage,
        );
        mock.onPost(
            `${await URLS.START_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-images')}`,
            startUploadFileResForImage,
        );
        mock.onPost(
            `${await URLS.COMPLETE_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-images')}`,
            completeUploadFileRes,
        );
        mock.onPost(`${await URLS.START_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-src')}`).reply(
            200,
            startUploadFileResForTheme,
        );
        mock.onPost(
            `${await URLS.COMPLETE_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-src')}`,
            completeUploadFileRes,
        );
        mock.onPost(
            `${await URLS.START_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-assets')}`,
            startUploadFileResForTheme,
        );
        mock.onPost(
            `${await URLS.COMPLETE_UPLOAD_URL(appConfig.application_id, appConfig.company_id, appConfig.theme_id,'application-theme-assets')}`,
            completeUploadFileRes,
        );
        mock.onGet(
            `${await URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                themeList.items[0]._id,
                'theme',
            )}`,
        ).reply(200, availablePage);
        mock.onGet(
            `${await URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                themeList.items[0]._id,
                'theme',
            )}`,
        ).reply(200, availablePage);
        mock.onGet(
            `${await URLS.GET_SECTIONS_URL(
                appConfig.company_id,
                appConfig.application_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, availableSection);
        mock.onPost(
            `${await URLS.CREATE_SECTION_URL(
                appConfig.company_id,
                appConfig.application_id,
                themeList.items[0]._id,
            )}`,
        ).reply(200, {});
        mock.onPut(
            `${await URLS.UPDATE_SECTION_URL(
                appConfig.company_id,
                appConfig.application_id,
                themeList.items[0]._id,
                availableSection.items[0]._id,
            )}`,
        ).reply(200, {});
        mock.onDelete(
            `${await URLS.DELETE_SECTION_URL(
                appConfig.company_id,
                appConfig.application_id,
                themeList.items[0]._id,
                availableSection.items[0]._id,
            )}`,
        ).reply(200, {});
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({
            showCreateFolder: 'Yes',
            accountType: 'development',
            selectedCompany: 'cli-test',
            selectedApplication: 'Namaste',
            selectedTheme: 'Namaste',
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'context',
            '-n',
            'fyndx1',
        ]);
    });

    afterAll(() => {
        rimraf.sync('./auth-test-cli.json');
        rimraf.sync('./theme-test-cli.json');
        rimraf.sync(THEME_DOWNLOAD_PATH);
        rimraf.sync(THEME_FOLDER_PATH);
        rimraf.sync('./.fdk/context.json');
        rimraf.sync(партнерыDir);
        stopServer();
    });
    it('should validate UPDATE_LOCALE url', async () => {
        const themeId = '609babc943c30e7a5155568d';
        const companyId = '1';
        const applicationId = '609babc943c30e7a5155568c'
        const expectedUrl = await URLS.UPDATE_LOCALE(
            applicationId,
            companyId,
            themeId,
        );
        const baseUrl = expectedUrl.replace(/\/[0-9a-fA-F]+$/, '');
        expect(baseUrl).toBe(`${configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)}/service/partner/partners/${apiVersion}/company/${companyId}/application/${applicationId}/theme`);
    });
    it('should create new locale', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ selected_locale: 'hi' });
        mock.onPost(
            `${await URLS.CREATE_LOCALE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, {"n":1,"ok":1,"updatedExisting":true});
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'add-locale',
        ]);
        mock.onGet(
            `${await URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, themeList.items);
    });
});
