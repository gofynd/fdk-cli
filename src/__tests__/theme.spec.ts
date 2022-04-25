// import { exec } from 'child_process';


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

// describe("Theme Publish", () => {
//     it("Should Publish Theme", (done) => {

//       exec(`fdk theme publish`, (error, stdout,stderr)=>{
//         if(stderr){
//           console.log("stderror",stderr);
//           return;
//         }
//         expect(stdout.trim()).toMatch('Theme published');
//         done()
//       })
//     })
//   })

//   describe("Theme Unpublish", () => {
//     it("Should Unpublish Theme", (done) => {

//       exec(`fdk theme unpublish`, (error, stdout,stderr)=>{
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