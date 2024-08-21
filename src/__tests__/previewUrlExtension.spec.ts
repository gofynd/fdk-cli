import axios from 'axios';
import { withoutErrorResponseInterceptorAxios } from '../lib/api/ApiClient';
import rimraf from 'rimraf';
import path from 'path'
import MockAdapter from 'axios-mock-adapter';
import { init } from '../fdk';
import { CommanderStatic } from 'commander';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import Logger from '../lib/Logger';
import fs from 'fs';
import * as CONSTANTS from './../helper/constants'

// fixtures
const TOKEN = 'mocktoken';
const EXTENSION_NAME = 'mockextensionname'
const EXTENSION_KEY = 'mockextensionapikey';
const EXTENSION_SECRET = 'mockextensionsecret';
const ORGANIZATION_ID = 'mockorganizationid';
const CLOUDFLARED_TEST_URL =
    'https://das-multiple-licensed-eminem.trycloudflare.com';
const COMPANY_ID = '1';
const LOGIN_AUTH_TOKEN = 'loginauthtoken';

const EXPECTED_PREVIEW_URL =
    'https://platform.fynd.com/company/1/extensions/mockextensionapikey';
const fdkExtConfigFrontEnd = require('./fixtures/fdkExtConfigFrontEnd.json');
const fdkExtConfigBackEnd = require('./fixtures/fdkExtConfigBackEnd.json')

let program: CommanderStatic;
let winstonLoggerSpy: jest.SpyInstance<any>;

jest.mock('./../helper/formatter', () => {
    const originalFormatter = jest.requireActual('../helper/formatter');
    originalFormatter.successBox = originalFormatter.warningBox = originalFormatter.errorBox = ({ text }) => {
        return text;
    };
    originalFormatter.displayStickyText = (text: string, logger = console.log) => {
        logger(text);
    };
    return originalFormatter;
});

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
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

jest.mock('cloudflared', () => ({
    tunnel: jest.fn().mockImplementation(() => ({
      url: Promise.resolve(CLOUDFLARED_TEST_URL),
      connections: [],
      child: {
        stdout: {
          on: jest.fn(),
          pipe: jest.fn(),
        },
        stderr: {
          on: jest.fn(),
          pipe: jest.fn(),
        },
      },
      stop: jest.fn(),
    })),
    bin: () => {},
    install: () => {}
  }));
  
  
  jest.mock('execa', () => {
    const originalExeca = jest.requireActual('execa');
    originalExeca.command = jest.fn().mockImplementation((command, options) => {
        console.log("Running command ", command);
        console.log("Passed Options ", options);

        return {
          stdout: { pipe: jest.fn() },
          stderr: { pipe: jest.fn() },
          on: jest.fn((event, handler) => {
            if (event === 'exit') {
              handler(0);
            }
          }),
        };
    });
    
    return originalExeca;
})


let mockAxios;
let mockCustomAxios;
describe('Extension preview-url command', () => {
    beforeAll(async () => {
        rimraf.sync('fdk.ext.config.json');
        rimraf.sync(path.join('frontend','fdk.ext.config.json'));
        rimraf.sync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME);
    });

    beforeEach(async () => {
        // initializing commander program
        program = await init('fdk');

        // mock console.log
        winstonLoggerSpy = jest.spyOn(Logger, 'info');

        // mock axios
        mockAxios = new MockAdapter(axios);
        mockCustomAxios = new MockAdapter(withoutErrorResponseInterceptorAxios);
        mockAxios
            .onPost(`${URLS.VALIDATE_ACCESS_TOKEN()}`)
            .reply(200, { id: ORGANIZATION_ID });

        mockAxios
            .onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`)
            .reply(200, {
                items: [{ company: { uid: COMPANY_ID, name: 'cli-test' } }],
            });
        
        mockAxios
            .onGet(`${URLS.GET_EXTENSION_LIST(1, 9999)}`)
            .reply(200, {
                name: EXTENSION_NAME,
                _id: EXTENSION_KEY,
                client_data: {
                    secret: [EXTENSION_SECRET]
                }
            });

        mockAxios
            .onGet(URLS.GET_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY))
            .reply(200, {
                client_data: {
                    secret: [EXTENSION_SECRET]
                }
            })

        mockCustomAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`)
            .reply(200, {});
        mockAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS(EXTENSION_KEY)}`)
            .reply(200, {});

        fs.writeFileSync('fdk.ext.config.json', JSON.stringify(fdkExtConfigBackEnd, null, 4));
        fs.mkdirSync('frontend', {
            recursive: true
        });
        fs.writeFileSync(path.join('frontend', 'fdk.ext.config.json'), JSON.stringify(fdkExtConfigFrontEnd, null, 4));
        
    });

    afterEach(async () => {
        // remove test config store
        rimraf.sync('previewUrl-test-cli.json');

        rimraf.sync('fdk.ext.config.json');
        rimraf.sync(path.join('frontend','fdk.ext.config.json'));
        rimraf.sync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME);

        winstonLoggerSpy.mockRestore();
    });

    it('should successfully return preview url without any prompt', async () => {
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, TOKEN);

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'preview-url',
            '--api-key',
            EXTENSION_KEY,
            '--company-id',
            COMPANY_ID
        ]);

        const extensionContext = JSON.parse(fs.readFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME).toString());
        const baseUrl = extensionContext[CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL];
        expect(baseUrl).toContain(CLOUDFLARED_TEST_URL);
        
        expect(winstonLoggerSpy.mock.lastCall[0]).toContain(
            EXPECTED_PREVIEW_URL,
        );  
    });

    it('Should throw an error for partner access token for lower versions than v1.9.2 to update base url of extension', async () => {
        mockAxios
            .onPatch(`${URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(EXTENSION_KEY)}`)
            .reply(404, { message: 'not found' });
        configStore.set(CONFIG_KEYS.AUTH_TOKEN, LOGIN_AUTH_TOKEN);

        try {
            jest.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error(
                    'Please provide partner access token eg --access-token partnerAccessToken',
                );
            });
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'preview-url',
                '--api-key',
                EXTENSION_KEY,
                '--company-id',
                COMPANY_ID
            ]);
        } catch (err) {
            expect(err.message).toBe(
                'Please provide partner access token eg --access-token partnerAccessToken',
            );
        }
    });
});
