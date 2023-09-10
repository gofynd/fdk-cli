import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { uninterceptedApiClient } from '../lib/api/ApiClient'
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
const themeList = require('./fixtures/themeList.json');
const themeData = require('./fixtures/themeData.json');
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
const initThemeData = require('./fixtures/initThemeData.json');
const pullThemeData = require('./fixtures/pullThemeData.json');
const initAppConfigData = require('./fixtures/initAppConfigData.json');
const deleteData = require('./fixtures/deleteData.json');
const deleteAvailablePage = require('./fixtures/deleteAvailablePage.json');
const updateAllAvailablePageData = require('./fixtures/updateAllAvailablePage.json');
const appList = require('./fixtures/applicationList.json');
const data = require('./fixtures/email-login.json');
import { createDirectory } from '../helper/file.utils';
import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { startServer, getApp } from '../lib/Auth';
const request = require('supertest')

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
    const Store = jest.requireActual<typeof import('configstore')>('configstore');
    const path = jest.requireActual<typeof import('path')>('path');
    return class MockConfigstore {

        store = new Store('@gofynd/fdk-cli', undefined, { configPath: path.join(__dirname, "theme-test-cli.json") })
        all = this.store.all
        size = this.store.size
        path = this.store.path
        get(key: string) {
            return this.store.get(key)
        }
        set(key: string, value: any) {
            this.store.set(key, value);
        }
        delete(key: string) {
            this.store.delete(key)
        }
        clear() {
            this.store.clear();
        }
        has(key: string) {
            return this.store.has(key)
        }
    }
});

async function createThemeFromZip() {
    let zipPath = path.join(__dirname, 'fixtures', 'rolex.zip');
    let destination = path.join(__dirname, '..', '..', 'test-theme');
    await extractArchive({ zipPath, destFolderPath: destination });
    if (!fs.existsSync(path.join(process.cwd(), '.fdk')))
        await fs.mkdir(path.join(process.cwd(), '.fdk'));
    process.chdir(path.join(__dirname, '..', '..', 'test-theme'));
    let context = {
        "theme": {
            "active_context": "test-context-new",
            "contexts": {
                "test-context-new": {
                    "name": "test-context-new",
                    "application_id": "622894659baaca3be88c9d65",
                    "domain": "e2end-testing.hostx1.de",
                    "company_id": 1,
                    "theme_id": "622894659baaca3be88c9d65",
                    "application_token": "8DXpyVsKD",
                    "env": "fyndx1"
                },
            }
        },
        "partners": {}
    }

    await fs.writeJSON(path.join(process.cwd(), '.fdk', 'context.json'), context);
}

async function createTheme() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({
        showCreateFolder: 'Yes',
        accountType: 'development',
        selectedCompany: 'cli-test',
        selectedApplication: 'anurag',
        selectedTheme: 'Namaste'
    });
    await program.parseAsync([
        'ts-node',
        './src/fdk.ts',
        'theme',
        'new',
        '-n',
        'rolex',
    ]);
    process.chdir(`../`);
}
const imageS3Url = startUpload.upload.url;
const srcS3Url = srcUploadData.upload.url;
const assetS3Url = assetsUploadData.upload.url;

