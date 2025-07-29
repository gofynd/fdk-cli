import axios from 'axios';
import inquirer from 'inquirer';
import { init } from '../fdk';
import fs from 'fs';
import rimraf from 'rimraf';

import configStore, { CONFIG_KEYS } from '../lib/Config';
import MockAdapter from 'axios-mock-adapter';
import { URLS } from '../lib/api/services/url';
import * as CONSTANTS from './../helper/constants';
import mockFunction, { setEnv } from './helper';
import ExtensionService from '../lib/api/services/extension.service';
import path from 'path';
import { getCommonHeaderOptions } from '../lib/api/services/utils';
import { withoutErrorResponseInterceptorAxios } from '../lib/api/ApiClient';

const EXTENSION_KEY = '68808232d7924019689a768c';
const EXTENSION_SECRET = 'mockextensionsecret';
const COMPANY_ID = '1';
const EXTENSION_NAME = 'mockextensionname';
const ORGANIZATION_ID = '60afe92972b7a964de57a1d4';
const fdkExtConfigFrontEnd = require('./fixtures/fdkExtConfigFrontEnd.json');
const fdkExtConfigBackEnd = require('./fixtures/fdkExtConfigBackEnd.json');
const partnertoken = require('./fixtures/partnertoken.json');
const extensionList = require('./fixtures/extensions.json');
const applicationZip = fs.readFileSync(
    require.resolve('./fixtures/example-extension-javascript-main.zip'),
);
const paymentZip = fs.readFileSync(
    require.resolve('./fixtures/payment-extension-boilerplate-main.zip'),
);
jest.mock('inquirer');

let program;
let mockAxios;
let mockWithoutErrorAxios;

// Ensure proper cleanup of axios instances
beforeAll(() => {
    // Reset axios defaults to prevent issues
    axios.defaults.maxRedirects = 0;
    axios.defaults.timeout = 5000;
});

function cleanUp() {
    rimraf.sync('company-ext');
    rimraf.sync(extensionList.items[0].name);
    rimraf.sync('app-ext');
    rimraf.sync('payment-ext');
    rimraf.sync('fdk.ext.config.json');
    rimraf.sync('frontend/fdk.ext.config.json');
    rimraf.sync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME);
    rimraf.sync('setup_extension-test-cli.json');
}

jest.mock('configstore', () => {
    const Store = jest.requireActual('configstore');
    const path = jest.requireActual<typeof import('path')>('path');
    return class MockConfigstore {
        store = new Store('@gofynd/fdk-cli', undefined, {
            configPath: path.join(__dirname, 'theme-test-cli.json'),
        });
        all = this.store.all;
        size = this.store.size;
        path = this.store.path;
        get(key: string) {
            return this.store.get(key);
        }
        set(key: string, value: any) {
            this.store.set(key, value);
        }
        delete(key: string) {
            this.store.delete(key);
        }
        clear() {
            this.store.clear();
        }
        has(key: string) {
            return this.store.has(key);
        }
    };
});

