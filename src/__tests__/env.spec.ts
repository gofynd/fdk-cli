// const execa = require("execa")
// var cli = (argv = "") => new Promise((resolve, reject) => {
//   const subprocess = execa.command(`node ./src/__tests__/cli.js ${argv}`)
//   subprocess.stdout.pipe(process.stdout)
//   subprocess.stderr.pipe(process.stderr)
//   Promise.resolve(subprocess).then(resolve)
// })
  
// test('main', async() => {
//   // jest.setTimeout(5000);
//     await cli(`fdk current-env`)
//     expect('current env is')
//   });


// import {createProgram}   from './cli.js';
// const {createProgram}  = require('./cli.js');
// test('main', () => {
//     const program = createProgram()
//     program.parse(['node', 'cli.js', 'fdk current-env'])
//     expect(program.commands.map(i => i._name)).toEqual(['fdk current-env']) // pass
//     expect('something')
// });


// describe("get current environment", () => {
//   it("should create properly", () => {
//   //   expect(reverseString("foo")).to.equal("oof");
//   });
// });

// const abc = require('.');
// import abc from '../../src/lib/Env';

// test('get env', () => {
//   expect(abc.getEnvValue()).toBe('fyndx0');
// });

const {exec} = require('child_process');
describe("get current enviornment", () => {
  it("should console current set env", (done) => {
    exec(`fdk current-env`, (error, stdout,stderr)=>{
      if(stderr){
        console.log("stderror",stderr);
        return;
      }
      expect(stdout.trim()).toMatch('Active Envoirnment: fyndx0');
      // expect(stdout).toEqual("Active Envoirnment: fyndx0");
      done()
    })
  })
})

// describe("get current enviornment", () => {
//   it("should console all env", (done) => {
//     exec(`fdk env ls`, ()=>{
//       expect('fyndx0').toEqual("fyndx0");
//       done()
//     })
//   })
// })

describe("set  enviornment", () => {
  it("should console current set env", (done) => {
    exec(`fdk env -n fyndx0`, (error, stdout,stderr)=>{
      if(stderr){
        console.log("stderror",stderr);
        return;
      }
      expect(stdout.trim()).toMatch("Env set to: fyndx0");
      done()
    })
  })
})