describe('Theme Commands', () => {
    beforeAll(async () => {
        setEnv();
        createDirectory(path.join(__dirname, '..', '..', 'test-theme'));
        process.chdir(`./test-theme/`);
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        const mockInstance = new MockAdapter(uninterceptedApiClient.axiosInstance);
        mock.onGet(`${URLS.IS_VERSION_COMPATIBLE()}`).reply(200);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(appConfig.company_id, appConfig.application_id)}`
        ).reply(200, appConfig);
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, appConfig);
        mock.onPost(`${URLS.CREATE_THEME(appConfig.application_id, appConfig.company_id)}`).reply(
            200,
            themeData
        );
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, syncThemeData);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                'application-theme-images'
            )}`
        ).replyOnce(200, startUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                'application-theme-images'
            )}`
        ).reply(200, startUpload);
        mock.onPut(`${imageS3Url}`).reply(200, '');
        mockInstance.onPut(`${imageS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                'application-theme-images'
            )}`
        ).reply(200, completeUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                'application-theme-src'
            )}`
        ).reply(200, srcUploadData);
        mock.onPut(`${srcS3Url}`).reply(200, '');
        mockInstance.onPut(`${srcS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                'application-theme-src'
            )}`
        ).reply(200, srcCompleteUpload);

        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                'application-theme-assets'
            )}`
        ).reply(200, assetsUploadData);
        mock.onPut(`${assetS3Url}`).reply(200, '');
        mockInstance.onPut(`${assetS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                'application-theme-assets'
            )}`
        ).reply(200, assetsCompleteUpload);
        const availablePageUrl = new RegExp(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`
        );
        const availablePage = new RegExp(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
                "*"
            )}`
        );
        mock.onGet(availablePageUrl).reply(200, getAllAvailablePage.data);
        mock.onPost().reply(200, appConfig);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, updateThemeData);
        mock.onPut(availablePageUrl).reply(200, updateAvailablePageData);
        mock.onPut(availablePageUrl).reply(200, updateAllAvailablePageData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(appConfig.application_id, appConfig.company_id)}`
        ).reply(200, initAppConfigData);
        mock.onGet(
            `${URLS.THEME_BY_ID(appConfig.application_id, appConfig.company_id, initThemeData._id)}`
        ).reply(200, initThemeData);
        let filePath = path.join(__dirname, 'fixtures', 'archive.zip');
        //
        mockInstance.onGet("https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyndnp/wrkr/addsale/misc/general/free/original/EX4vGsKSE-Namaste_1.0.88.zip").reply(function () {
            return [200, fs.createReadStream(filePath)];
        });
        mock.onGet(initThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(filePath)];
        });

        mock
            .onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`)
            .reply(200, {
                items: [{
                    "company": {
                        "uid": 1,
                        "name": "cli-test"
                    },
                    company_name: "cli-test"
                }]
            })

        mock
            .onGet(`${URLS.GET_LIVE_ACCOUNTS(1, 9999)}`)
            .reply(200, {
                items: [{
                    "company": {
                        "uid": 1,
                        "name": "cli-test"
                    }, company_name: "cli-test"
                }]
            })

        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, pullThemeData);
        let zipfilePath = path.join(__dirname, 'fixtures', 'pull-archive.zip');
        mock.onGet(pullThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(zipfilePath)];
        });
        mockInstance.onGet(pullThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(zipfilePath)];
        });
        mock.onDelete(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, deleteData);
        mock.onDelete(availablePage).reply(200, deleteAvailablePage);

        mock.onGet(
            `${URLS.GET_APPLICATION_LIST(
                appConfig.company_id,
            )}`
        ).reply(200, appList);


        mock
            .onGet(`${URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`)
            .reply(200, themeList.items);

        mock.onGet(
            `${URLS.GET_DEFAULT_THEME(appConfig.company_id, appConfig.application_id)}`
        ).reply(200, { name: 'Emerge' });

        // user login
        configStore.set(CONFIG_KEYS.USER, data.user)

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
        const app = await startServer();
        const req = request(app)
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
        ]);
        await req.post('/token').send(tokenData);
    });

    afterEach(() => {
        const testThemeDir = path.join(process.cwd(), 'rolex');
        const namasteThemeDir = path.join(process.cwd(), 'Namaste');
        try {
            rimraf.sync(testThemeDir);
            rimraf.sync(namasteThemeDir);
        } catch (err) {
            console.error(`Error while deleting ${testThemeDir}.`);
        }
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        fs.rm(path.join(__dirname, '..', '..', 'test-theme'), { recursive: true });
        process.chdir(path.join(__dirname, '..', '..'));
        rimraf.sync(path.join(__dirname, 'theme-test-cli.json')) // remove configstore
    });

    it('should successfully create new theme', async () => {
        await createTheme();
        const filePath = path.join(process.cwd(), 'rolex');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully pull config theme', async () => {
        await createTheme();
        process.chdir(path.join(process.cwd(), "rolex"))
        const filePath = path.join(process.cwd(), '/theme/config/settings_data.json');
        let oldSettings_data: any = readFile(filePath);
        oldSettings_data = JSON.parse(oldSettings_data);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull-config']);
        let newSettings_data: any = readFile(filePath);
        newSettings_data = JSON.parse(newSettings_data);
        process.chdir(`../`);
        expect(isEqual(newSettings_data, oldSettings_data)).toBe(false);
    });

    it('should successfully pull theme', async () => {
        await createThemeFromZip();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull']);
        const filePath = path.join(process.cwd(), '.fdk', 'pull-archive.zip');
        process.chdir(`../`);
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully init theme', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({
            showCreateFolder: 'Yes',
            accountType: 'development',
            selectedCompany: 'cli-test',
            selectedApplication: 'anurag',
            selectedTheme: 'Namaste'
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'init'
        ]);
        process.chdir(`../`);
        const filePath = path.join(process.cwd(), 'Namaste');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully generate .zip file of theme', async () => {
        await createTheme();
        process.chdir(path.join(process.cwd(), "rolex"))
        let filepath = path.join(process.cwd(), 'package.json');
        let packageContent: any = readFile(filepath);
        let content = JSON.parse(packageContent);
        let fileName = `${content.name}_${content.version}.zip`;
        let file = path.join(process.cwd(), `${fileName}`)
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'package']);
        expect(fs.existsSync(file)).toBe(true);
    });

});