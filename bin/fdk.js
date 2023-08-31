#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const Sentry = require("@sentry/node");
const packageJson = require("../package.json");

Sentry.init({
  dsn: "https://bcc2fa6cc7de7c5bbfde279c632887ae@o4505759429165056.ingest.sentry.io/4505759431917568", // TODO: update with gofynd org DSN
  release: packageJson.version
})

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);

const bootstrap = () => {
  const { init, parseCommands } = require('../dist/fdk');
  const program = init('fdk');
  parseCommands();
  return program;
}

if (major < 12) {
  console.error(chalk.red(
    'You are running Node ' +
    currentNodeVersion +
    '.\n' +
    'Fynd development kit requires Node 12 or higher. \n' +
    'Please update your version of Node.'
  ));
  process.exit(1);
}

bootstrap();