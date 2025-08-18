import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { uninterceptedApiClient, withoutErrorResponseInterceptorAxios } from '../lib/api/ApiClient';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
import { setEnv } from './helper';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import path from 'path';
import { isEqual } from 'lodash';
import { readFile } from '../helper/file.utils';
import { extractArchive } from '../helper/archive';
const appConfig = require('./fixtures/appConfig.json');
const translatedData = require("./fixtures/translation.json")
const reactThemeData = require('./fixtures/reactThemeData.json');
const reactThemeList = require('./fixtures/reactThemeList.json');
const assetsUploadData = require('./fixtures/assetsUploadData.json');
const srcUploadData = require('./fixtures/srcUploadData.json');
const getAllAvailablePage = require('./fixtures/getAllAvailablePage.json');
const completeUpload = require('./fixtures/completeUpload.json');
const srcCompleteUpload = require('./fixtures/srcCompleteUpload.json');
const assetsCompleteUpload = require('./fixtures/assetsCompleteUpload.json');
const updateThemeData = require('./fixtures/updateThemeData.json');
const updateAvailablePageData = require('./fixtures/updateAvailablePageData.json');
const syncThemeData = require('./fixtures/syncThemeData.json');
const startUpload = require('./fixtures/startUpload.json');
const tokenData = require('./fixtures/partnertoken.json');
const initReactThemeData = require('./fixtures/initReactThemeData.json');
const pullReactThemeData = require('./fixtures/pullReactThemeData.json');
const initAppConfigData = require('./fixtures/initAppConfigData.json');
const deleteData = require('./fixtures/deleteData.json');
const deleteAvailablePage = require('./fixtures/deleteAvailablePage.json');
const updateAllAvailablePageData = require('./fixtures/updateAllAvailablePage.json');
const appList = require('./fixtures/applicationList.json');
const data = require('./fixtures/email-login.json');
const organizationData = require("./fixtures/organizationData.json")
import { createDirectory } from '../helper/file.utils';
import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { startServer, getApp } from '../lib/Auth';
const request = require('supertest');
import {
    getRandomFreePort
} from '../helper/extension_utils';

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
    const path = jest.requireActual<typeof import('path')>('path');
    return class MockConfigstore {
        store = new Store('@gofynd/fdk-cli', undefined, {
            configPath: path.join(__dirname, 'theme-test-cli.json'),
        });
        all = this.store.all;
        size = this.store.size;
        path = this.store.path;
        get(key: string) {
            return this.store.get(key);
        }
        set(key: string, value: any) {
            this.store.set(key, value);
        }
        delete(key: string) {
            this.store.delete(key);
        }
        clear() {
            this.store.clear();
        }
        has(key: string) {
            return this.store.has(key);
        }
    };
});

jest.mock('open', () => {
    return () => {}
})


async function createReactTheme() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({
        showCreateFolder: 'Yes',
        accountType: 'development',
        selectedCompany: 'cli-test',
        selectedApplication: 'anurag',
        selectedTheme: 'Namaste',
        themeType: 'react',
    });
    await program.parseAsync([
        'ts-node',
        './src/fdk.ts',
        'theme',
        'new',
        '-n',
        'Locale_Turbo',
    ]);
}

const imageS3Url = startUpload.upload.url;
const srcS3Url = srcUploadData.upload.url;
const assetS3Url = assetsUploadData.upload.url;

