// import { exec } from 'child_process';
import axios from 'axios';
import mockAxios from 'jest-mock-axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
// import { bootstrap } from '../../bin/fdk';
const {bootstrap} = require('../../bin/fdk');
import { URLS } from '../lib/api/services/url';
// const data = require('./fixtures/user-login.json');
// const mobileData = require('./fixtures/mobile-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';


export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}
beforeAll(() => {
    jest.setTimeout(50000)
});
afterAll(() => {
    configStore.clear();
  });

  jest.mock('inquirer');

// describe("get context list", () => {
//   it("should console all context list", (done) => {
//     exec(`fdk theme context-list`, (error, stdout,stderr)=>{
//       if(stderr){
//         console.log("stderror",stderr);
//         return;
//       }
//       expect(stdout.trim()).toMatch('Active Envoirnment: fyndx0');
//       // expect(stdout).toEqual("Active Envoirnment: fyndx0");
//       done()
//     })
//   })
// })

// describe("Theme Init", () => {
//     it("To initialize an exisiting theme on local system", (done) => {

//       exec(`fdk theme init -t 
//       [eyJhcHBsaWNhdGlvbl9pZCI6IjYyMjg5NDY1OWJhYWNhM2JlODhjOWQ2NSIsInRva2VuIjoiNEVvaC15RE1XIiwiY29tcGFueV9pZCI6MSwiZXhwaXJlc19pbiI6IjIwMjItMDQtMjVUMDQ6Mzc6NDUuNjQxWiIsInRoZW1lX2lkIjoiNjIzYjA5ZmFlYjBiNmUwZjRmZjk3NThmIn0=`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(stdout.trim()).toMatch('Active Envoirnment: fyndx0');
//         // expect(stdout).toEqual("Active Envoirnment: fyndx0");
//         done()
//       })
//     })
// //   })
//   describe("Theme Pull Config", () => {
//     it("To pull latest theme config", (done) => {

//       exec(`fdk theme pull-config`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(stdout.trim()).toMatch('Active Envoirnment: fyndx0');
//         // expect(stdout).toEqual("Active Envoirnment: fyndx0");
//         done()
//       })
//     })
//   })

describe("Theme Publish", () => {
    it("Should Publish Theme", async(done) => {

    const mock = new MockAdapter(axios);
    mock.onPut(`${URLS.THEME_BY_ID}`).reply(200, ); 
    const program = await bootstrap();
            await program.parseAsync(['cd','/Users/anuragpandey/Desktop/fynd/white-splash',
                'node',
                '~/bin/fdk.js',
                'theme',
                'publish',
            ]);
    })
  })

//   describe("Theme Unpublish", () => {
//     it("Should Unpublish Theme", (done) => {

//       
//     })
//   })

// describe('login user with email', () => {
//         it('should successfully login user with email', async () => {
//             const inquirerMock = mockFunction(inquirer.prompt);
//             inquirerMock.mockResolvedValue({ password: '1234567' });
//             const mock = new MockAdapter(axios);
//             mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
//                 'set-cookie': [{ Name: 'Anurag Pandey' }],
//             });
//             const program = await bootstrap();
//             await program.parseAsync([
//                 'node',
//                 './bin/fdk.js',
//                 'login',
//                 '-e',
//                 'anuragpandey@gofynd.com',
//             ]);
//             const cookies = configStore.get(CONFIG_KEYS.COOKIE);
//             console.log('cookies', cookies);
//             expect(cookies.Name).toMatch("Anurag Pandey");
//             // expect(true).toBeTruthy();
//             console.log('after expect');
//         });
//     });