describe('Extension Commands', () => {
    const commonHeaders = getCommonHeaderOptions().headers;
    beforeAll(async () => {
        setEnv();
        process.chdir(path.join(__dirname, '..', '..'));
        program = await init('fdk');
        jest.spyOn(ExtensionService, 'getExtensionList').mockImplementation(
            async () => extensionList,
        );
        cleanUp();
        configStore.set(CONFIG_KEYS.ORGANIZATION, ORGANIZATION_ID);
    });
    beforeEach(async () => {
        mockAxios = new MockAdapter(axios);
        mockWithoutErrorAxios = new MockAdapter(
            withoutErrorResponseInterceptorAxios,
        );

        // Mock payment extension template download
        await mockAxios
            .onGet(
                'https://github.com/gofynd/payment-extension-boilerplate/archive/refs/heads/main.zip',
            )
            .reply(() => [200, paymentZip]);
        // Mock company/application extension template download
        await mockAxios
            .onGet(
                'https://github.com/gofynd/example-extension-javascript/archive/refs/heads/main.zip',
            )
            .reply(() => [200, applicationZip]);
        await mockAxios
            .onGet(`${URLS.GET_EXTENSION_LIST(1, 9999)}`)
            .reply(200, extensionList);
        await mockAxios
            .onGet(URLS.GET_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY))
            .reply(200, {
                extention_type: 'private',
                launch_type: 'company',
                extension: { id: EXTENSION_KEY, name: EXTENSION_NAME },
                client_data: { secret: [EXTENSION_SECRET] },
                config: {},
            });
        await mockAxios.onPost(URLS.REGISTER_EXTENSION_PARTNER()).reply(200, {
            client_id: EXTENSION_KEY,
            secret: [EXTENSION_SECRET],
            base_url: 'http://localdev.fynd.com',
        });
        await mockAxios
            .onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`)
            .reply(200, {
                items: [{ company: { uid: COMPANY_ID, name: 'cli-test' } }],
            });
        // mockAxios.onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`).reply(200, {});
        await mockAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS(EXTENSION_KEY)}`)
            .reply(200, {});
        await mockAxios
            .onPost(URLS.REGISTER_EXTENSION_PARTNER(), undefined, {
                headers: commonHeaders,
            })
            .reply(200, {
                client_id: 'test-client-id',
                secret: [EXTENSION_SECRET],
                base_url: 'http://localdev.fynd.com',
            });

        // Mock the updateLaunchURLPartners API call using the correct axios instance
        await mockWithoutErrorAxios
            .onPatch(URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY))
            .reply((config) => {
                if (config.data) {
                    const payload = JSON.parse(config.data);
                    // Validate that it has the expected structure for UpdateLaunchURLPayload
                    expect(payload).toHaveProperty('base_url');
                    expect(typeof payload.base_url).toBe('string');
                }

                // Return success response
                return [
                    200,
                    {
                        success: true,
                        message: 'Launch URL updated successfully',
                    },
                ];
            });

        configStore.set(CONFIG_KEYS.AUTH_TOKEN, partnertoken.auth_token);
        configStore.set(
            CONFIG_KEYS.PARTNER_ACCESS_TOKEN,
            partnertoken.auth_token.access_token,
        );
        configStore.set(CONFIG_KEYS.ORGANIZATION, partnertoken.organization);
        fs.writeFileSync(
            'fdk.ext.config.json',
            JSON.stringify(fdkExtConfigBackEnd, null, 4),
        );
        fs.mkdirSync('frontend', { recursive: true });
        fs.writeFileSync(
            'frontend/fdk.ext.config.json',
            JSON.stringify(fdkExtConfigFrontEnd, null, 4),
        );
        
    });
    afterEach(async () => {
        cleanUp();
        // Clean up any remaining spinners to prevent Jest open handles
        if (mockAxios) {
            mockAxios.restore();
        }
        if (mockWithoutErrorAxios) {
            mockWithoutErrorAxios.restore();
        }
        // Wait for any pending promises to resolve
        await new Promise((resolve) => setImmediate(resolve));
        // Force cleanup of any remaining timers or intervals
        jest.clearAllTimers();
    });

    afterAll(async () => {
        process.chdir(path.join(__dirname, '..', '..'));
        // Ensure all mocks are restored
        if (mockAxios) {
            mockAxios.restore();
        }
        if (mockWithoutErrorAxios) {
            mockWithoutErrorAxios.restore();
        }
        // Wait for any pending promises to resolve
        await new Promise((resolve) => setImmediate(resolve));
        // Clear any remaining axios interceptors
        axios.interceptors.request.clear();
        axios.interceptors.response.clear();

        // Force cleanup of any remaining timers or intervals
        jest.clearAllTimers();
    });

    it('should create a company extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({
                action: CONSTANTS.INIT_ACTIONS.create_extension,
            })
            .mockResolvedValueOnce({ name: 'company-ext' })
            .mockResolvedValueOnce({ type: 'private', launch_type: 'company' })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'init',
        ]);
        expect(fs.existsSync('company-ext')).toBe(true);
    });

    it('should create an application extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({
                action: CONSTANTS.INIT_ACTIONS.create_extension,
            })
            .mockResolvedValueOnce({ name: 'app-ext' })
            .mockResolvedValueOnce({
                type: 'private',
                launch_type: 'application',
            })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'init',
        ]);
        expect(fs.existsSync('app-ext')).toBe(true);
    });

    it('should create a payment extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({
                action: CONSTANTS.INIT_ACTIONS.create_extension,
            })
            .mockResolvedValueOnce({ name: 'payment-ext' })
            .mockResolvedValueOnce({ type: 'Private', launch_type: 'Payment' })
            .mockResolvedValueOnce({ payment_mode_slug: 'upi' })
            .mockResolvedValueOnce({
                project_type: 'Node + React.js + SQLite(Payment)',
            });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'init',
        ]);
        expect(fs.existsSync('payment-ext')).toBe(true);
    });

    it('should select an existing extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({
                action: CONSTANTS.INIT_ACTIONS.select_extension,
            })
            .mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'init',
        ]);
        expect(fs.existsSync(extensionList.items[0].name)).toBe(true);
    });

    it('should get launch url', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({
            extension: extensionList.items[0],
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'get',
            '--api-key',
            EXTENSION_KEY,
        ]);
        // No error means success
    });

    it('should set launch url', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ url: 'https://launch-url.com' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'set',
            '--api-key',
            EXTENSION_KEY,
            '--url',
            'https://launch-url.com',
        ]);
        // No error means success
    });

    it('should pull extension env', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({
            extension: extensionList.items[0],
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'pull-env',
        ]);
        // No error means success
    });

    it('should handle valid port in preview', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
            '--tunnel-url',
            'https://custom-tunnel-url.com',
            '--port',
            '3000'
        ]);
        // No error means success
    });

    it('should set launch url successfully', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ url: 'https://launch-url.com' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'set',
            '--api-key',
            EXTENSION_KEY,
            '--url',
            'https://launch-url.com',
        ]);
        // No error means success
    });

    it('should run preview command', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ is_user_tunnel_url: 'No' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview',
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID,
            '--tunnel-url',
            'https://custom-tunnel-url.com',
            '--port',
            '8080',
        ]);
        const extensionContext = JSON.parse(
            fs.readFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME).toString(),
        );
        expect(
            extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL],
        ).toContain('https://custom-tunnel-url.com');
    });
});
