import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
import path from 'path';
const context = require('./fixtures/context.json');
const oauthData = require('./fixtures/oauthData.json');
const themeData = require('./fixtures/themeData.json');
const imageData = require('./fixtures/imageData.json');
const imageUploadData = require('./fixtures/imageUploadData.json');
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
const data = require('./fixtures/email-login.json');
import { getActiveContext } from '../helper/utils';
import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import Env from '../lib/Env';

jest.mock('inquirer');
let program;

const activeContext = {
    application_id: '622894659baaca3be88c9d65',
    token: '4Eoh-yDMW',
    company_id: 1,
    expires_in: '2022-05-13T04:42:40.276Z'
  }
  const currentContext = {
    name: 'royal',
    application_id: '622894659baaca3be88c9d65',
    domain: 'anuragbazaar.hostx0.de',
    company_id: '1',
    theme_id: '627c939976cee8683a47a087',
    env: 'fyndx0'
  }
async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    // const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anuragpandey@gofynd.com']);
}
const s3Url = 'https://fynd-staging-assets.s3-accelerate.amazonaws.com/x0/company/1/applications/622894659baaca3be88c9d65/theme/assets/fTSArfSBZ-themeBundle.common.js?AWSAccessKeyId=AKIAJUADR2WMPQT6ZJ2Q&Content-Type=application%2Fjavascript&Expires=1652268477&Signature=nAc1K6xhwU4Jz88czrw8og%2BrRXM%3D&x-amz-acl=public-read' 
const responseUrl = 'https://api.fyndx0.de/service/platform/assets/v1.0/company/1/application/622894659baaca3be88c9d65/namespaces/application-theme-assets/upload/start'
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
        ).reply(200, startUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, namespace)}`
        ).reply(200).onPut( `${s3Url}`).reply(200).onPost(`${URLS.COMPLETE_UPLOAD_FILE(
            context.application_id,
            context.company_id,
            namespace
        )}`).reply(200,completeUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, srcCompleteUpload.namespace)}`
        ).reply(200).onPut( `${s3Url}`).reply(200).onPost(`${URLS.COMPLETE_UPLOAD_FILE(
            context.application_id,
            context.company_id,
            srcCompleteUpload.namespace
        )}`).reply(200,srcCompleteUpload);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, assetsCompleteUpload.namespace)}`
        ).reply(200).onPut( `${s3Url}`).reply(200).onPost(`${URLS.COMPLETE_UPLOAD_FILE(
            context.application_id,
            context.company_id,
            assetsCompleteUpload.namespace
        )}`).reply(200,assetsCompleteUpload);
        // mock.onPost(
        //     `${URLS.COMPLETE_UPLOAD_FILE(
        //         context.application_id,
        //         context.company_id,
        //         namespace
        //     )}`
        // ).reply(200, imageUploadData);
        // mock.onPost(
        //     `${URLS.COMPLETE_UPLOAD_FILE(
        //         context.application_id,
        //         context.company_id,
        //        " application-theme-src"
        //     )}`
        // ).reply(200, srcUploadData);
        // mock.onPost(
        //     `${URLS.COMPLETE_UPLOAD_FILE(
        //         context.application_id,
        //         context.company_id,
        //        
        //  'application-theme-assets'
        //     )}`
        // ).reply(200, context);
        mock.onGet(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, getAvailablePageData);
        // mock.onPost(
        //     `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        // ).reply(200, context);
        mock.onPut(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, updateThemeData);
        mock.onPut(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, updateAvailablePageData);
        // mock.onDelete(
        //     `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        // ).reply(200, themeData);
    });
    // afterEach(() => {
    //     configStore.clear();
    // });

    it('should successfully create new theme', async () => {
        await login();
        jest.setTimeout(1000000)
        const assetCdnUrl = path.dirname(startUpload.cdn.url);
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'new',
            '-t',
            'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMThUMDk6NDU6MDYuODczWiJ9',
            '-n',
            'royal',
        ]);
        // const x = {
        //     application_id: '622894659baaca3be88c9d65',
        //     token: '4Eoh-yDMW',
        //     company_id: 1,
        //     expires_in: '2022-05-09T11:05:57.197Z',
        // };
        console.log('after expect');
    });

    // it('should successfully sync theme', async () => {
    //     await login();
    //     // jest.setTimeout(100000)
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'sync'
    //     ]);
    //     const x = {
    //         application_id: '622894659baaca3be88c9d65',
    //         token: '4Eoh-yDMW',
    //         company_id: 1,
    //         expires_in: '2022-05-09T11:05:57.197Z',
    //     };
    //     console.log('after expect');
    // });

    

    // it('should successfully init theme', async () => {
    //     await login();
    //     // const inquirerMock = mockFunction(inquirer.prompt);
    //     // inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'init',
    //         '-t',
    //         'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMTNUMTQ6MTg6MjEuODAzWiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0='
    //     ]);
    //     const x = {
    //         application_id: '622894659baaca3be88c9d65',
    //         token: '4Eoh-yDMW',
    //         company_id: 1,
    //         expires_in: '2022-05-09T11:05:57.197Z',
    //     };

    //     // expect(cookies.Name).toMatch("Anurag Pandey");
    //     // expect(true).toBeTruthy();
    //     console.log('after expect');
    // });

    // it('should successfully pull  theme', async () => {
    //     await login();
    //     // jest.setTimeout(100000)
    //     // const inquirerMock = mockFunction(inquirer.prompt);
    //     // inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'pull'
    //     ]);
    //     console.log('after expect');
    // });

    // it('should successfully publish  theme', async () => {
    //     await login();
    //     // jest.setTimeout(100000)
    //     // const inquirerMock = mockFunction(inquirer.prompt);
    //     // inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
    //     await program.parseAsync([
    //         'ts-node',
    //         './src/fdk.ts',
    //         'theme',
    //         'publish'
    //     ]);
    //     console.log('after expect');
    // });

});
