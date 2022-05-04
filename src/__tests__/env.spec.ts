const execa = require("execa")
import { bootstrap } from '../../bin/fdk';
import configStore, { CONFIG_KEYS } from '../lib/Config';


describe("set  enviornment", () => {
    it("should console current set env", async() => {
        const program = await bootstrap();
      await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0' ]);
        const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
        expect(currentEnv).toMatch('fyndx0');
    })
  })
  
describe("get current enviornment", () => {
  it("should console current active env", async() => {
    const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0' ]);
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'get']);
    const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        expect(currentEnv).toMatch('fyndx');
  })
})

  describe("get enviornment list", () => {
    it("should console all env list", async() => {
        const program = await bootstrap();
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'set', '-n', 'fyndx0']);
    await program.parseAsync(['node', './bin/fdk.js', 'env', 'ls']);
    const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
     expect(currentEnv).toMatch('fyndx0');
    })
  })
  