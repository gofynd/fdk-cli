import ngrok from 'ngrok';
import axios from 'axios';
import { withoutErrorResponseInterceptorAxios } from '../lib/api/ApiClient';
import rimraf from 'rimraf';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';

import { init } from '../fdk';
import { CommanderStatic } from 'commander';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';

// fixtures
const TOKEN = 'mocktoken';
const EXTENSION_KEY = 'mockextensionapikey';
const ORGANIZATION_ID = 'mockorganizationid';
const NGROK_TEST_URL = 'https://test_url.ngrok.io';
const COMPANY_ID = '1';
const PORT = '3000';
const COOKIE = 'mockcookies';
const AUTH_TOKEN = 'mockngrokauthtoken';
const LOGIN_AUTH_TOKEN = 'loginauthtoken';

const EXPECTED_PREVIEW_URL =
    'https://platform.fynd.com/company/1/extensions/mockextensionapikey';
const EXPECTED_NGROK_URL = 'https://test_url.ngrok.io';

let program: CommanderStatic;
let logSpy: jest.SpyInstance<any>;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual<typeof import('configstore')>('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './previewUrl-test-cli.json',
        });
        all = this.store.all;
        get(key: string) {
            return this.store.get(key);
        }
        set(key: string, value) {
            this.store.set(key, value);
        }
        delete(key) {
            this.store.delete(key);
        }
    };
});

let mockAxios;
let mockCustomAxios;
describe('Extension preview-url command', () => {
    beforeAll(async () => {});

    afterAll(async () => {
        // restore console log mock so it does not affect other test cases
        logSpy.mockRestore();
    });

    beforeEach(async () => {
        // initializing commander program
        program = await init('fdk');

        // mock console.log
        logSpy = jest.spyOn(global.console, 'log');
        jest.spyOn(ngrok, 'connect').mockResolvedValue(NGROK_TEST_URL);

        // mock axios
        mockAxios = new MockAdapter(axios);
        mockCustomAxios = new MockAdapter(withoutErrorResponseInterceptorAxios);
        mockAxios
            .onGet(`${URLS.GET_ORGANIZATION_DATA(TOKEN)}`)
            .reply(200, { id: ORGANIZATION_ID });

        mockAxios
            .onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`)
            .reply(200, {
                items: [{ company: { uid: COMPANY_ID, name: 'cli-test' } }],
            });

        mockCustomAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`)
            .reply(200, {});
        mockAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS(EXTENSION_KEY)}`)
            .reply(200, {});
    });

    afterEach(async () => {
        // remove test config store
        rimraf.sync('./previewUrl-test-cli.json');
    });

    it('should throw port error', async () => {
        configStore.set(CONFIG_KEYS.COOKIE, COOKIE);
        let errSpy = jest.spyOn(process.stderr, 'write');
        try {
            jest.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error('--port required');
            });

            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'preview-url',
            ]);
        } catch (error) {
            expect(error.message).toBe('--port required');
        }
        expect(errSpy.mock.lastCall[0]).toContain(
            "error: required option '-p, --port <port>' not specified\n",
        );
    });

    it('should successfully return preview url', async () => {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);

        const promptSpy = jest
            .spyOn(inquirer, 'prompt')
            .mockResolvedValueOnce({ company_id: COMPANY_ID })
            .mockResolvedValueOnce({ extension_api_key: EXTENSION_KEY })
            .mockResolvedValueOnce({ ngrok_authtoken: AUTH_TOKEN });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
        ]);

        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_NGROK_URL);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_PREVIEW_URL);
        expect(promptSpy).toBeCalledTimes(3);
    });

    it('should successfully return preview url without any prompt', async () => {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, TOKEN);

        jest.spyOn(inquirer, 'prompt');

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
        ]);

        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_NGROK_URL);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_PREVIEW_URL);
    });

    it('should prompt for ngrok url and return preview url', async () => {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, TOKEN);

        jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
            ngrok_authtoken: 'auth_token',
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
        ]);

        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_NGROK_URL);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_PREVIEW_URL);
        expect(configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN)).toBe('auth_token');
    });

    it("should prompt ngrok url and update it's value on configstore", async () => {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, TOKEN);
        configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, AUTH_TOKEN);

        jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
            ngrok_authtoken: 'auth_token',
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
            '--update-authtoken',
        ]);

        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_NGROK_URL);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_PREVIEW_URL);
        expect(configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN)).toBe('auth_token');
    });

    it('Should succesfully return the preview-url lower versions than v1.9.2 to update base url of extension as we are providing the partner access tokens in parameters', async ()=> {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, AUTH_TOKEN);
        mockCustomAxios
        .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`)
        .reply(404, {});
        jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
            ngrok_authtoken: 'auth_token',
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
            '--update-authtoken',
            '--access-token',
            TOKEN
        ]);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_NGROK_URL);
        expect(logSpy.mock.lastCall[0]).toContain(EXPECTED_PREVIEW_URL);
        expect(configStore.get(CONFIG_KEYS.NGROK_AUTHTOKEN)).toBe('auth_token');
    });

    it('Should throw an error for partner access token for lower versions than v1.9.2 to update base url of extension', async ()=> {
    mockAxios
    .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`)
    .reply(404, {});
    configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
    configStore.set(CONFIG_KEYS.NGROK_AUTHTOKEN, AUTH_TOKEN);
    
    jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
        ngrok_authtoken: 'auth_token',
    });
    try{
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Please provide partner access token eg --access-token partnerAccessToken');
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '-p',
            PORT,
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
            '--update-authtoken',
        ]);
    }
    catch(err){
        expect(err.message).toBe('Please provide partner access token eg --access-token partnerAccessToken');
    }
    });
});
