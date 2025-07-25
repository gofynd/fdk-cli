

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
import ExtensionService, {
    RegisterExtensionPayloadNew,
} from '../lib/api/services/extension.service';
import path from 'path';
import { LAUNCH_TYPES } from '../helper/constants';
import { getCommonHeaderOptions } from '../lib/api/services/utils';

const EXTENSION_KEY = '68808232d7924019689a768c';
const EXTENSION_SECRET = 'mockextensionsecret';
const COMPANY_ID = '1';
const EXTENSION_NAME = 'mockextensionname';
const ORGANIZATION_ID = '60afe92972b7a964de57a1d4';
const fdkExtConfigFrontEnd = require('./fixtures/fdkExtConfigFrontEnd.json');
const fdkExtConfigBackEnd = require('./fixtures/fdkExtConfigBackEnd.json');
const partnertoken = require('./fixtures/partnertoken.json');
const extensionList = require('./fixtures/extensions.json');
const applicationZip = fs.readFileSync(require.resolve('./fixtures/example-extension-javascript-main.zip'));
const paymentZip = fs.readFileSync(require.resolve('./fixtures/payment-extension-boilerplate-main.zip'));
jest.mock('inquirer');

let program;
let mockAxios;

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

function extensionSavingData({name, type, launch_type, payment_mode_slug}){
    let data: RegisterExtensionPayloadNew = {
        name: name,
        base_url: 'http://localdev.fynd.com',
        // We are just passing this url as temporary when preview url is called it gets updated with the tunnel url
        extention_type: type.toLowerCase(),
        // Adding this for backward compatibility for v1.8.X
        callbacks: {
            setup: `http://localdev.fynd.com/fp/setup`,
            install: `http://localdev.fynd.com/fp/install`,
            auth: `http://localdev.fynd.com/fp/auth`,
            uninstall: `http://localdev.fynd.com/fp/uninstall`,
            auto_install: `http://localdev.fynd.com/fp/auto_install`,
        },
        launch_type: launch_type.toLowerCase(),
        scope :['company/profile'],
        logo : {
            small: 'https://res.cloudinary.com/dwzm9bysq/image/upload/v1566539375/production/media/store/logo/jwosxsgh9ufoucdxpm10.png',
            large: 'https://res.cloudinary.com/dwzm9bysq/image/upload/v1566539375/production/media/store/logo/jwosxsgh9ufoucdxpm10.png',
        },
       
    };

    if (launch_type !== LAUNCH_TYPES.PAYMENT && payment_mode_slug) {
        data.config = {
            payment_mode_slug: payment_mode_slug
        }
    }
    return data;
}

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
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

