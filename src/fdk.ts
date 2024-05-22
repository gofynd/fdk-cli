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
import {
    THEME_COMMANDS,
    AUTHENTICATION_COMMANDS,
    ENVIRONMENT_COMMANDS,
    EXTENSION_COMMANDS,
    PARTNER_COMMANDS,
    ALL_THEME_COMMANDS,
} from './helper/constants';
import { getPlatformUrls } from './lib/api/services/url';
import * as Sentry from '@sentry/node';
const packageJSON = require('../package.json');

const sentryFilePath = path.join(__dirname, './sentry.json');
const sentryDSN = fs.existsSync(sentryFilePath)
    ? fs.readJsonSync(sentryFilePath)['dsn']
    : undefined;
if (sentryDSN) {
    Sentry.init({
        dsn: sentryDSN,
        release: packageJSON.version,
    });
}

async function checkTokenExpired(auth_token) {
    if (!auth_token) return true;
    const { expiry_time } = auth_token;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > expiry_time) {
        return true;
    } else {
        return false;
    }
}

// asyncAction is a wrapper for all commands/actions to be executed after commander is done
// parsing the command input
export type Action = (...args: any[]) => void;
// Common Handler for all commands are executed from here
Command.prototype.asyncAction = async function (asyncFn: Action) {
    return this.action(async (...args: any[]) => {
        try {
            console.log('Version: ', packageJSON.version);
            let parent = args[1].parent;
            while (true) {
                if (parent.parent) parent = parent.parent;
                else break;
            }

            if (parent._optionValues.verbose || parent._optionValues.debug) {
                parent._optionValues.verbose = true;
                parent._optionValues.debug = true;
            }

            if (parent._optionValues.verbose) {
                process.env.DEBUG = 'fdk';
                const log_file_path = process.cwd() + '/debug.log';
                if (fs.existsSync(log_file_path)) fs.removeSync(log_file_path);
            } else {
                process.env.DEBUG = 'false';
            }
            
            // check in config if user have set certificate
            const CA_FILE = configStore.get(CONFIG_KEYS.CA_FILE)
            // if user shared certificate while executing the command
            const sharedInlineCert = process.env.FDK_EXTRA_CA_CERTS;
            
            // if shared inline then it should be exist
            if(sharedInlineCert && !fs.existsSync(sharedInlineCert)){
                throw new CommandError("Provided file path does not exist.");
            }
            // inline CA will get priority
            if (!sharedInlineCert && CA_FILE) {
                process.env.FDK_EXTRA_CA_CERTS = CA_FILE;
            }

            if(process.env.FDK_EXTRA_CA_CERTS){
                Logger.log(chalk.blue(`Using CA file from ${process.env.FDK_EXTRA_CA_CERTS}`))
            }

            const sharedInlineNoSSL = process.env.FDK_SSL_NO_VERIFY;
            const STRICT_SSL = configStore.get(CONFIG_KEYS.STRICT_SSL) || true;
            if(STRICT_SSL == false || sharedInlineNoSSL == 'true'){
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                process.env.FDK_SSL_NO_VERIFY = 'true';
            }

            if(process.env.FDK_SSL_NO_VERIFY){
                Logger.log(chalk.blue(`Bypassing SSL verification`))
            }

            initializeLogger();
            const latest = await checkCliVersionAsync();
            const isCurrentLessThanLatest = semver.lt(
                packageJSON.version,
                latest,
            );
            Debug(`Latest version: ${latest} | ${isCurrentLessThanLatest}`);

            const versionChange = semver.diff(packageJSON.version, latest);
            const allowed_update_version_types = ['patch', 'minor', 'major'];
            const major = versionChange === 'major';
            const color = major ? 'red' : 'green';

            const logMessage = `There is a new version of ${
                packageJSON.name
            } available (${latest}).
You are currently using ${packageJSON.name} ${packageJSON.version}.
Install fdk-cli globally using the package manager of your choice.
${
    major
        ? `\nNote: You need to update \`${packageJSON.name}\` first inorder to use it.`
        : ''
}
Run \`npm install -g ${packageJSON.name}\` to get the latest version.`;

            if (
                allowed_update_version_types.includes(versionChange) &&
                isCurrentLessThanLatest
            ) {
                console.log(
                    boxen(
                        major ? chalk.red(logMessage) : chalk.green(logMessage),
                        { borderColor: color, padding: 1 },
                    ),
                );

                if (major) {
                    process.exit(1);
                }
            }

            // check if user is logged in and context is set
            const envCommand = args[1].parent.name();
            const authCommand = args[1].name();
            const themeCommand = args[1].name();
            const extensionCommand = args[1].name();
            const partnerCommand = args[1].name();

            if (
                !(
                    ENVIRONMENT_COMMANDS.findIndex((c) =>
                        envCommand.includes(c),
                    ) !== -1
                ) &&
                !configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
            ) {
                throw new CommandError(COMMON_LOG_MESSAGES.EnvNotSet);
            }
            if (
                !(
                    AUTHENTICATION_COMMANDS.findIndex((c) =>
                        authCommand.includes(c),
                    ) !== -1
                ) &&
                !(
                    ENVIRONMENT_COMMANDS.findIndex((c) =>
                        envCommand.includes(c),
                    ) !== -1
                ) &&
                !(
                    EXTENSION_COMMANDS.findIndex((c) =>
                        extensionCommand.includes(c),
                    ) !== -1
                ) &&
                !(
                    PARTNER_COMMANDS.findIndex((c) =>
                        partnerCommand.includes(c),
                    ) !== -1
                ) &&
                !configStore.get(CONFIG_KEYS.AUTH_TOKEN)
            ) {
                throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth);
            }
            if (
                ALL_THEME_COMMANDS.findIndex((c) =>
                    themeCommand.includes(c),
                ) !== -1 ||
                THEME_COMMANDS.findIndex((c) => themeCommand.includes(c)) !== -1
            ) {
                const isTokenExpired = await checkTokenExpired(
                    configStore.get(CONFIG_KEYS.AUTH_TOKEN),
                );
                if (isTokenExpired)
                    throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth);
            }
            if (
                THEME_COMMANDS.findIndex((c) => themeCommand.includes(c)) !== -1
            ) {
                const activeContextEnv = getActiveContext().env;
                // need to check if env is set by url [Ex. Env.getEnvValue() will give api.fynd.com | Here activeContextEnv is "fynd"]
                if (
                    activeContextEnv !== Env.getEnvValue() &&
                    !Env.getEnvValue().includes(activeContextEnv)
                ) {
                    throw new CommandError(COMMON_LOG_MESSAGES.contextMismatch);
                }
            }
            if (parent.args.includes('theme')) {
                if (!isAThemeDirectory()) {
                    const answer = await promptForFDKFolder();
                    if (!answer) {
                        throw new CommandError(
                            ErrorCodes.INVALID_THEME_DIRECTORY.message,
                            ErrorCodes.INVALID_THEME_DIRECTORY.code,
                        );
                    }
                }
            }
            await asyncFn(...args);
        } catch (err) {
            // TODO: Error reporting from user logic can be added here

            // TODO: Find better ways to consolidate error messages
            if (err instanceof CommandError) {
                const message = `${err.code} - ${err.message} `;
                Logger.error(message);
            } else if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
                const message = `${ErrorCodes.VPN_ISSUE.code} - ${ErrorCodes.VPN_ISSUE.message} `;
                Logger.error(message);
            } else {
                // on report call sentry capture exception
                Sentry.captureException(err);
                Logger.error(err);
            }
            Debug(err);
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
        .option(
            '-v, --verbose',
            'Display detailed output for debugging purposes',
        )
        .option(
            '-d, --debug',
            'Display detailed output for debugging purposes',
        );

    //register commands with commander instance
    registerCommands(program);
    //set API versios
    configStore.set(CONFIG_KEYS.API_VERSION, '1.0');
    // set default environment
    const current_env = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);

    if (!current_env || (!current_env.includes('api.') && !current_env.includes('api-')))
        configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, 'api.fynd.com');

    // todo: remove this warning in future version of fdk cli, when everybody get used to set env by url.
    if (current_env && !current_env.includes('api.') && !current_env.includes('api-')) {
        console.warn(
            chalk.yellow(
                `Warning: Reseting active environment to api.fynd.com. Please use \`fdk env set -u <env-api-url>\` to change active environment. Ref: ${
                    getPlatformUrls().partners
                }/help/docs/partners/themes/vuejs/command-reference#environment-commands-1`,
            ),
        );
        process.exit(0);
    }

    program.on('command:*', (subCommand: any) => {
        let msg = `"${subCommand.join(
            ' ',
        )}" is not an fdk command. See "fdk --help" for the full list of commands.`;
        const availableCommands = program.commands.map((cmd: Command) =>
            cmd.name(),
        );
        // finding the best match whose edit distance is less than 40% of their length.

        const suggestion = availableCommands.find(
            (commandName: string) =>
                leven(commandName, subCommand[0]) < commandName.length * 0.4,
        );
        if (suggestion) {
            msg = `"${subCommand}" is not an fdk command -- did you mean ${suggestion}?\n See "fdk --help" for the full list of commands.`;
        }
        console.log(chalk.yellow(msg));
    });
    // skip this for test cases
    return program;
}

export function parseCommands() {
    program.parse(process.argv);
    // Show help when no sub-command specified
    if (program.args.length === 0) {
        program.help();
    }
}

async function checkCliVersionAsync() {
    return await latestVersion(packageJSON.name, { version: '*' });
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
