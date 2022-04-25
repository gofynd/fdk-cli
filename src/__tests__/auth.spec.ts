// const {exec} = require('child_process');
import { exec } from 'child_process';
import Auth from '../lib/Auth';
const readline = require('readline');

describe('login user', () => {
    it('should successfully login user with email', async done => {
        const loginUserSpy = jest.spyOn(Auth, 'loginUserWithEmail');
        exec(`fdk login -e anuragpandey@gofynd.con`, (error, stdout, stderr) => {
            const rl = readline.createInterface({
                input: process.stdin,
            });

            const promptForCommand = () => process.stdout.write('enter command: ');
            promptForCommand();
            rl.on('line', input => {
                const inputArr = input.trim().split(' ');
                const command = inputArr[0];
                const args = inputArr.slice(1);
                try {
                    controller.executeCommand(command, args);
                } catch (e) {
                    process.stdout.write(`Error: ${e.message}${os.EOL}`);
                }
                promptForCommand();
            });
            if (stderr) {
                console.log('stderror', stderr);
                return;
            }
            console.log('stdout', stdout);
            expect(loginUserSpy).toHaveBeenCalled();
            // expect(stdout).toMatch("");
            done();
        });
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

describe('logout user', () => {
    it('should successfully logout user', done => {
        const spy = jest.spyOn(Auth, 'logout');
        exec(`fdk logout`, (error, stdout, stderr) => {
            if (stderr) {
                console.log('stderror', stderr);
                return;
            }
            expect(spy).toHaveBeenCalled();
            done();
        });
    });
});

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
