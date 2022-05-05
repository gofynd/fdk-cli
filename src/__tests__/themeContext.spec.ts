import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { bootstrap } from '../../bin/fdk';
// const {bootstrap} = require('../../bin/fdk');
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
const context = require('./fixtures/context.json');
const mobileData = require('./fixtures/mobile-login.json');
const data = require('./fixtures/email-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { getCommonHeaderOptions } from '../lib/api/services/utils';
import { getActiveContext } from '../../src/helper/utils';

jest.mock('inquirer');


beforeAll(async() => {
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
        'set-cookie': [{ Name: 'Anurag Pandey' }],
    });
    mock.onPost(`${URLS.GET_APPLICATION_DETAILS(data.application_id,data.company_id)}`).reply(200, context);
    mock.onPost(`${URLS.THEME_BY_ID(data.application_id,data.company_id,data.theme_id)}`).reply(200, context);
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
//   const token = "eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMDVUMDg6MjE6MzMuMTM0WiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0=="
// const data = getActiveContext();
// console.log("data",data)
//   beforeAll(() =>{
// const data = getActiveContext();
// console.log("data",data)
// const mock = new MockAdapter(axios);
// mock.onPost(`${URLS.GET_APPLICATION_DETAILS(data.application_id,data.company_id)}`).reply(200, context);
// mock.onPost(`${URLS.THEME_BY_ID(data.application_id,data.company_id,data.theme_id)}`).reply(200, context);
// // mock.onPost(`${URLS.VERIFY_OTP()}`).reply(200, data, {
//     'set-cookie': [{ Name: 'Anurag Pandey' }],
// });
// mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
//                 'set-cookie': [{ Name: 'Anurag Pandey' }],
//             });
// })

  describe('Add Theme Context', () => {
            it('should successfully add theme context ', async () => {
                console.log("inside adding context")
                login()
                const program = await bootstrap();
                await program.parseAsync([
                    'node',
                    './bin/fdk.js',
                    'theme',
                    'context',
                    '-t',
                    'eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMDVUMTE6MzQ6NDIuMDU1WiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0==',
                    '-n',
                    'fyndx0'
                ]);
                // expect(cookies.Name).toMatch("Anurag Pandey");
                // expect(true).toBeTruthy();
                console.log('after expect');
            });
        });

describe('show Theme Context list', () => {
    it('should successfully show theme context list', async () => {
        login();
        const program = await bootstrap();
        await program.parseAsync(['node', './bin/fdk.js', 'theme', 'context-list']);

        // expect(cookies.Name).toMatch("Anurag Pandey");
        // expect(true).toBeTruthy();
        console.log('after expect');
    });
});
