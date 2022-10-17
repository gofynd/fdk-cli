import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { URLS } from '../lib/api/services/url';
import mockFunction from './helper';
import { generateToken, setEnv } from './helper';
const { contextToken } = require('./constants');
const appConfig = require('./fixtures/appConfig.json');
const oauthData = require('./fixtures/oauthData.json');
const data = require('./fixtures/email-login.json');
import configStore from '../lib/Config';
import { decodeBase64, getActiveContext } from '../helper/utils';
import fs from 'fs-extra';
import path from 'path';
import { init } from '../fdk';
import rimraf from 'rimraf';
import { readFile } from '../helper/file.utils';
import CommandError from '../lib/CommandError';

jest.mock('inquirer');
let program;

let configObj = JSON.parse(decodeBase64(`${contextToken}`));
let addContextToken = generateToken(configObj);

afterAll(() => {
    configStore.clear();
    let filePath = path.join(process.cwd(), '.fdk', 'context.json');
    try {
        rimraf.sync(filePath);
    } catch (err) {
        console.error(`Error while deleting ${filePath}.`);
    }
});
async function login() {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ password: '1234567' });
    await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '-e', 'anything@something.com']);
}

describe('Theme Context Commands', () => {
    beforeAll(async () => {
        setEnv();
        program = await init('fdk');
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'some one' }],
        });
        mock.onGet(`${URLS.OAUTH_TOKEN(appConfig.company_id)}`).reply(200, oauthData);
        mock.onGet(
            `${URLS.GET_APPLICATION_DETAILS(appConfig.application_id, appConfig.company_id)}`
        ).reply(200, appConfig);
        mock.onGet(
            `${URLS.THEME_BY_ID(
                appConfig.application_id,
                appConfig.company_id,
                appConfig.theme_id
            )}`
        ).reply(200, appConfig);
    });

    it('should successfully add theme context ', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ showCreateFolder: 'Yes' });
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'theme',
            'context',
            '-t',
            `${addContextToken}`,
            '-n',
            'fyndx0',
        ]);
        let context: any = readFile(path.join(process.cwd(), '.fdk', 'context.json'));
        try {
            context = JSON.parse(context);
        } catch (e) {
            throw new CommandError(`Invalid config.json`);
        }
        expect(configObj.application_id).toMatch(context.theme.contexts.fyndx0.application_id);
    });

    it('should successfully show theme context list', async () => {
        await login();
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ listContext: 'fyndx0' });
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'context-list']);
        const contextPath = path.join(process.cwd(), '.fdk', 'context.json');
        let contextJSON = await fs.readJSON(contextPath);
        let contextObj = contextJSON.theme.active_context;
        expect(contextObj).toMatch('fyndx0');
    });

    it('should successsfully show active context', async () => {
        await login();
        let context =  getActiveContext()
        await program.parseAsync(['ts-node', './src/fdk.ts', 'theme', 'active-context']);
        expect(context.name).toMatch('fyndx0');
    })
});
