const packageJSON = require('../package.json');

// match release version
const regex = /^\d+\.\d+\.\d+$/;

if (!regex.test(packageJSON.version)) {
    console.log('\x1b[33m Invalid package version. Release aborted ! \x1b[0m');
    return process.exit(1);
}

console.log('\x1b[32m Release initiated ! \x1b[0m');


console.log(process.env)