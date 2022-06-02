import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
import { generateToken } from './helper';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import path from 'path';
import _ from 'lodash';
import { readFile } from '../helper/file.utils';
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
const initAppConfigData = require('./fixtures/initAppConfigData.json');
const data = require('./fixtures/email-login.json');
import { decodeBase64 } from '../helper/utils';
import { getActiveContext } from '../helper/utils';
import { init } from '../fdk';
import configStore from '../lib/Config';
import CommandError from '../lib/CommandError';

jest.mock('inquirer');
let program;

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'abcd@something.com']);
}

let configObj = JSON.parse(
    decodeBase64(
        'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMjZUMTM6NDM6MzcuMTQ4WiJ9'
    )
);
let initconfigObj = JSON.parse(
    decodeBase64(
        'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDYtMDFUMTA6NTA6MDkuNDk0WiIsInRoZW1lX2lkIjoiNjI4ZjM0ZGVmM2UwOTEzYzA2YWMxZjc3In0='
    )
);
let token = generateToken(configObj);
let initToken = generateToken(initconfigObj);

const imageS3Url = startUpload.upload.url;
const srcS3Url = srcUploadData.upload.url;
const assetS3Url = assetsUploadData.upload.url;

describe('Theme Commands', () => {
    beforeEach(async () => {
        await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
        program.commands.forEach(command => {
            command._optionValues = {};
        });
    });
    beforeAll(async () => {
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
        mock.onGet(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, getAvailablePageData);
        mock.onPost(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, appConfig);
        mock.onPut(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, updateThemeData);
        mock.onPut(
            `${URLS.AVAILABLE_PAGE(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, updateAvailablePageData);
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

        let filePath = path.join(process.cwd(), '/src/__tests__/fixtures/archive.zip');
        let url = initThemeData.src.link;
        mock.onGet(initThemeData.src.link).reply(function () {
            return [200, fs.createReadStream(filePath)];
        });
    });

    afterEach(() => {
        configStore.clear();
    });
    afterAll(() => {
        const filePath = path.join(process.cwd() + '/../');
        try {
            rimraf.sync(filePath);
        } catch (err) {
            console.error(`Error while deleting ${filePath}.`);
        }
    });
    it('should successfully create new theme', async () => {
        await login();
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'new',
            '-t',
            `${token}`,
            '-n',
            'rolex',
        ]);
        const filePath = path.join(process.cwd());
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully sync theme', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'sync']);
        const currentContext = getActiveContext();
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully pull config theme', async () => {
        await login();
        const filePath = path.join(process.cwd(),'/theme/config/settings_data.json')
        let oldSettings_data: any = readFile(filePath)
        try {
            oldSettings_data = JSON.parse(oldSettings_data);
        } catch (e) {
            throw new CommandError(`Invalid config.json`);
        }
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull-config']);
        let newSettings_data: any = readFile(filePath)
        try {
            newSettings_data = JSON.parse(newSettings_data);
        } catch (e) {
            throw new CommandError(`Invalid config.json`);
        }
        expect(_.isEqual(newSettings_data, oldSettings_data)).toBeFalsy();
    });

    it('should successfully publish  theme', async () => {
        await login();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'publish']);
        const currentContext = getActiveContext();
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully unpublish  theme', async () => {
        await login();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'unpublish']);
        const currentContext = getActiveContext();
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully init theme', async () => {
        await login();
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'init',
            '-t',
            `${initToken}`,
        ]);
        const filePath = path.join(process.cwd());
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should successfully pull  theme', async () => {
        await login();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'pull']);
        const filePath = path.join(process.cwd(), './.fdk/pull-archive.zip');
        expect(fs.existsSync(filePath)).toBe(true);
    });
});
