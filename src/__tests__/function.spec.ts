import { CommanderStatic } from "commander"
import MockAdapter from 'axios-mock-adapter';
import rimraf from 'rimraf';

import { init } from "../fdk";
import { addExtensionContext, cleanFunctionData, loginUser } from "./helper";
import inquirer from 'inquirer';
import axios from "axios";
import { URLS } from "../lib/api/services/url";
import fs from 'fs-extra';
import path from 'path';
import { CONFIG_FILE, FOLDER_NAME, INDEX_FILE, TEST_FILE } from "../helper/functions.utils";

let program: CommanderStatic;
const mockAxios = new MockAdapter(axios);


// fixtures
const functionEvents = require('./fixtures/function-events.json');

jest.mock('configstore', () => {
    const Store =
        jest.requireActual<typeof import('configstore')>('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './function-test-cli.json',
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

describe('Function commands', () => {

    beforeAll(async () => {
        mockAxios.onGet('https://api.fyndx1.de/service/application/content/_healthz').reply(200);
    })

    beforeEach(async () => {
        program = await init('fdk');

        loginUser();
        addExtensionContext();
    })

    afterEach(async () => {
        cleanFunctionData();
        rimraf.sync('./function-test-cli.json');
    })

    it('create - should create a function successfully', async () => {
        const functionName = 'function';
        const events = ['AddToCart', 'UpdateCart']

        const inquirerSpy = jest
            .spyOn(inquirer, 'prompt')
            .mockResolvedValueOnce({function_name: functionName})
            .mockResolvedValueOnce({selectedEvents: events})

        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(404)

        mockAxios
            .onGet(URLS.GET_FUNCTIONS_ALL_EVENTS())
            .replyOnce(200, functionEvents)

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'function',
            'create'
        ]);

        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, functionName))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, functionName, CONFIG_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, functionName, INDEX_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, functionName, TEST_FILE))).toBe(true);

        const configData = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, functionName, CONFIG_FILE));
        expect(configData.name).toBe(functionName);
        expect(configData.description).toBeTruthy();
        expect(configData.type).toBeTruthy();
        expect(configData.events.length).toBe(events.length);

        const code = fs.readFileSync(path.join(`./${FOLDER_NAME}`, functionName, INDEX_FILE), 'utf-8');
        expect(code).toBeTruthy();

        const tests = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, functionName, TEST_FILE));
        expect(tests.length).toBe(0);

        inquirerSpy.mockRestore();
    })

    it('create - should throw error if the function name is invalid', async () => {
        const functionName = '#invalidn@me';

        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error();
        })

        try {
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'function',
                'create',
                '-n',
                functionName
            ]);
        } catch(error) {
            expect(error).toBeTruthy();
        }
    })

    it('create - should throw an error if slug already exists', async () => {
        const functionName = 'function';
        
        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(200, {})

        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error();
        })

        try {
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'function',
                'create',
                '-n',
                functionName
            ]);
        } catch(error) {
            expect(error).toBeTruthy();
        }
    })


    it('init - init function successfully', async () => {
        const slug = 'function-slug';
        const functionData = require('./fixtures/get-function-response.json');
        const functionTests = require('./fixtures/function-test-response.json');

        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(200, {...functionData, slug: slug})

        mockAxios
            .onGet(new RegExp(URLS.ALL_FUNCTION_TESTS('[a-z0-9]{24}', '[a-z0-9]{24}')))
            .replyOnce(200, functionTests)

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'function',
            'init',
            '-s',
            slug
        ]);

        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, CONFIG_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, INDEX_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, TEST_FILE))).toBe(true);

        const configData = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, slug, CONFIG_FILE));
        expect(configData.name).toBe(functionData.name);
        expect(configData.description).toBe(functionData.description);
        expect(configData.type).toBe(functionData.type);
        expect(configData.events.length).toBe(functionData.version_data.events.length);

        const code = fs.readFileSync(path.join(`./${FOLDER_NAME}`, slug, INDEX_FILE), 'utf-8');
        expect(code).toBe(functionData.version_data.code_snippet);

        const tests = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, slug, TEST_FILE));
        expect(tests.length).toBe(functionTests.items.length);        

    })

    it('init - throw error is slug is not exists', async () => {``
        const slug = 'function-slug';

        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(404, {})
        
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error();
        })

        try {
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'function',
                'init',
                '-s',
                slug
            ]);
        } catch(error) {
            expect(error).toBeTruthy();
        }
    })

    it('init - throw error if folder already exists', async () => {
        const slug = 'function-slug';
        const functionData = require('./fixtures/get-function-response.json');

        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(200, functionData)
        
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error();
        })

        fs.ensureDirSync(path.join( `./${FOLDER_NAME}`, slug));

        try {
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'function',
                'init',
                '-s',
                slug
            ]);
        } catch(error) {
            expect(error).toBeTruthy();
        }
    })


    it('init - force init function successfully', async () => {
        const slug = 'function-slug';
        const functionData = require('./fixtures/get-function-response.json');
        const functionTests = require('./fixtures/function-test-response.json');

        fs.ensureDirSync(path.join( `./${FOLDER_NAME}`, slug));

        mockAxios
            .onGet(new RegExp(URLS.GET_FUNCTION_BY_SLUG('[a-z0-9]{24}', '[^/]*')))
            .replyOnce(200, {...functionData, slug: slug})

        mockAxios
            .onGet(new RegExp(URLS.ALL_FUNCTION_TESTS('[a-z0-9]{24}', '[a-z0-9]{24}')))
            .replyOnce(200, functionTests)

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'function',
            'init',
            '-s',
            slug,
            '-f'
        ]);

        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, CONFIG_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, INDEX_FILE))).toBe(true);
        expect(fs.existsSync(path.join(`./${FOLDER_NAME}`, slug, TEST_FILE))).toBe(true);

        const configData = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, slug, CONFIG_FILE));
        expect(configData.name).toBe(functionData.name);
        expect(configData.description).toBe(functionData.description);
        expect(configData.type).toBe(functionData.type);
        expect(configData.events.length).toBe(functionData.version_data.events.length);

        const code = fs.readFileSync(path.join(`./${FOLDER_NAME}`, slug, INDEX_FILE), 'utf-8');
        expect(code).toBe(functionData.version_data.code_snippet);

        const tests = fs.readJSONSync(path.join(`./${FOLDER_NAME}`, slug, TEST_FILE));
        expect(tests.length).toBe(functionTests.items.length);
    })
})