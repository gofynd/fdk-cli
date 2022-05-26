import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
const context = require('./fixtures/context.json');
const oauthData = require('./fixtures/oauthData.json');
const themeData = require('./fixtures/themeData.json');
const assetsUploadData = require('./fixtures/assetsUploadData.json');
const srcUploadData = require('./fixtures/srcUploadData.json');
const getAvailablePageData = require('./fixtures/getAvailablePageData.json');
const createdAvailablePageData = require('./fixtures/createdAvailablePageData.json');
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

jest.mock('inquirer');
let program;

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anuragpandey@gofynd.com']);
}

let configObj = JSON.parse(
    decodeBase64(
        'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMjZUMTM6NDM6MzcuMTQ4WiJ9'
    )
);
const imageS3Url = startUpload.upload.url
const srcS3Url = srcUploadData.upload.url
const assetS3Url = assetsUploadData.upload.url
describe('Theme Commands', () => {
    beforeEach(async () => {
        await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
        program.commands.forEach(command => {
            command._optionValues = {};
        });
    });
    beforeAll(async () => {
        const namespace = 'application-theme-images';
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Anurag Pandey' }],
        });
        mock.onGet(`${URLS.OAUTH_TOKEN(context.company_id)}`).reply(200, oauthData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(context.application_id, context.company_id)}`
        ).reply(200, context);
        mock.onGet(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
        mock.onPost(`${URLS.CREATE_THEME(context.application_id, context.company_id)}`).reply(
            200,
            themeData
        );
        mock.onGet(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, syncThemeData);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, namespace)}`
        ).replyOnce(200, startUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, namespace)}`
        ).reply(200,startUpload)
        mock.onPut(`${imageS3Url}`).reply(200,'')
        mock.onPost(`${URLS.COMPLETE_UPLOAD_FILE(context.application_id,context.company_id,namespace)}`).reply(200,completeUpload);
        
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, "application-theme-src")}`
        ).reply(200,srcUploadData)
        mock.onPut(`${srcS3Url}`).reply(200,'')
        mock.onPost(`${URLS.COMPLETE_UPLOAD_FILE(context.application_id,context.company_id,"application-theme-src")}`).reply(200,srcCompleteUpload);
        
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, "application-theme-assets")}`
        ).reply(200,assetsUploadData)
        mock.onPut(`${assetS3Url}`).reply(200,'')
        mock.onPost(`${URLS.COMPLETE_UPLOAD_FILE(context.application_id,context.company_id,"application-theme-assets")}`).reply(200,assetsCompleteUpload);
        mock.onGet(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, getAvailablePageData);
        mock.onPost(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, createdAvailablePageData);
        mock.onPut(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, updateThemeData);
        mock.onPut(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, updateAvailablePageData);
        mock.onPut(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).replyOnce(200, publishThemeData);
        mock.onPut(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).replyOnce(200, unpublishThemeData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(context.application_id, context.company_id)}`
        ).reply(200, initAppConfigData);
        mock.onGet(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, initThemeData);
    });
    afterEach(() => {
        configStore.clear();
    });
    it('should successfully create new theme', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'new',
            '-t',
            'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMjZUMTU6MzI6NTQuNDI0WiJ9',
            '-n',
            'royald',
        ]);
        const currentContext = getActiveContext();
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    it('should successfully sync theme', async () => {
        await login();
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'sync'
        ]);
        const currentContext = getActiveContext();
        expect(configObj.application_id).toMatch(currentContext.application_id);
    });

    

    // it('should successfully init theme', async () => {
    //     await login();
    //     console.log("1")
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'init',
    //         '-t',
    //         'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMjZUMTU6MjI6NDkuOTY4WiIsInRoZW1lX2lkIjoiNjI0NDJjYzYyNzhkYmM1MGU5YmZhY2UyIn0='
    //     ]);
    //     console.log("2")
    //     const currentContext = getActiveContext();
    //     expect(configObj.application_id).toMatch(currentContext.application_id);
    // });

    // it('should successfully pull  theme', async () => {
    //     await login();
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'pull'
    //     ]);
    //     const currentContext = getActiveContext();
    //     expect(configObj.application_id).toMatch(currentContext.application_id);
    // });

    // it('should successfully pull config theme', async () => {
    //     await login();
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'pull-config'
    //     ]);
    //     expect(configObj.application_id).toMatch(currentContext.application_id);
    // });

    // it('should successfully publish  theme', async () => {
    //     await login();
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'publish'
    //     ]);
    //     expect(configObj.application_id).toMatch(currentContext.application_id);
    // });

    // it('should successfully unpublish  theme', async () => {
    //     await login();
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'unpublish'
    //     ]);
    //     expect(configObj.application_id).toMatch(currentContext.application_id);
    // });

});
