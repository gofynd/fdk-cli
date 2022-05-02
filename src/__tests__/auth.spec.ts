import axios from 'axios';
import inquirer from 'inquirer';
import MockAdapter from 'axios-mock-adapter';
import { bootstrap } from '../../bin/fdk';
import { URLS } from '../lib/api/services/url';
const data = require('./fixtures/email-login.json');
const mobileData = require('./fixtures/mobile-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';

export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}
afterAll(() => {
    configStore.clear();
});
jest.mock('inquirer');

describe('login user with email', () => {
    it('should successfully login user with email', async () => {
        console.log('inside test for login user11111');
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ password: '1234567' });
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data, {
            'set-cookie': [{ Name: 'Anurag Pandey' }],
        });
        console.log('inside test for login user22222');
        const program = await bootstrap();
        await program.parseAsync([
            'node',
            './bin/fdk.js',
            'login',
            '-e',
            'anuragpandey@gofynd.com',
        ]);
        console.log('inside test for login user3333');
        const cookies = configStore.get(CONFIG_KEYS.COOKIE);
        console.log('cookies', cookies);
        expect(cookies.Name).toMatch('Anurag Pandey');
        console.log('after expect');
    });
});

// describe("login user with mobile", () => {

//   console.log("in mobile login testing")
//   it("should successfully login user with mobile",async () => {
//     const inquirerMock = mockFunction(inquirer.prompt);
//     inquirerMock.mockResolvedValue({otp: '123456'});
//     const mock = new MockAdapter(axios);
//     mock.onPost(`${URLS.SEND_OTP()}`).reply(200, mobileData);
//     mock.onPost(`${URLS.VERIFY_OTP()}`).reply(200, data, {'set-cookie': [{ Name: 'Anurag Pandey' }], });
//     const program = await bootstrap();
//    await program.parseAsync(["node", "./bin/fdk.js", "login", "-m", "7678880802"]);
//     const cookies = configStore.get(CONFIG_KEYS.COOKIE);
//     console.log('cookies', cookies);
//       expect(cookies.Name).toMatch("Anurag Pandey");
//   })
// });

// describe("logout user", () => {

//     it("should successfully logout user", async () => {
//     const inquirerMock = mockFunction(inquirer.prompt);
//     inquirerMock.mockResolvedValue({confirmLogout: 'Yes'});
//     const program = await bootstrap();
//    const result = await program.parseAsync(["node", "./bin/fdk.js", "logout"]);
//     const cookies = configStore.clear()
//     console.log('cookies', cookies);
//     // expect(cookies).toMatch("Anurag Pandey");
//     expect(cookies).toBeUndefined();
//     })
//   })

// describe("active user", () => {

//     it("should console active user", async() => {
//       const program = await bootstrap();
//       await program.parseAsync(["node", "./bin/fdk.js", "user"]);
//     })
//     })
