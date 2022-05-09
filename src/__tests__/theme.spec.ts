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

jest.mock('inquirer');

beforeEach(async() => {
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
   
})
beforeAll(() => {
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
        'set-cookie': [{ Name: 'Anurag Pandey' }],
    });
    mock.onGet(`${URLS.OAUTH_TOKEN(context.companyId)}`).reply(200, oauthData);
})

afterEach(() => {
    configStore.clear();
});

async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'login', '-e', 'anuragpandey@gofynd.com']);
}

describe('create new theme', () => {
        it('should successfully screate new theme', async () => {
            login();
            const mock = new MockAdapter(axios);
                mock.onGet(`${URLS.GET_APPLICATION_DETAILS(context.application_id,context.company_id)}`).reply(200, context);
                mock.onGet(`${URLS.THEME_BY_ID(context.application_id,context.company_id,context.theme_id)}`).reply(200, context);
                mock.onPost(`${URLS.CREATE_THEME(context.application_id, context.companyId)}`).reply(200, oauthData);
                // mock.onPost(`${URLS.START_UPLOAD_FILE(context.application_id, context.companyId,namespace)}`).reply(200, oauthData);
                mock.onGet(`${URLS.AVAILABLE_PAGE(context.application_id, context.companyId,context.theme_id)}`).reply(200, oauthData);
                mock.onPut(`${URLS.THEME_BY_ID(context.application_id,context.company_id,context.theme_id)}`).reply(200, context);
                const program = await bootstrap();
            await program.parseAsync(['node', './bin/fdk.js', 'theme', 'new', '-t', '', '-n', 'royal']);
    
            // expect(cookies.Name).toMatch("Anurag Pandey");
            // expect(true).toBeTruthy();
            console.log('after expect');
        });
    });