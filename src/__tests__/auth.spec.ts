import cli from './helper';
import axios from "axios";
import mockAxios from "jest-mock-axios";
import MockAdapter from "axios-mock-adapter";
import inquirer from 'inquirer';
import { bootstrap } from "../../bin/fdk";
import Auth from '../lib/api/services/auth.service'
import {URLS} from '../lib/api/services/url';

export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

jest.mock('inquirer');

  describe("login user", () => {

  it("should successfully login user with email", async (done) => {
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({password: '1234567'});
    const users = 
      { 
        Name: "Anurag Pandey",
        Email: "anuragpandey123@gofynd.com"
       }
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, users);
    const program = await bootstrap();
    program.parse(["node", "./bin/fdk.js", "login", "-e", "vivek@fynd.com"]);

      // const response = await axios.post(`${URLS.LOGIN_USER()}`)
      // console.log("response",response);
      //  mockAxios.post.mockResolvedValueOnce(users);
    // const subprocess = await cli(`login -e anuragpandey@gofynd.com`,'Pandey@fynd1');
    // console.log("subprocess",subprocess);
    // const result = await run([`${cliPath} login -e vivekprajapati@gofynd.com`]);
    // expect(mock.history.get[0].url).toMatch(`${URLS.LOGIN_USER()}`);
   
      // expect(response.data.Name).toEqual(users.Name);
    // expect(axios.post).toHaveBeenCalledWith(`users`);
    // expect(result).toEqual(users);
  // expect(spy).toBe("user loggedin successfully")
  // expect(spy).toHaveBeenCalled();
  })

})
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