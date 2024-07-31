import axios from 'axios';
import execa from 'execa';
import inquirer from 'inquirer';
import { init } from '../fdk';
import fs from 'fs';
import rimraf from 'rimraf';
import Extension, {
    NODE_VUE,
    NODE_REACT,
    JAVA_REACT,
    JAVA_VUE,
    PYTHON_REACT,
    PYTHON_VUE,
} from '../lib/Extension';
import configStore, { CONFIG_KEYS } from '../lib/Config';

let program;
const envFileData = `EXTENSION_API_KEY="api_key"\nEXTENSION_API_SECRET="api_secret"\nEXTENSION_BASE_URL="https://abc.com"\nEXTENSION_CLUSTER_URL="https://api.fynd.com"`;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './setupExt-test-cli.json',
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

describe('Setup extension command', () => {
    beforeAll(async () => {
        program = await init('fdk');
        configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, 'api.fynd.com');
        configStore.set(CONFIG_KEYS.PARTNER_ACCESS_TOKEN, 'mocktoken');
    });

    afterAll(async () => {
        rimraf.sync('./setupExt-test-cli.json');
    });

    afterEach(async () => {
        await execa('rm', ['-rf', 'Test_Extension']);
    });

    beforeEach(async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({
            data: { base_url: 'https://abc.com', name: 'Test_Extension' },
        });

        jest.spyOn(Extension, 'installDependencies').mockResolvedValue();
        jest.spyOn(Extension, 'checkDependencies').mockReturnValue();
    });

    it('should clone node vue template files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: NODE_VUE,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);
        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        expect(
            fs.readFileSync('./Test_Extension/.env', { encoding: 'utf-8' }),
        ).toBe(envFileData);
        const packageJson = JSON.parse(
            fs.readFileSync('./Test_Extension/frontend/package.json', {
                encoding: 'utf-8',
            })
        );
        expect(packageJson.name).toBe('test_extension');
        expect(packageJson.dependencies.vue).toMatch(/\^3\..+/);
    });

    it('should throw directory already exists error', async () => {
        try {
            jest.spyOn(inquirer, 'prompt').mockResolvedValue({
                extension_api_key: 'api_key',
                extension_api_secret: 'api_secret',
                project_type: NODE_VUE,
            });

            jest.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error('Directory already exists');
            });
            await program.parseAsync([
                'ts-node',
                './src/fdk.ts',
                'extension',
                'setup',
            ]);
        } catch (err) {
            expect(err.message).toBe('Directory already exists');
        }
    });

    it('should clone node react template files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: NODE_REACT,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);

        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        expect(
            fs.readFileSync('./Test_Extension/.env', { encoding: 'utf-8' }),
        ).toBe(envFileData);
        const packageJson = fs.readFileSync('./Test_Extension/package.json', {
            encoding: 'utf-8',
        });
        expect(JSON.parse(packageJson).name).toBe('test_extension');
    });

    it('should clone python vue template files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: PYTHON_VUE,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);

        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        expect(
            fs.readFileSync('./Test_Extension/.env', { encoding: 'utf-8' }),
        ).toBe(envFileData);
        const packageJson = fs.readFileSync('./Test_Extension/package.json', {
            encoding: 'utf-8',
        });
        expect(JSON.parse(packageJson).name).toBe('test_extension');
    });

    it('should clone python react template files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: PYTHON_REACT,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);

        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        expect(
            fs.readFileSync('./Test_Extension/.env', { encoding: 'utf-8' }),
        ).toBe(envFileData);
        const packageJson = fs.readFileSync('./Test_Extension/package.json', {
            encoding: 'utf-8',
        });
        expect(JSON.parse(packageJson).name).toBe('test_extension');
    });

    it('should clone java vue tempalte files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: JAVA_VUE,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);

        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        const packageJson = fs.readFileSync(
            './Test_Extension/app/package.json',
            { encoding: 'utf-8' },
        );
        expect(JSON.parse(packageJson).name).toBe('test_extension');
    });

    it('should clone java react tempalte files', async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: JAVA_REACT,
        });

        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'extension',
            'setup',
        ]);

        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        const packageJson = fs.readFileSync(
            './Test_Extension/app/package.json',
            { encoding: 'utf-8' },
        );
        expect(JSON.parse(packageJson).name).toBe('test_extension');
    });
});
