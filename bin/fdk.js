#!/usr/bin/env node

'use strict';

const chalk = require('chalk');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);

const Sentry = require('@sentry/node');
const packageJson = require('../package.json');

Sentry.init({
    dsn: 'https://2a51996f413264190b01b4bdf0e410ea@o71740.ingest.sentry.io/4506539889721344',
    release: packageJson.version,
});

const bootstrap = () => {
    const { init, parseCommands } = require('../dist/fdk');
    const program = init('fdk');
    parseCommands();
    return program;
};

if (major < 12) {
    console.error(
        chalk.red(
            'You are running Node ' +
                currentNodeVersion +
                '.\n' +
                'Fynd development kit requires Node 12 or higher. \n' +
                'Please update your version of Node.',
        ),
    );
    process.exit(1);
}

bootstrap();
