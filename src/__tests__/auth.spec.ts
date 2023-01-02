import axios from 'axios';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper';
import { setEnv } from './helper';
import { init } from '../fdk';
const data = require('./fixtures/email-login.json');
const mobileData = require('./fixtures/mobile-login.json');

jest.mock('inquirer');
let program;

describe('Auth Commands', () => {
    beforeAll(async () => {
        setEnv();
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.SEND_OTP()}`).reply(200, mobileData);
        mock.onPost(`${URLS.VERIFY_OTP()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Any One' }],
        });
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Any One' }],
        });
    });

    afterAll(() => {
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
            'anything@something.com',
        ]);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Any One');
    });

    it('should successfully login user with mobile', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ otp: '123456' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '-m', '1234567890']);
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        expect(cookies.Name).toMatch('Any One');
    });

    it('should console active user', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
            '-e',
            'anything@something.com',
        ]);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'user']);
        const currentUser = configStore.get(CONFIG_KEYS.USER);
        expect(currentUser.emails[0][0]).toMatch(data.user.emails[0][0]);
    });
    it('should successfully logout user', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'login',
            '-e',
            'anything@something.com',
        ]);
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'logout']);
        const storeSize = configStore.size;
        expect(storeSize).toBe(0);
    });
});
