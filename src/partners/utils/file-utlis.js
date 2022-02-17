const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
import CommandError from '../../lib/CommandError';

const readFile = relativePath => {
  const fileContents = fs.readFileSync(
    relativePath,
    {
      encoding: 'utf-8'
    },
    function (error) {
      if (error) {
        throw new CommandError(
          "%s Can't read component files",
          chalk.red.bold('ERROR')
        );
      }
    }
  );
  return fileContents;
};

const writeFile = (relativePath, fileContents, mode='w') => {
  fs.ensureFileSync(relativePath);
  fs.writeFileSync(
    relativePath,
    fileContents,
    {
      encoding: 'utf-8',
      flag: mode
    },
    function (error) {
      if (error) {
        // Need to confirm this change
        throw new CommandError(
          "%s Can't create component files",
          chalk.red.bold('ERROR')
        );
      }
    }
  );
};

const resolvePath = dir => {
  const exist = fs.existsSync(dir);
  return exist;
};
const createDirectory = relativePath => {
  if (!fs.existsSync(relativePath)) {
    fs.mkdirSync(relativePath, { recursive: true });
  }
};
module.exports = { readFile, writeFile, createDirectory, resolvePath };
