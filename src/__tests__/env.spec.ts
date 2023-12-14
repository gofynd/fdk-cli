import rimraf from 'rimraf';
import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';

let program;

jest.mock('configstore', () => {
    const Store =
        jest.requireActual<typeof import('configstore')>('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './env-test-cli.json',
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

describe('Env Commands', () => {
    beforeAll(async () => {
        program = await init('fdk');
    });

    afterEach(() => {
        rimraf.sync('./env-test-cli.json');
    });

    it('should console current set env', async () => {
        await program.parseAsync([
            'ts-node',
            './src/fdk.ts',
            'env',
            'set',
            '-u',
            'api.fyndx1.de',
        ]);
        const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        await new Promise((r) => setTimeout(r, 2000));
        expect(currentEnv).toMatch('api.fyndx1.de');
    });
});
