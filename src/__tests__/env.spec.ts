import { init } from '../fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';

let program;

describe('Env Commands', () => {

    beforeAll(async () => {
        program = await init('fdk');
    });

    afterEach(() => {
        configStore.clear();
    });
    
    it('should console current set env', async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0']);
        const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        await new Promise((r) => setTimeout(r, 2000));
        expect(currentEnv).toMatch('fyndx0');
    });

    it('should console current active env', async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0']);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'get']);
        const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        await new Promise((r) => setTimeout(r, 2000));
        expect(currentEnv).toMatch('fyndx0');
    });

    it('should console all env list', async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0']);
        await program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'ls']);
        const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        await new Promise((r) => setTimeout(r, 2000));
        expect(currentEnv).toMatch('fyndx0');
    });
});
