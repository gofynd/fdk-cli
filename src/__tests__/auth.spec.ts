import cli from './helper';
import axios from "axios";
import mockAxios from "jest-mock-axios";
import MockAdapter from "axios-mock-adapter";
import inquirer from 'inquirer';
import { bootstrap } from "../../bin/fdk";
import Auth from '../lib/api/services/auth.service'
import {URLS} from '../lib/api/services/url';
// import userLoginMockData from './fixtures/user-login.json';
const data = require('./fixtures/user-login.json');
import configStore, { CONFIG_KEYS } from '../lib/Config';


export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

jest.mock('inquirer');

  describe("login user with email", () => {

  it("should successfully login user with email", async (done) => {
    jest.setTimeout(30000)
    const inquirerMock = mockFunction(inquirer.prompt);
    inquirerMock.mockResolvedValue({password: '1234567'});
    const mock = new MockAdapter(axios);
    mock.onPost(`${URLS.LOGIN_USER()}`).reply(200, data,{"set-cookie":[{"Name":"Anurag Pandey"}]});
    const program = await bootstrap();
     program.parse(["node", "./bin/fdk.js", "login", "-e", "anuragpandey@gofynd.com"]);
  const x = configStore.get(CONFIG_KEYS.COOKIE)
   console.log("x",x.Name)
    expect(x.Name).toMatch("Anurag Pandey");
    // expect(mock).toHaveBeenCalledTimes(1)
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
// describe("login user with mobile", () => {
//   it("should successfully login user with mobile",async (done) => {
//     const inquirerMock = mockFunction(inquirer.prompt);
//     inquirerMock.mockResolvedValue({otp: '123456'});
//     const mock = new MockAdapter(axios);
//     mock.onPost(`${URLS.SEND_OTP()}`).reply(200, data,{"set-cookie":[{"Name":"Anurag Pandey"}]});
//     const program = await bootstrap();
//     program.parse(["node", "./bin/fdk.js", "login", "-m", "7678880802"]);
//     const x = configStore.get(CONFIG_KEYS.COOKIE)
//       expect(x.Name).toMatch("Anurag Pandey");
//   })
// });

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