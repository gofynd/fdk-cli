import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
import { generateToken, setEnv } from './helper';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import path from 'path';
import { isEqual } from 'lodash';
import { readFile } from '../helper/file.utils';
import { extractArchive } from '../helper/archive';
const appConfig = require('./fixtures/appConfig.json');
const oauthData = require('./fixtures/oauthData.json');
const themeData = require('./fixtures/themeData.json');
const assetsUploadData = require('./fixtures/assetsUploadData.json');
const srcUploadData = require('./fixtures/srcUploadData.json');
const getAvailablePageData = require('./fixtures/getAvailablePageData.json');
const completeUpload = require('./fixtures/completeUpload.json');
const srcCompleteUpload = require('./fixtures/srcCompleteUpload.json');
const assetsCompleteUpload = require('./fixtures/assetsCompleteUpload.json');
const updateThemeData = require('./fixtures/updateThemeData.json');
const updateAvailablePageData = require('./fixtures/updateAvailablePageData.json');
const syncThemeData = require('./fixtures/syncThemeData.json');
const startUpload = require('./fixtures/startUpload.json');
const publishThemeData = require('./fixtures/publishThemeData.json');
const unpublishThemeData = require('./fixtures/unpublishThemeData.json');
const initThemeData = require('./fixtures/initThemeData.json');
const pullThemeData = require('./fixtures/pullThemeData.json');
const initAppConfigData = require('./fixtures/initAppConfigData.json');
const deleteData = require('./fixtures/deleteData.json');
const data = require('./fixtures/email-login.json');
const { themeToken, initToken } = require('./constants');
import { decodeBase64 } from '../helper/utils';
import { getActiveContext } from '../helper/utils';
import { createDirectory } from '../helper/file.utils';
import { init } from '../fdk';
import configStore from '../lib/Config';

jest.mock('inquirer');
let program;

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anything@something.com']);
}

async function createTheme() {
    let zipPath = path.join(__dirname, 'fixtures', 'rolex.zip');
    let destination = path.join(__dirname, '..', '..', 'test-theme');
    await extractArchive({ zipPath, destFolderPath: destination });
    process.chdir(path.join(__dirname, '..', '..', 'test-theme', 'rolex'));
}

let configObj = JSON.parse(decodeBase64(`${themeToken}`));
let initconfigObj = JSON.parse(decodeBase64(`${initToken}`));
let createThemeToken = generateToken(configObj);
let initThemeToken = generateToken(initconfigObj);

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
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Any One' }],
        });
        mock.onGet(`${URLS.OAUTH_TOKEN(appConfig.company_id)}`).reply(200, oauthData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(appConfig.application_id, appConfig.company_id)}`
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
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-images'
            )}`
        ).replyOnce(200, startUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-images'
            )}`
        ).reply(200, startUpload);
        mock.onPut(`${imageS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-images'
            )}`
        ).reply(200, completeUpload);

        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-src'
            )}`
        ).reply(200, srcUploadData);
        mock.onPut(`${srcS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-src'
            )}`
        ).reply(200, srcCompleteUpload);

        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-assets'
            )}`
        ).reply(200, assetsUploadData);
        mock.onPut(`${assetS3Url}`).reply(200, '');
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                appConfig.application_id,
                appConfig.company_id,
                'application-theme-assets'
            )}`
        ).reply(200, assetsCompleteUpload);
        const availablePageUrl = new RegExp(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
                '*'
            )}`
        );
        mock.onGet(availablePageUrl).reply(200, getAvailablePageData);
        mock.onPost().reply(200, appConfig);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, updateThemeData);
        mock.onPut(availablePageUrl).reply(200, updateAvailablePageData);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}/publish`
        ).reply(200, publishThemeData);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}/unpublish`
        ).replyOnce(200, unpublishThemeData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(appConfig.application_id, appConfig.company_id)}`
        ).reply(200, initAppConfigData);
        mock.onGet(
            `${URLS.THEME_BY_ID(appConfig.application_id, appConfig.company_id, initThemeData._id)}`
        ).reply(200, initThemeData);
        let filePath = path.join(__dirname, 'fixtures', 'archive.zip');
        mock.onGet(initThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(filePath)];
        });

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
        mock.onDelete(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, deleteData);
        await login();
    });

    afterEach(() => {
        const testThemeDir = path.join(process.cwd(), 'rolex');
        try {
            rimraf.sync(testThemeDir);
        } catch (err) {
            console.error(`Error while deleting ${testThemeDir}.`);
        }
    });

    afterAll(() => {
        // rimraf.sync(path.join(__dirname, '..', '..', 'test-theme'));
        fs.rmdirSync(path.join(__dirname, '..', '..', 'test-theme'), { recursive: true });
        process.chdir(path.join(__dirname, '..', '..'));
        configStore.clear();
    });

    it('should successfully create new theme', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'new',
            '-t',
            `${createThemeToken}`,
            '-n',
            'rolex',
        ]);
        process.chdir(`../`);
        const filePath = path.join(process.cwd(), 'rolex');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully pull config theme', async () => {
        await createTheme();
        const filePath = path.join(process.cwd(), '/theme/config/settings_data.json');
        let oldSettings_data: any = readFile(filePath);
        oldSettings_data = JSON.parse(oldSettings_data);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull-config']);
        let newSettings_data: any = readFile(filePath);
        newSettings_data = JSON.parse(newSettings_data);
        process.chdir(`../`);
        expect(isEqual(newSettings_data, oldSettings_data)).toBe(false);
    });

    it('should successfully publish  theme', async () => {
        await createTheme();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'publish']);
        const currentContext = getActiveContext();
        process.chdir(`../`);
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully unpublish  theme', async () => {
        await createTheme();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'unpublish']);
        const currentContext = getActiveContext();
        process.chdir(`../`);
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully sync theme', async () => {
        await createTheme();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'sync']);
        const currentContext = getActiveContext();
        process.chdir(`../`);
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully init theme', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'init',
            '-t',
            `${initThemeToken}`,
        ]);
        process.chdir(`../`);
        const filePath = path.join(process.cwd(), 'vivek-theme');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully pull theme', async () => {
        await createTheme();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull']);
        const filePath = path.join(process.cwd(), '.fdk', 'pull-archive.zip');
        process.chdir(`../`);
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully generate .zip file of theme', async () => {
        await createTheme();
        let filepath = path.join(process.cwd(),'package.json');
        let packageContent: any = readFile(filepath);
        let content = JSON.parse(packageContent);
        let fileName = `${content.name}_${content.version}.zip`;
        let file = path.join(process.cwd(),`${fileName}`)
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'package']);
        expect(fs.existsSync(file)).toBe(true);
    });
});