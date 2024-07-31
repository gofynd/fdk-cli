#!/usr/bin/env node

'use strict';

const chalk = require('chalk');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);
const minCompatibleVersion = 16;

const bootstrap = () => {
    const { init, parseCommands } = require('../dist/fdk');
    const program = init('fdk');
    parseCommands();
    return program;
};
if (major < minCompatibleVersion) {
    console.error(
        chalk.red(
            `It looks like you're using an older version of Node.js ${currentNodeVersion}. Please upgrade to version ${minCompatibleVersion}.X.X or higher to use this tool.`,
        ),
    );
    process.exit(1);
}

bootstrap();
