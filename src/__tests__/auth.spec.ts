import rimraf from 'rimraf';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import request from 'supertest';
import nock from 'nock';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import mockFunction, { setEnv } from './helper';
import { init } from '../fdk';
import { startServer } from '../lib/Auth';
import { URLS } from '../lib/api/services/url';
import Logger from '../lib/Logger';
import {
  getRandomFreePort,
} from '../helper/extension_utils';

const tokenData = require('./fixtures/partnertoken.json');
const organizationData = require('./fixtures/organizationData.json');

jest.mock('inquirer');
let program;

jest.mock('configstore', () => {
  const Store = jest.requireActual('configstore');
  return class MockConfigstore {
    store = new Store('test-cli', undefined, {
      configPath: './auth-test-cli.json',
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
jest.mock('open', () => () => {});
export async function login(domain?: string) {
  const port = await getRandomFreePort([]);
  const app = await startServer(port);
  nock.disableNetConnect();
  nock('https://api.fyndx1.de')
    .post('/token')
    .reply(200, tokenData);
  const req = request(app);
  if (domain) await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', domain]);
  else await program.parseAsync(['ts-node', './src/fdk.ts', 'login', '--host', 'api.fyndx1.de']);
  return await req.post('/token').send(tokenData);
}

describe('Auth Commands', () => {
  beforeAll(async () => {
    setEnv();
    program = await init('fdk');
    const mock = new MockAdapter(axios);
    configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id);
    mock.onGet('https://api.fyndx1.de/service/application/content/_healthz').reply(200);
    mock.onGet('https://api.fynd.com/service/application/content/_healthz').reply(200);
    mock.onGet('https://api.jiomartpartners.com/service/application/content/_healthz').reply(200);
    mock.onGet('https://api-invoice.sandbox3.fynd.engineering/service/application/content/_healthz').reply(200);
    mock.onGet(`${URLS.GET_ORGANIZATION_DETAILS()}`).reply(
      200,
      organizationData,
    );
    mock.onGet('https://api.jiomartpartners.com/service/partner/partners/v1.0/organization/60afe92972b7a964de57a1d4').reply(
      200,
      organizationData,
    );
    mock.onGet('https://api-invoice.sandbox3.fynd.engineering/service/partner/partners/v1.0/organization/60afe92972b7a964de57a1d4').reply(
      200,
      organizationData,
    );
    setEnv('api.fynd.com');
    configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id);
    mock.onGet(`${URLS.GET_ORGANIZATION_DETAILS()}`).reply(
      200,
      organizationData,
    );
    setEnv();
    configStore.set(CONFIG_KEYS.ORGANIZATION, organizationData._id);
    configStore.delete(CONFIG_KEYS.ORGANIZATION);
    await login();
  });

  afterAll(() => {
    rimraf.sync('./auth-test-cli.json');
  });
  it('Should successfully login with partner panel', async () => {
    expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
      'pr-4fb094006ed3a6d749b69875be0418b83238d078',
    );
  });
  it('Should ask for change organization when user is already logged in', async () => {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ confirmChangeOrg: 'Yes' });
    await login();
    expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
      'pr-4fb094006ed3a6d749b69875be0418b83238d078',
    );
  });
  it('Passing partners URL should set api host in env', async () => {
    configStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    await login('partners.fynd.com');
    expect(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)).toBe('api.fynd.com');
  });
  it('Passing partners URL with partners in domain should set proper api host in env', async () => {
    configStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    await login('partners.jiomartpartners.com');
    expect(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)).toBe('api.jiomartpartners.com');
  });
  it('Passing partners sandbox URL should set partners api host in env', async () => {
    configStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    await login('partners-invoice.sandbox3.fynd.engineering');
    expect(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)).toBe('api-invoice.sandbox3.fynd.engineering');
  });
  it('Should exit when user selects no for organization change', async () => {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ confirmChangeOrg: 'No' });
    await login();
    expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
      'pr-4fb094006ed3a6d749b69875be0418b83238d078',
    );
  });
  it('Should successfully login with and env should updated', async () => {
    configStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    await login('api.fynd.com');
    expect(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)).toBe('api.fynd.com');
    expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe(
      'pr-4fb094006ed3a6d749b69875be0418b83238d078',
    );
  });
  it('should console active user', async () => {
    let consoleWarnSpy: jest.SpyInstance;
    consoleWarnSpy = jest.spyOn(Logger, 'info').mockImplementation();
    await program.parseAsync(['ts-node', './src/fdk.ts', 'user']);
    const { current_user: user } = configStore.get(CONFIG_KEYS.AUTH_TOKEN);
    expect(consoleWarnSpy.mock.lastCall[0]).toContain('Name: Jinal Virani');
    expect(user.emails[0].email).toMatch('jinalvirani@gofynd.com');
  });
  it('should successfully logout user', async () => {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
    await program.parseAsync(['ts-node', './src/fdk.ts', 'logout']);
    const storeSize = configStore.size;
    expect(storeSize).toBe(0);
  });
});
