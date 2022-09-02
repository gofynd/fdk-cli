import program, { Command } from 'commander';
import leven from 'leven';
import latestVersion from 'latest-version';
import semver from 'semver';
import boxen from 'boxen';
import chalk from 'chalk';
import Logger, { COMMON_LOG_MESSAGES } from './lib/Logger';
import Debug from './lib/Debug';
import CommandError, { ErrorCodes } from './lib/CommandError';
import { registerCommands } from './commands';
import configStore, { CONFIG_KEYS } from './lib/Config';
import fs from 'fs-extra';
import { initializeLogger } from './lib/Logger';
import { isAThemeDirectory } from './helper/utils';
import inquirer from 'inquirer';
import path from 'path';
import Env from './lib/Env';
import { getActiveContext } from './helper/utils';
import { THEME_COMMANDS, AUTHENTICATION_COMMANDS, ENVIRONMENT_COMMANDS } from './helper/constants';
const packageJSON = require('../package.json');

// asyncAction is a wrapper for all commands/actions to be executed after commander is done
// parsing the command input
export type Action = (...args: any[]) => void;
// Common Handler for all commands are executed from here
Command.prototype.asyncAction = async function (asyncFn: Action) {
    return this.action(async (...args: any[]) => {

        try {

            let parent = args[1].parent;
            while (true) {
                if (parent.parent) parent = parent.parent;
                else break;
            }

            if (parent._optionValues.verbose) {
                process.env.DEBUG = 'fdk';
                const log_file_path = process.cwd() + '/debug.log';
                if (fs.existsSync(log_file_path)) fs.removeSync(log_file_path);
            } else {
                process.env.DEBUG = 'false';
            }

            initializeLogger();
            const latest = await checkCliVersionAsync();
            Debug(`Latest version: ${latest} | ${semver.lt(packageJSON.version, latest)}`);

            const versionChange = semver.diff(packageJSON.version, latest);
            const major = versionChange === 'major';
            const color = major ? 'red' : 'green';

            const logMessage = `There is a new version of ${packageJSON.name} available (${latest}).
You are currently using ${packageJSON.name} ${packageJSON.version}.
Install fdk-cli globally using the package manager of your choice.
${major ? `\nNote: You need to update \`${packageJSON.name}\` first inorder to use it.` : ''}
Run \`npm install -g ${packageJSON.name}\` to get the latest version.`

            if (latest && semver.lt(packageJSON.version, latest)) {
                console.log(
                    boxen(
                        major ? chalk.red(logMessage) : chalk.green(logMessage),
                        { borderColor: color, padding: 1 }
                    )
                );

                if (semver.diff(packageJSON.version, latest) === 'major') {
                    process.exit(1);
                }
            }

            // check if user is logged in and context is set
            const envCommand = args[1].parent.name();
            const authCommand = args[1].name();
            const themeCommand = args[1].name();

            if (
                !(ENVIRONMENT_COMMANDS.findIndex(c => envCommand.includes(c)) !== -1) &&
                !configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
            ) {
                throw new CommandError(COMMON_LOG_MESSAGES.EnvNotSet);
            }
            if (
                !(AUTHENTICATION_COMMANDS.findIndex(c => authCommand.includes(c)) !== -1) &&
                !(ENVIRONMENT_COMMANDS.findIndex(c => envCommand.includes(c)) !== -1) &&
                !configStore.get(CONFIG_KEYS.COOKIE)
            ) {
                throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth);
            }
            if (THEME_COMMANDS.findIndex(c => themeCommand.includes(c)) !== -1) {
                const activeContextEnv = getActiveContext().env;
                if (activeContextEnv !== Env.getEnvValue()) {
                    throw new CommandError(COMMON_LOG_MESSAGES.contextMismatch);
                }
            }
            if (
                parent.args.includes('theme') &&
                !parent.args.includes('new') &&
                !parent.args.includes('init')
            ) {
                if (!isAThemeDirectory()) {
                    const answer = await promptForFDKFolder();
                    if (!answer) {
                        throw new CommandError(
                            ErrorCodes.INVALID_THEME_DIRECTORY.message,
                            ErrorCodes.INVALID_THEME_DIRECTORY.code
                        );
                    }
                }
            }
            await asyncFn(...args);
        } catch (err) {
            // TODO: Find better ways to consolidate error messages
            if (err instanceof CommandError) {
                const message = `${err.code} - ${err.message} `;
                Logger.error(message);
            } else {
                Logger.error(err);
            }
            Debug(err.stack);
            process.exit(1);
        }
    });
};

//Enable verbose logging

// Command.prototype.helpInformation = function () {
//     console.log(this);

//   return [''].join() + '\n';
// };

export async function init(programName: string) {
    //Setup commander instance
    program
        .name(programName)
        .version(packageJSON.version)
        .option('-v, --verbose', 'A value that can be increased');
    //register commands with commander instance
    registerCommands(program);
    //set API versios
    configStore.set(CONFIG_KEYS.API_VERSION, '1.0');
    // set default environment
    if(!configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)) configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, 'fynd')
    program.on('command:*', (subCommand: any) => {
        let msg = `"${subCommand.join(
            ' '
        )}" is not an fdk command. See "fdk --help" for the full list of commands.`;
        const availableCommands = program.commands.map((cmd: Command) => cmd.name());
        // finding the best match whose edit distance is less than 40% of their length.

        const suggestion = availableCommands.find(
            (commandName: string) => leven(commandName, subCommand[0]) < commandName.length * 0.4
        );
        if (suggestion) {
            msg = `"${subCommand}" is not an fdk command -- did you mean ${suggestion}?\n See "fdk --help" for the full list of commands.`;
        }
        console.log(chalk.yellow(msg));
    });
    // skip this for test cases
    return program;
}

export function parseCommands(){
    program.parse(process.argv);
    // Show help when no sub-command specified
    if (program.args.length === 0) {
        program.help();
    }
}

async function checkCliVersionAsync() {
    return await latestVersion(packageJSON.name, {version: '*'});
}

async function promptForFDKFolder() {
    const questions = [
        {
            type: 'confirm',
            name: 'showCreateFolder',
            message: '.fdk folder is missing. Do you wish to create it?',
        },
    ];
    const answers = await inquirer.prompt(questions);
    if (answers.showCreateFolder) {
        await fs.mkdir(path.join(process.cwd(), '.fdk'));
        return true;
    } else {
        return false;
    }
}
