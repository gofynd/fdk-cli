import rimraf from 'rimraf';
import inquirer from 'inquirer';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper';
import { setEnv } from './helper';
import { init } from '../fdk';
const tokenData = require('./fixtures/partnertoken.json');
const organizationData = require('./fixtures/organizationData.json');
const request = require('supertest');
import { startServer } from '../lib/Auth';
import { URLS } from '../lib/api/services/url';
import Logger from '../lib/Logger';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './auth-test-cli.json',
        });
        all = this.store.all;
        size = this.store.size;
        get(key: string) {
            return this.store.get(key);
        }
        set(key: string, value) {
            this.store.set(key, value);
        }
        delete(key) {
            this.store.delete(key);
        }
        clear() {
            this.store.clear();
        }
    };
});
jest.mock('open', () => {
    return () => {}
})
export async function login(domain?: string) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
    const app = await startServer();
    const req = request(app);
    if(domain)
        await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', domain]);
    else
        await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', '']);
    return await req.post('/token').send(tokenData);
}

describe('Auth Commands', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    })

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    beforeAll(async () => {
        setEnv();
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id);
        mock.onGet('https://api.fynd.com/service/application/content/_healthz').reply(200);
        mock.onGet(`${URLS.GET_ORGANIZATION_DETAILS()}`).reply(
            200,
            organizationData,
        );
        configStore.delete(CONFIG_KEYS.ORGANIZATION);
        await login();
    });

    afterAll(() => {
        rimraf.sync('./auth-test-cli.json');
    });
    it('Should successfully login with partner panel', async () => {
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
            'pr-4fb094006ed3a6d749b69875be0418b83238d078',
        );
    });
    it('Should ask for change organization when user is already logged in', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmChangeOrg: 'Yes' });
        await login();
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
            'pr-4fb094006ed3a6d749b69875be0418b83238d078',
        );
    });
    it('Should exit when user selects no for organization change', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmChangeOrg: 'No' });
        await login();
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
            'pr-4fb094006ed3a6d749b69875be0418b83238d078',
        );
    });
    it('Should successfully login with and env should updated', async () => {
        configStore.delete(CONFIG_KEYS.AUTH_TOKEN);
        await login('api.fynd.com');
        expect(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)).toBe('api.fynd.com');
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
            'pr-4fb094006ed3a6d749b69875be0418b83238d078',
        );
    });
    it('should console active user', async () => {
        let consoleWarnSpy: jest.SpyInstance;
        consoleWarnSpy = jest.spyOn(Logger, 'info').mockImplementation();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'user']);
        const { current_user: user } = configStore.get(CONFIG_KEYS.AUTH_TOKEN);
        expect(consoleWarnSpy.mock.lastCall[0]).toContain('Name: Jinal Virani');
        expect(user.emails[0].email).toMatch('jinalvirani@gofynd.com');
    });
    it('should successfully logout user', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'logout']);
        const storeSize = configStore.size;
        expect(storeSize).toBe(0);
    });
});
