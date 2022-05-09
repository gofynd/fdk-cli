import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { bootstrap } from '../../bin/fdk';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
const context = require('./fixtures/context.json');
const oauthData = require('./fixtures/oauthData.json');
const data = require('./fixtures/email-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { decodeBase64 } from '../helper/utils';
import fs from 'fs-extra';
import path from 'path';

jest.mock('inquirer');

beforeEach(async () => {
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
});

beforeAll(async () => {
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
        'set-cookie': [{ Name: 'Anurag Pandey' }],
    });
    mock.onGet(`${URLS.OAUTH_TOKEN(context.company_id)}`).reply(200, oauthData);
    console.log(context.company_id);
    mock.onGet(`${URLS.GET_APPLICATION_DETAILS(context.application_id, context.company_id)}`).reply(
        200,
        context
    );
    mock.onGet(
        `${URLS.THEME_BY_ID(context.application_id, context.company_id, context.theme_id)}`
    ).reply(200, context);
});

afterEach(() => {
    configStore.clear();
});

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anuragpandey@gofynd.com']);
}

describe('Add Theme Context', () => {
    it('should successfully add theme context ', async () => {
        console.log('inside adding context');
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ showCreateFolder: 'Yes' });
        const program = await bootstrap();
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'theme',
            'context',
            '-t',
            'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMDlUMDQ6NDg6MjguODg5WiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0=',
            '-n',
            'fyndabcdefjki',
        ]);
        const x = {
            application_id: '622894659baaca3be88c9d65',
            token: '4Eoh-yDMW',
            company_id: 1,
            expires_in: '2022-05-09T04:48:28.889Z',
            theme_id: '623b09faeb0b6e0f4ff9758f',
        };
        const configObj = JSON.parse(
            decodeBase64(
                'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMDlUMDQ6NDg6MjguODg5WiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0='
            )
        );
        expect(configObj).toMatchObject(x);
    });
});

describe('show Theme Context list', () => {
    it('should successfully show theme context list', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ listContext: 'fyndabcdefjk' });
        const program = await bootstrap();
        await program.parseAsync(['node', './bin/fdk.js', 'theme', 'context-list']);
        const contextPath = path.join(process.cwd(), '.fdk/context.json');
        let contextJSON = await fs.readJSON(contextPath);
        let contextObj = contextJSON.theme.active_context;
        expect(contextObj).toMatch('fyndabcdefjk');
    });
});
