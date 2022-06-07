#!/usr/bin/env node

'use strict';

const chalk = require('chalk');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);

const bootstrap = () => {
  const { init, parseCommands } = require('../dist/fdk');
  const program = init('fdk');
  parseCommands();
  return program;
}

const oldCommands = ['extension', 'partner']
if (major < 12) {
  console.error(
    'You are running Node ' +
    currentNodeVersion +
    '.\n' +
    'Fynd development kit requires Node 12 or higher. \n' +
    'Please update your version of Node.'
  );
  process.exit(1);
}

const args = process.argv;
let isOld = false;
oldCommands.forEach(c => {
  if (args.includes(c)) isOld = true
})

if (!isOld) {
  bootstrap()
}
else {
  const yargs = require('yargs')
    .strict()
    .completion('autocomplete')
    .commandDir('../src/partners/cmds')
    .option('host', {
      describe: 'Set host for syncing resources'
    }).check((argv, options) => {
      // regex for validation cli-host (host with subdomain mandatory)
      let hostRegex = /^(http(s)?:\/\/)?([a-zA-Z0-9]([-a-zA-Z0-9]{1,61}[a-zA-Z0-9])?\.)+([a-zA-Z0-9]{1,2}([-a-zA-Z0-9]{0,252}[a-zA-Z0-9])?)\.([a-zA-Z]{2,63})$/g
      const host = argv.host
      if (host && !hostRegex.test(host)) {
        console.log(chalk.red('Invalid host'));
        process.exit(1);
      }
      return true
    })
    .version()
    .help().argv;
  if (yargs._.length === 0) {
    require('yargs').showHelp();
  }
}
exports.bootstrap = bootstrap;