import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { bootstrap } from '../../bin/fdk';
const {bootstrap} = require('../../bin/fdk');
import { URLS } from '../lib/api/services/url';
// const data = require('./fixtures/user-login.json');
// const mobileData = require('./fixtures/mobile-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { getCommonHeaderOptions } from '../lib/api/services/utils';
import { getActiveContext } from '../../src/helper/utils';


export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}
afterAll(() => {
    configStore.clear();
  });

  jest.mock('inquirer');

  const token = "eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDUtMDVUMDU6MDI6NTcuOTgxWiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0="

  describe('Add Theme Context', () => {
            it('should successfully add theme context ', async () => {
                const mock = new MockAdapter(axios);
                const program = await bootstrap();
                await program.parseAsync([
                    'node',
                    './bin/fdk.js',
                    'theme',
                    '-t',
                    'anuragpandey@gofynd.com',
                ]);
                const cookies = configStore.get(CONFIG_KEYS.COOKIE);
                console.log('cookies', cookies);
                expect(cookies.Name).toMatch("Anurag Pandey");
                // expect(true).toBeTruthy();
                console.log('after expect');
            });
        });