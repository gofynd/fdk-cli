#!/usr/bin/env node
'use strict';
process.setMaxListeners(0);
const fs = require('fs');
const chalk = require('chalk');
const yargs = require('yargs')
  .strict()
  .completion('autocomplete')
  .commandDir('cmds')
  .option('host', {
    describe: 'Set host'
  })
  .version()
  .help().argv;
if (yargs.host && Object.keys(yargs).length === 3) {
  // if (!fs.existsSync('./config.json')) {
  //   console.log(chalk.red('Not a theme directory'));
  // }
} else if (yargs._.length === 0) {
  require('yargs').showHelp();
}
