import axios from 'axios';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';
import { bootstrap } from '../../bin/fdk';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper'
const data = require('./fixtures/email-login.json');
const mobileData = require('./fixtures/mobile-login.json');

jest.mock('inquirer');

beforeEach(async () => {
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
});
beforeAll(() =>{
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.SEND_OTP()}`).reply(200, mobileData);
    mock.onPost(`${URLS.VERIFY_OTP()}`).reply(200, data, {
        'set-cookie': [{ Name: 'Anurag Pandey' }],
    });
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
                    'set-cookie': [{ Name: 'Anurag Pandey' }],
                });
})

afterEach(() => {
    configStore.clear();
});


describe('login user with email', () => {
    it('should successfully login user with email', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ password: '1234567' });
        const program = await bootstrap();
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Anurag Pandey');
    });
});

describe('login user with mobile', () => {
    it('should successfully login user with mobile', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ otp: '123456' });
        const program = await bootstrap();
        await program.parseAsync(['node', './bin/fdk.js', 'login', '-m', '7678880802']);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Anurag Pandey');

    });
});

describe('logout user', () => {
    it('should successfully logout user', async () => {
        const program = await bootstrap();
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
        await program.parseAsync(['node', './bin/fdk.js', 'logout']);
        const storeSize = configStore.size
        expect(storeSize).toBe(0);
    });
});

describe('active user', () => {
    it('should console active user', async () => {
        const program = await bootstrap();
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        await program.parseAsync(['node', './bin/fdk.js', 'user']);
        const currentUser = configStore.get(CONFIG_KEYS.USER);
        expect(currentUser.emails[0][0]).toMatch(data.user.emails[0][0]);
    });
});