describe('React Theme Commands', () => {
    beforeAll(async () => {
        setEnv();
        createDirectory(path.join(__dirname, '..', '..', 'react-test-theme'));
        process.chdir(`./react-test-theme/`);
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        const mockInstance = new MockAdapter(
            uninterceptedApiClient.axiosInstance,
        );
        const mockCustomAxios = new MockAdapter(withoutErrorResponseInterceptorAxios);
        configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id)
        mock.onGet('https://api.fyndx1.de/service/application/content/_healthz').reply(200);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, appConfig);
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, appConfig);

        mock.onGet(
            `${URLS.GET_LOCALES(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, translatedData);

        mock.onPost(
            `${URLS.CREATE_THEME(
                appConfig.application_id,
                appConfig.company_id,
            )}`,
        ).reply(200, reactThemeData);
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, reactThemeData);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE('application-theme-images')}`,
        ).replyOnce(200, startUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE('application-theme-images')}`,
        ).reply(200, startUpload);
        mock.onPut(`${imageS3Url}`).reply(200, '');
        mockInstance.onPut(`${imageS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE('application-theme-images')}`,
        ).reply(200, completeUpload);
        mock.onPost(`${URLS.START_UPLOAD_FILE('application-theme-src')}`).reply(
            200,
            srcUploadData,
        );
        mock.onPut(`${srcS3Url}`).reply(200, '');
        mockInstance.onPut(`${srcS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE('application-theme-src')}`,
        ).reply(200, srcCompleteUpload);

        mock.onPost(
            `${URLS.START_UPLOAD_FILE('application-theme-assets')}`,
        ).reply(200, assetsUploadData);
        mock.onPut(`${assetS3Url}`).reply(200, '');
        mockInstance.onPut(`${assetS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE('application-theme-assets')}`,
        ).reply(200, assetsCompleteUpload);
        const availablePageUrl = new RegExp(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        );
        const availablePage = new RegExp(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
                '*',
            )}`,
        );
        mock.onGet(availablePageUrl).reply(200, getAllAvailablePage.data);
        mock.onPost().reply(200, appConfig);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, updateThemeData);
        mock.onPut(availablePageUrl).reply(200, updateAvailablePageData);
        mock.onPut(availablePageUrl).reply(200, updateAllAvailablePageData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(
                appConfig.application_id,
                appConfig.company_id,
            )}`,
        ).reply(200, initAppConfigData);
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                initReactThemeData._id,
            )}`,
        ).reply(200, initReactThemeData);
        let filePath = path.join(__dirname, 'fixtures', 'archive.zip');
        //
        mockInstance
            .onGet(
                'https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyndnp/wrkr/x5/misc/general/free/original/kS2Wr8Lwe-Turbo-payment_1.0.154.zip',
            )
            .reply(function () {
                return [200, fs.createReadStream(filePath)];
            });
        mock.onGet(initReactThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(filePath)];
        });

        mock.onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`).reply(200, {
            items: [
                {
                    company: {
                        uid: 1,
                        name: 'cli-test',
                    },
                    company_name: 'cli-test',
                },
            ],
        });

        mock.onGet(`${URLS.GET_LIVE_ACCOUNTS(1, 9999)}`).reply(200, {
            items: [
                {
                    company: {
                        uid: 1,
                        name: 'cli-test',
                    },
                    company_name: 'cli-test',
                },
            ],
        });

        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, pullReactThemeData);
        let zipfilePath = path.join(__dirname, 'fixtures', 'Locale_Turbo.zip');
        mock.onGet(pullReactThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(zipfilePath)];
        });
        mockInstance.onGet(pullReactThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(zipfilePath)];
        });
        mock.onDelete(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, deleteData);
        mock.onDelete(availablePage).reply(200, deleteAvailablePage);

        mock.onGet(`${URLS.GET_APPLICATION_LIST(appConfig.company_id, 1, 999)}`).reply(
            200,
            appList,
        );

        mock.onGet(
            `${URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, reactThemeList.items);

        mock.onGet(
            `${URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, reactThemeList.items);

        mock.onGet(
            `${URLS.GET_LOCALES(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, translatedData);

        const expectedUrl = URLS.UPDATE_LOCALE(
            appConfig.application_id,
            appConfig.company_id,
            appConfig.theme_id
        );
        console.log('Mocking PUT to:', expectedUrl);
        const baseUrl = expectedUrl.replace(/\/[0-9a-fA-F]+$/, '');
        const putRe = new RegExp(`^${baseUrl}/[0-9a-fA-F]+$`);
        mock.onPut(putRe).reply(200, {});

        mockCustomAxios.onPost(
            `${URLS.CREATE_LOCALE(
                appConfig.application_id,
                appConfig.company_id,
            )}`,
        ).reply(200, {});

        mock.onGet(
            `${URLS.GET_DEFAULT_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, { name: 'Emerge' });


        mock.onGet(`${URLS.GET_ORGANIZATION_DETAILS()}`).reply(200, organizationData);
        configStore.delete(CONFIG_KEYS.ORGANIZATION)

        mock.onGet('https://github.com/gofynd/Turbo/archive/refs/heads/main.zip').passThrough()
        // user login
        configStore.set(CONFIG_KEYS.USER, data.user);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
        const port =  await getRandomFreePort([]);
        const app = await startServer(port);
        const req = request(app);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', 'api.fyndx1.de']);
        await req.post('/token').send(tokenData);
    });

    afterEach(() => {
        const reactThemeDir = path.join(process.cwd(), 'Locale_Turbo');
        try {
            rimraf.sync(reactThemeDir);
        } catch (err) {
            console.error(`Error while deleting ${reactThemeDir}.`);
        }
    });

    afterAll(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fs.rm(path.join(__dirname, '..', '..', 'react-test-theme'), {
            recursive: true,
        });        
        process.chdir(path.join(__dirname, '..', '..'));
        rimraf.sync(path.join(__dirname, 'theme-test-cli.json')); // remove configstore
    });

    it('should successfully create new react theme', async () => {
        await createReactTheme();
        const filePath = path.join(process.cwd());
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully pull config React theme', async () => {
        await createReactTheme();
        process.chdir(path.join(process.cwd()));
        const filePath = path.join(
            process.cwd(),
            '/theme/config/settings_data.json',
        );
        let oldSettings_data: any = readFile(filePath);
        oldSettings_data = JSON.parse(oldSettings_data);
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'pull-config',
        ]);
        let newSettings_data: any = readFile(filePath);
        newSettings_data = JSON.parse(newSettings_data);
        process.chdir(`../`);
        expect(isEqual(newSettings_data, oldSettings_data)).toBe(false);
    });
});
