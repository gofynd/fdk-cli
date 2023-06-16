import rimraf from 'rimraf';
import inquirer from 'inquirer';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper';
import { setEnv } from './helper';
import { init } from '../fdk';
const tokenData = require('./fixtures/partnertoken.json');
const request = require('supertest')
import { startServer, getApp } from '../lib/Auth';
import Logger from '../lib/Logger';

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
    const Store = jest.requireActual<typeof import('configstore')>('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {configPath: './auth-test-cli.json'})
        all = this.store.all
        size = this.store.size
        get(key: string) {
            return this.store.get(key)
        }
        set(key: string, value) {
            this.store.set(key, value);
        }   
        delete(key) {
            this.store.delete(key)
        }
        clear() {
            this.store.clear();
        }
    }
});

async function login() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
    const app = await startServer();
    const req = request(app)
    await program.parseAsync([
        'ts-node',
        './src/fdk.ts',
        'login',
    ]);
    return await req.post('/token').send(tokenData);
}

describe('Auth Commands', () => {
    beforeAll(async () => {
        setEnv();
        program = await init('fdk');
        await login();
    });

    afterAll(() => {
        rimraf.sync('./auth-test-cli.json')
    });
    it('Should successfully login with partner panel', async () => {
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe('pr-4fb094006ed3a6d749b69875be0418b83238d078');
    });
    it('Should ask for change organization when user is already logged in', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmChangeOrg: 'Yes' });
        await login()
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe('pr-4fb094006ed3a6d749b69875be0418b83238d078');
    });
    it('Should exit when user selects no for organization change', async() =>{
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmChangeOrg: 'No' });
        await login()
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe('pr-4fb094006ed3a6d749b69875be0418b83238d078');
    })

    it('should console active user', async () => {
        let consoleWarnSpy: jest.SpyInstance;
        consoleWarnSpy = jest.spyOn(Logger, 'info').mockImplementation();
        await program.parseAsync(['ts-node', './src/fdk.ts', 'user']);
        const { current_user: user } = configStore.get(CONFIG_KEYS.AUTH_TOKEN);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Name: Jinal Virani');
        expect(user.emails[0].email).toMatch("jinalvirani@gofynd.com");
    });
    it('should successfully logout user', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'logout']);
        const storeSize = configStore.size;
        expect(storeSize).toBe(0);
    });
});