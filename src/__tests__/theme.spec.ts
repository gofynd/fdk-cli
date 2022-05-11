import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { bootstrap } from '../../bin/fdk';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
const context = require('./fixtures/context.json');
const oauthData = require('./fixtures/oauthData.json');
const data = require('./fixtures/email-login.json');
import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';

jest.mock('inquirer');
let program;

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anuragpandey@gofynd.com']);
}

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
            context
        );
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(context.application_id, context.company_id, namespace)}`
        ).reply(200, context);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                context.application_id,
                context.company_id,
                'application-theme-src'
            )}`
        ).reply(200, context);
        mock.onPost(
            `${URLS.START_UPLOAD_FILE(
                context.application_id,
                context.company_id,
                'application-theme-assets'
            )}`
        ).reply(200, context);
        // mock.onPut(
        //     `${s3Url(
        //         context.application_id,
        //         context.company_id,
        //         'application-theme-assets'
        //     )}`
        // ).reply(200, context);
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                context.application_id,
                context.company_id,
                namespace
            )}`
        ).reply(200, context);
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                context.application_id,
                context.company_id,
               " application-theme-src"
            )}`
        ).reply(200, context);
        mock.onPost(
            `${URLS.COMPLETE_UPLOAD_FILE(
                context.application_id,
                context.company_id,
                'application-theme-assets'
            )}`
        ).reply(200, context);
        mock.onGet(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
        mock.onPost(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
        mock.onPut(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
        mock.onPut(
            `${URLS.AVAILABLE_PAGE(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
        mock.onDelete(
            `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
        ).reply(200, context);
    });
    afterEach(() => {
        configStore.clear();
    });

    // it('should successfully screate new theme', async () => {
    //     await login();
    //     jest.setTimeout(100000)
    //     const inquirerMock = mockFunction(inquirer.prompt);
    //     inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
    //     await program.parseAsync([
    //         'node',
    //         './bin/fdk.js',
    //         'theme',
    //         'new',
    //         '-t',
    //         'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMTFUMDU6MTc6MjkuNDE1WiJ9',
    //         '-n',
    //         'royal',
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
    //         'node',
    //         './bin/fdk.js',
    //         'theme',
    //         'init',
    //         '-t',
    //         'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMTFUMDU6MTc6MjkuNDE1WiJ9'
    //     ]);
        // const x = {
        //     application_id: '622894659baaca3be88c9d65',
        //     token: '4Eoh-yDMW',
        //     company_id: 1,
        //     expires_in: '2022-05-09T11:05:57.197Z',
        // };

        // expect(cookies.Name).toMatch("Anurag Pandey");
        // expect(true).toBeTruthy();
    //     console.log('after expect');
    // });

    // it('should successfully pull  theme', async () => {
    //     await login();
    //     // jest.setTimeout(100000)
    //     // const inquirerMock = mockFunction(inquirer.prompt);
    //     // inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
    //     await program.parseAsync([
    //         'node',
    //         './bin/fdk.js',
    //         'theme',
    //         'pull'
    //     ]);
    //     console.log('after expect');
    // });

    it('should successfully pull  theme', async () => {
        await login();
        // jest.setTimeout(100000)
        // const inquirerMock = mockFunction(inquirer.prompt);
        // inquirerMock.mockResolvedValue({ pullConfig: 'Yes' });
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'theme',
            'publish'
        ]);
        console.log('after expect');
    });

});
