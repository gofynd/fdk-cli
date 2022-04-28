import mockFunction from './helper';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import inquirer from 'inquirer';
import { bootstrap } from '../../bin/fdk';
import { URLS } from '../lib/api/services/url';
jest.mock('inquirer');

describe('login user', () => {

    it('should successfully login user with email', async done => {
        console.log(mockFunction);
        const inquirerMock = mockFunction(inquirer.prompt);
        inquirerMock.mockResolvedValue({ password: '1234567' });
        const users = {
            Name: 'Anurag Pandey',
            Email: 'anuragpandey123@gofynd.com',
        };
        const mock = new MockAdapter(axios);
        mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, users);
        const program = await bootstrap();
        program.parse(['node', './bin/fdk.js', 'login', '-e', 'vivek@fynd.com']);
    });
});
// it("should successfully login user with mobile",(done) => {
//     exec(`fdk login -m 7878880802`,(error,stdout,stderr)=>{
//         if(stderr){
//             console.log("stderr",stderr);
//             return;
//         }
//         console.log("stdout",stdout);
//         expect(stdout).toMatch("ENTER OTP:");
//         done()
//     })
// })
//   })
// })

// describe("logout user", () => {

//     it("should successfully logout user", (done) => {
//       const spy = jest.spyOn(Auth, 'logout')
//       exec(`fdk logout`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(spy).toHaveBeenCalled();
//         done()
//       })
//     })
//   })

// describe("active user", () => {

//     it("should console active user", (done) => {
//         // jest.setTimeout(30000);
//       exec(`fdk user`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(stdout.trim()).toMatch('Name: Anurag Pandey Email: anuragpandey@gofynd.com');
//         done()
//       })
//     })
//     })
