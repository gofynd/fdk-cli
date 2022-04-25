// const {exec} = require('child_process');
import {exec} from 'child_process';
// import inquirer from 'inquirer';
import  AuthenticationHandler  from '../commands/auth';
import { command } from 'commander';
import Auth from '../commands/auth';
jest.mock('../../src/commands/auth');
const mockInquirer = require('mock-inquirer')
const inquirer = require('inquirer')


describe("login user", () => {
  jest.setTimeout(50000)
  it("should successfully login user with email", async (done) => {
    let reset = mockInquirer([{
      password: '123456'  // will auto fill 'world'
  }, {
    // if anwsers is empty, mockInquirer will fill with default value
  }, {
      fail: false
  }])
    // const spyFetchUserData = jest
    // .spyOn(inquirer ,'AuthenticationHandler')
    // .mockImplementation(() =>
    //     Promise.resolve({
    //         password: "12345",
    //         ui: {}      
    //     })
    // );
    // const loginUserSpy = jest
    //         .spyOn(Auth, `AuthenticationHandler()`).mockImplementation();
    //         console.log("loginUserSpy",loginUserSpy);

    // const result = AuthenticationHandler(`fdk login -e`);
    exec(` npm link && npm run build && fdk login -e anuragpandey@gofynd.com`, (error, stdout,stderr)=>{
        if(stderr){
            console.log("stderror",stderr);
            return;
          }
          console.log("stdout",stdout);
          expect(stdout).toBe('test@test.com');
        //   expect(spyFetchUserData).toHaveBeenCalled();
      // expect(stdout).toMatch("");
      done()
    })
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
//         jest.setTimeout(30000);
//       exec(`fdk user`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(stdout.trim()).toMatch('Name: Anurag Pandey Email: anuragpandey@gofynd.com');
//         done()
//       })
//     })
//     })})