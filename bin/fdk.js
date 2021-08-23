#!/usr/bin/env node

'use strict';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);

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
  const { init } = require('../dist/fdk');
  init('fdk');
}
else {
  const yargs = require('yargs')
    .strict()
    .completion('autocomplete')
    .commandDir('../src/partners/cmds')
    .option('host', {
      describe: 'Set host for syncing resources'
    })
    .version()
    .help().argv;
  if (yargs._.length === 0) {
    require('yargs').showHelp();
  }
}

