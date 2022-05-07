import axios from 'axios';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper';
import { init } from '../fdk';
const data = require('./fixtures/email-login.json');
const mobileData = require('./fixtures/mobile-login.json');

jest.mock('inquirer');
let program;

describe('Auth Commands', () => {
    beforeEach(async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0']);
        program.commands.forEach(command => {
            command._optionValues = {};
        });
    });
    beforeAll(async () => {
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.SEND_OTP()}`).reply(200, mobileData);
        mock.onPost(`${URLS.VERIFY_OTP()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Anurag Pandey123' }],
        });
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Anurag Pandey' }],
        });
    });

    afterEach(() => {
        configStore.clear();
    });
    it('should successfully login user with email', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ password: '1234567' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Anurag Pandey');
    });

    it('should successfully login user with mobile', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ otp: '123456' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '-m', '7678880802']);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Anurag Pandey123');
    });

    it('should successfully logout user', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'logout']);
        const storeSize = configStore.size;
        expect(storeSize).toBe(0);
    });

    it('should console active user', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'user']);
        const currentUser = configStore.get(CONFIG_KEYS.USER);
        expect(currentUser.emails[0][0]).toMatch(data.user.emails[0][0]);
    });
});
