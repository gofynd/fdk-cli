// import axios from 'axios';
// import mockAxios from 'jest-mock-axios';
// import MockAdapter from 'axios-mock-adapter';
// import inquirer from 'inquirer';
// // import { bootstrap } from '../../bin/fdk';
// const {bootstrap} = require('../../bin/fdk');
// import { URLS } from '../lib/api/services/url';
// // const data = require('./fixtures/user-login.json');
// // const mobileData = require('./fixtures/mobile-login.json');
// import configStore, { CONFIG_KEYS } from '../lib/Config';
// import { getCommonHeaderOptions } from '../lib/api/services/utils';
// import { getActiveContext } from '../../src/helper/utils';


// export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
//     return fn as jest.MockedFunction<T>;
// }
// afterAll(() => {
//     configStore.clear();
//   });

//   jest.mock('inquirer');


//   describe('Add Theme Context', () => {
//             it('should successfully add theme context ', async () => {
//                 const mock = new MockAdapter(axios);
//                 const activeContext = data ?  data : getActiveContext();
//       const axiosOption = Object.assign({}, getCommonHeaderOptions());
//                 mock.onPost(`${URLS.GET_APPLICATION_DETAILS()}`).reply(200, data, {
//                     'set-cookie': [{ Name: 'Anurag Pandey' }],
//                 });
//                 const program = await bootstrap();
//                 await program.parseAsync([
//                     'node',
//                     './bin/fdk.js',
//                     'login',
//                     '-e',
//                     'anuragpandey@gofynd.com',
//                 ]);
//                 const cookies = configStore.get(CONFIG_KEYS.COOKIE);
//                 console.log('cookies', cookies);
//                 expect(cookies.Name).toMatch("Anurag Pandey");
//                 // expect(true).toBeTruthy();
//                 console.log('after expect');
//             });
//         });