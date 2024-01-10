const versionRegex = /^\d+\.\d+\.\d+$/;

const packageJSON = require('../package.json');
const packageJSONVersion = packageJSON.version;

// Check if version is valid
if(!packageJSONVersion.match(versionRegex)){
    console.log(`\x1b[33m Invalid version in package.json(${packageJSONVersion}). Release aborted ! \x1b[0m`);
    console.log('\x1b[33m Stable Release version should match regex:\x1b[0m ^\\d+\\.\\d+\\.\\d+$');
    return process.exit(1);
}

const gitRef = process.env.GITHUB_REF;
const tagVersion = gitRef.match(/^refs\/tags\/v(\d+\.\d+\.\d+)/)?.[1];

// Check if Release Tag version is valid
if(!tagVersion){
    console.log(`\x1b[33m Invalid version in Release Tag(${gitRef}). Release aborted ! \x1b[0m`);
    console.log('\x1b[33m Stable Release Tag version should match regex:\x1b[0m ^v\\d+\\.\\d+\\.\\d+$');
    return process.exit(1);
}

// Check if version in Release tag and package.json matches
if(packageJSONVersion !== tagVersion){
    console.log(`\x1b[33m Release Tag version(${tagVersion}) and package.json(${packageJSONVersion}) didn\'t match. Release aborted ! \x1b[0m`);
    return process.exit(1);
}

console.log('\x1b[32m Release initiated ! \x1b[0m');