fdescribe('Extension Commands', () => {
    const commonHeaders = getCommonHeaderOptions()
    beforeAll(async () => {
        setEnv();
        process.chdir(path.join(__dirname, '..', '..'));
        program = await init('fdk');
        jest.spyOn(ExtensionService, 'getExtensionList').mockImplementation(async () => extensionList);
        cleanUp()
        configStore.set(CONFIG_KEYS.ORGANIZATION, ORGANIZATION_ID)
    });
    beforeEach(async () => {
        mockAxios = new MockAdapter(axios);
        // Mock payment extension template download
        mockAxios.onGet('https://github.com/gofynd/payment-extension-boilerplate/archive/refs/heads/main.zip')
            .reply(() => [200, paymentZip]);
        // Mock company/application extension template download
        mockAxios.onGet('https://github.com/gofynd/example-extension-javascript/archive/refs/heads/main.zip')
            .reply(() => [200, applicationZip]);
        mockAxios.onGet(`${URLS.GET_EXTENSION_LIST(1, 9999)}`).reply(200, extensionList);
        mockAxios.onGet(URLS.GET_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)).reply(200, {
            extention_type: 'private',
            launch_type: 'company',
            extension: { id: EXTENSION_KEY, name: EXTENSION_NAME },
            client_data: { secret: [EXTENSION_SECRET] },
            config: {}
        });
        mockAxios.onPost(URLS.REGISTER_EXTENSION_PARTNER()).reply(200, {
            client_id: EXTENSION_KEY,
            secret: [EXTENSION_SECRET],
            base_url: 'http://localdev.fynd.com',
        });
        mockAxios.onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`).reply(200, {
            items: [{ company: { uid: COMPANY_ID, name: 'cli-test' } }],
        });
        mockAxios.onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`).reply(200, {});
        mockAxios.onPatch(`${URLS.UPDATE_EXTENSION_DETAILS(EXTENSION_KEY)}`).reply(200, {});
        await mockAxios.onPost(URLS.REGISTER_EXTENSION_PARTNER(), undefined, {
            headers: commonHeaders
        }   ).reply(200, {
            client_id: 'test-client-id',
            secret: [EXTENSION_SECRET],
            base_url: 'http://localdev.fynd.com',
        });


        configStore.set(CONFIG_KEYS.AUTH_TOKEN, partnertoken.auth_token);
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, partnertoken.auth_token.access_token);
        configStore.set(CONFIG_KEYS.ORGANIZATION, partnertoken.organization);
        fs.writeFileSync('fdk.ext.config.json', JSON.stringify(fdkExtConfigBackEnd, null, 4));
        fs.mkdirSync('frontend', { recursive: true });
        fs.writeFileSync('frontend/fdk.ext.config.json', JSON.stringify(fdkExtConfigFrontEnd, null, 4));
    });
    afterEach(() => {
        cleanUp()
    });

    afterAll(async () => {
        process.chdir(path.join(__dirname, '..', '..'));
    });

    it('should create a company extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ action: CONSTANTS.INIT_ACTIONS.create_extension })
            .mockResolvedValueOnce({ name: 'company-ext' })
            .mockResolvedValueOnce({ type: 'private', launch_type: 'company' })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'extension', 'init']);
        expect(fs.existsSync('company-ext')).toBe(true);
    });

    it('should create an application extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ action: CONSTANTS.INIT_ACTIONS.create_extension })
            .mockResolvedValueOnce({ name: 'app-ext' })
            .mockResolvedValueOnce({ type: 'private', launch_type: 'application' })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'extension', 'init']);
        expect(fs.existsSync('app-ext')).toBe(true);
    });

    it('should create a payment extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ action: CONSTANTS.INIT_ACTIONS.create_extension })
            .mockResolvedValueOnce({ name: 'payment-ext' })
            .mockResolvedValueOnce({ type: 'Private', launch_type: 'Payment' })
            .mockResolvedValueOnce({ payment_mode_slug: 'upi' })
            .mockResolvedValueOnce({ project_type: 'Node + React.js + SQLite(Payment)' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'extension', 'init']);
        expect(fs.existsSync('payment-ext')).toBe(true);
    });

    it('should select an existing extension', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock
            .mockResolvedValueOnce({ action: CONSTANTS.INIT_ACTIONS.select_extension })
            .mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ project_type: 'Node + Vue 3 + SQLite' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'extension', 'init']);
        expect(fs.existsSync(extensionList.items[0].name)).toBe(true);
    });


    it('should run preview command', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ is_user_tunnel_url: 'No' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '--api-key', EXTENSION_KEY,
            '--company-id', COMPANY_ID,
            '--tunnel-url', 'https://custom-tunnel-url.com',
            '--port', '8080'
        ]);
        const extensionContext = JSON.parse(fs.readFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME).toString());
        expect(extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL]).toContain('https://custom-tunnel-url.com');
    });

    it('should get launch url', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({ extension: extensionList.items[0] });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'get',
            '--api-key', EXTENSION_KEY
        ]);
        // No error means success
    });

    it('should set launch url', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ url: 'https://launch-url.com' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'set',
            '--api-key', EXTENSION_KEY,
            '--url', 'https://launch-url.com'
        ]);
        // No error means success
    });

    it('should pull extension env', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({ extension: extensionList.items[0] });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'pull-env'
        ]);
        // No error means success
    });

    it('should handle invalid template error', async () => {
        await expect(program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'init',
            '--template', 'invalid-template'
        ])).rejects.toThrow('Invalid template passed');
    });

    it('should handle missing port error in preview', async () => {
        await expect(program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '--api-key', EXTENSION_KEY,
            '--company-id', COMPANY_ID,
            '--tunnel-url', 'https://custom-tunnel-url.com'
        ])).rejects.toThrow();
    });

    it('should handle invalid port error in preview', async () => {
        await expect(program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '--api-key', EXTENSION_KEY,
            '--company-id', COMPANY_ID,
            '--tunnel-url', 'https://custom-tunnel-url.com',
            '--port', '99999'
        ])).rejects.toThrow();
    });

    it('should handle API error in launch-url set', async () => {
        mockAxios.onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`).reply(500, { message: 'API error' });
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValueOnce({ extension: extensionList.items[0] })
            .mockResolvedValueOnce({ url: 'https://launch-url.com' });
        await expect(program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'launch-url',
            'set',
            '--api-key', EXTENSION_KEY,
            '--url', 'https://launch-url.com'
        ])).rejects.toThrow('API error');
    });
});

