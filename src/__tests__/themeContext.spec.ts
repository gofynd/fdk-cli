import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
const context = require('./fixtures/context.json');
const oauthData = require('./fixtures/oauthData.json');
const data = require('./fixtures/email-login.json');
import configStore from '../lib/Config';
import { decodeBase64 } from '../helper/utils';
import fs from 'fs-extra';
import path from 'path';
import { init } from '../fdk';

jest.mock('inquirer');
let program;

afterEach(() => {
    configStore.clear();
});

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '-e', 'anuragpandey@gofynd.com']);
}

describe('Theme Context Commands', () => {
    beforeEach(async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0']);
        program.commands.forEach(command => {
            command._optionValues = {};
        });
    });

    beforeAll(async () => {
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
    });

    it('should successfully add theme context ', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ showCreateFolder: 'Yes' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
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

    it('should successfully show theme context list', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ listContext: 'fyndabcdefjk' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'context-list']);
        const contextPath = path.join(process.cwd(), '.fdk/context.json');
        let contextJSON = await fs.readJSON(contextPath);
        let contextObj = contextJSON.theme.active_context;
        expect(contextObj).toMatch('fyndabcdefjk');
    });
});
