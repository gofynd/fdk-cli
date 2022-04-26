import cli from './helper';

describe("login user", () => {

  jest.setTimeout(30000);

  it("should successfully login user with email", async (done) => {
    const subprocess = await cli(`login -e vivekprajapati@gofynd.com`,123456);
    console.log(subprocess);
    // const result = await run([`${cliPath} login -e vivekprajapati@gofynd.com`]);
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