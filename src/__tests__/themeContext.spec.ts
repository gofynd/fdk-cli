import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction from './helper';
import { setEnv } from './helper';
const appConfig = require('./fixtures/appConfig.json');
const tokenData = require('./fixtures/partnertoken.json');
const appList = require('./fixtures/applicationList.json');
const themeList = require('./fixtures/themeList.json');
const translatedData = require("./fixtures/translation.json")

const organizationData = require('./fixtures/organizationData.json');
import { getActiveContext } from '../helper/utils';
import fs from 'fs-extra';
import path from 'path';
import { init } from '../fdk';
import rimraf from 'rimraf';
import { readFile } from '../helper/file.utils';
import CommandError from '../lib/CommandError';
import { startServer, getApp } from '../lib/Auth';
const request = require('supertest');
import {
    getRandomFreePort
} from '../helper/extension_utils';

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './themeCtx-test-cli.json',
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

export async function login() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
    const port =  await getRandomFreePort([]);
    const app = await startServer(port);
    const req = request(app);
    await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', 'api.fyndx1.de']);
    return await req.post('/token').send(tokenData);
}

afterAll(() => {
    rimraf.sync('./themeCtx-test-cli.json');
    let filePath = path.join(process.cwd(), '.fdk', 'context.json');
    try {
        rimraf.sync(filePath);
    } catch (err) {
        console.error(`Error while deleting ${filePath}.`);
    }
});

describe('Theme Context Commands', () => {
    beforeAll(async () => {
        setEnv();
        program = await init('fdk');
        const mock = new MockAdapter(axios);

        configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id)

        mock.onGet('https://api.fyndx1.de/service/application/content/_healthz').reply(200);

        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, appConfig);

        mock.onGet(`${URLS.GET_DEVELOPMENT_ACCOUNTS(1, 9999)}`).reply(200, {
            items: [
                {
                    company: {
                        uid: 1,
                        name: 'cli-test',
                    },
                    company_name: 'cli-test',
                },
            ],
        });
        mock.onGet(
            `${URLS.GET_LOCALES(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, translatedData);

        mock.onGet(`${URLS.GET_LIVE_ACCOUNTS(1, 9999)}`).reply(200, {
            items: [
                {
                    company: {
                        uid: 1,
                        name: 'cli-test',
                    },
                    company_name: 'cli-test',
                },
            ],
        });

        mock.onGet(`${URLS.GET_APPLICATION_LIST(appConfig.company_id)}`).reply(
            200,
            appList,
        );

        mock.onGet(
            `${URLS.GET_ALL_THEME(
                appConfig.company_id,
                appConfig.application_id,
            )}`,
        ).reply(200, themeList.items);

        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id,
            )}`,
        ).reply(200, appConfig);

        mock.onGet(`${URLS.GET_ORGANIZATION_DETAILS()}`).reply(200, organizationData);
        configStore.delete(CONFIG_KEYS.ORGANIZATION)
    });

    it('should successfully add theme context ', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({
            showCreateFolder: 'Yes',
            accountType: 'development',
            selectedCompany: 'cli-test',
            selectedApplication: 'anurag',
            selectedTheme: 'Namaste',
        });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'context',
            '-n',
            'fyndx1',
        ]);
        let context: any = readFile(
            path.join(process.cwd(), '.fdk', 'context.json'),
        );
        try {
            context = JSON.parse(context);
        } catch (e) {
            throw new CommandError(`Invalid config.json`);
        }
        expect(context.theme.contexts.fyndx1.application_id).toMatch(
            '622894659baaca3be88c9d65',
        );
    });

    it('should successfully show theme context list', async () => {
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ listContext: 'fyndx1' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'context-list',
        ]);
        const contextPath = path.join(process.cwd(), '.fdk', 'context.json');
        let contextJSON = await fs.readJSON(contextPath);
        let contextObj = contextJSON.theme.active_context;
        expect(contextObj).toMatch('fyndx1');
    });

    it('should successsfully show active context', async () => {
        let context = getActiveContext();
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'active-context',
        ]);
        expect(context.name).toMatch('fyndx1');
    });
});
