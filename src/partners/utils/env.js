const { readFile, writeFile } = require('./file-utlis');
const fs = require('fs');
let env = '';
const readEnv = directory => {
  if (fs.existsSync(directory + '/.env')) {
    env = readFile(directory + '/.env');
    return env;
  } else {
    console.log('Invalid Directory or env not set');
  }
};

const writeEnv = (directory, envVal) => {
  if (fs.existsSync(directory)) {
    writeFile(directory + '/.env', envVal);
  } else {
    console.log('Invalid Directory');
  }
};

module.exports = { writeEnv, readEnv };
