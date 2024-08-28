import './helper/instrument'
import program, { Command } from 'commander';
import leven from 'leven';
import latestVersion from 'latest-version';
import semver from 'semver';
import chalk from 'chalk';
import Logger, { COMMON_LOG_MESSAGES } from './lib/Logger';
import Debug from './lib/Debug';
import CommandError, { ErrorCodes } from './lib/CommandError';
import { registerCommands } from './commands';
import configStore, { CONFIG_KEYS } from './lib/Config';
import fs from 'fs-extra';
import { initializeLogger } from './lib/Logger';
import { isAThemeDirectory } from './helper/utils';
import { successBox } from './helper/formatter';
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

const current_version_message = 'Current version: ' + chalk.greenBright.bold(packageJSON.version);

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

const extraSentryDetails = () => {
    const auth_token = configStore.get(CONFIG_KEYS.AUTH_TOKEN);
    const organization = configStore.get(CONFIG_KEYS.ORGANIZATION);
    const user = {};
    if (auth_token?.current_user) {
        const activeEmail = auth_token.current_user?.emails?.find?.((e) => e.active && e.primary)?.email ?? 'Not primary email set';
        const name = `${auth_token.current_user?.first_name} ${auth_token.current_user?.last_name}`;
        user['name'] = name;
        user['email'] = activeEmail;
    }
    return {
        command: `fdk ${process?.argv?.slice?.(2)?.join(" ")}`,
        env: configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE),
        user,
        organization,
    }
}

// catch unhandled error
process.on('uncaughtException', (err: any) => {
    Logger.error(err);
    Debug(err.stack);
    if(err.code == 403 || err.code == 401){
        // if user is not authenticated, we won't send sentry
    } else{
        Sentry?.captureException?.(err, {
            extra: extraSentryDetails()
        });
    }
    process.exit(1);
});

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

            if (parent._optionValues.verbose || parent._optionValues.debug) {
                parent._optionValues.verbose = true;
                parent._optionValues.debug = true;
            }

            if (parent._optionValues.verbose) {
                process.env.DEBUG = 'fdk';
                const log_file_path = process.cwd() + '/debug.log';
                if (fs.existsSync(log_file_path)) fs.removeSync(log_file_path);
            }
            initializeLogger();

            // check in config if user have set certificate
            const CA_FILE = configStore.get(CONFIG_KEYS.CA_FILE);
            // if user shared certificate while executing the command
            const sharedInlineCert = process.env.FDK_EXTRA_CA_CERTS;

            // if shared inline then it should be exist
            if (sharedInlineCert && !fs.existsSync(sharedInlineCert)) {
                throw new CommandError('Provided file path does not exist.');
            }
            // inline CA will get priority
            if (!sharedInlineCert && CA_FILE) {
                process.env.FDK_EXTRA_CA_CERTS = CA_FILE;
            }

            if (process.env.FDK_EXTRA_CA_CERTS) {
                Logger.info(
                    `Using CA file from ${process.env.FDK_EXTRA_CA_CERTS}`,
                );
            }

            const disableSSL = () => {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                process.env.FDK_SSL_NO_VERIFY = 'true';
            };

            const sharedInlineNoSSL = process.env.FDK_SSL_NO_VERIFY;
            const STRICT_SSL = configStore.get(CONFIG_KEYS.STRICT_SSL);
            if (sharedInlineNoSSL == 'true') {
                disableSSL();
            }
            if (!sharedInlineNoSSL && STRICT_SSL == 'false') {
                disableSSL();
            }

            if (process.env.FDK_SSL_NO_VERIFY == 'true') {
                Logger.warn(`Bypassing SSL verification`);
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
                parent.args.includes('theme') &&
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
            // Add debug of current env for all commands excpet login command, we are showing updated env when login command runs
            if (args[1].name() !== 'auth') {
                const env = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
                Debug(`Current env: ${env}`);
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
                Sentry.captureException(err, {
                    // add extra details in sentry
                    extra: extraSentryDetails()
                });
                Logger.error(err);
            }
            let parent = args[1].parent;
            while (parent.parent) parent = parent.parent;
            if (!parent._optionValues.debug && !(err instanceof CommandError)) {
                Logger.warn(
                    `Pass ${chalk.yellowBright(
                        '--debug',
                    )} flag to get detailed logs, it will generate debug.log file in your current folder`,
                );
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
    await checkForLatestVersion();
    
    //Setup commander instance
    program
        .name(programName)
        .version(current_version_message, '-V, --version', 'Display the current fdk version')
        .option(
            '-v, --verbose',
            'Display detailed output for debugging purposes',
        )
        .option(
            '-d, --debug',
            'Display detailed output for debugging purposes',
        );

    program
    .command('version')
    .description('Display the current fdk version')
    .action(() => {
        console.log(current_version_message);
    });
    
    //register commands with commander instance
    registerCommands(program);
    //set API version
    configStore.set(CONFIG_KEYS.API_VERSION, '1.0');
    // set default environment
    const current_env = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);

    if (
        !current_env ||
        (!current_env.includes('api.') && !current_env.includes('api-'))
    )
        configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, 'api.fynd.com');

    // todo: remove this warning in future version of fdk cli, when everybody get used to set env by url.
    if (
        current_env &&
        !current_env.includes('api.') &&
        !current_env.includes('api-')
    ) {
        console.warn(
            chalk.yellow(
                `Warning: Resetting active environment to api.fynd.com. Please use \`fdk login --host <platform-host>\` to login with different environment. Ref: ${
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

async function checkForLatestVersion() {
    const latest = await checkCliVersionAsync();
    const isCurrentLessThanLatest = semver.lt(
        packageJSON.version,
        latest,
    );
    Debug(`Latest version: ${latest} | ${isCurrentLessThanLatest}`);

    const versionChange = semver.diff(packageJSON.version, latest);
    const allowed_update_version_types = ['patch', 'minor', 'major'];
    const major = versionChange === 'major';

    const logMessage = `A new version ${latest} is available!.
You have version ${packageJSON.version}.
Please update to the latest version.
${
major
? `\nNote: You need to update \`${packageJSON.name}\` first inorder to use it.`
: ''
}

Run the following command to upgrade:
\`npm install -g ${packageJSON.name}\``;

    if (
        allowed_update_version_types.includes(versionChange) &&
        isCurrentLessThanLatest
    ) {
        console.log(
            successBox({
                text: major
                    ? chalk.red(logMessage)
                    : chalk.green(logMessage),
            }),
        );

        if (major) {
            process.exit(1);
        }
    }
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
