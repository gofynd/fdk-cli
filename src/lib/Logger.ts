import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import winston from 'winston';
import configSore, { CONFIG_KEYS } from './Config';
const { printf } = format;
const packageJSON = require('../../package.json');

const extraLoggerFields = format((info) => {
    info.OS = process.platform; // returns 'darwin', 'linux', 'win32', 'aix', 'freebsd', 'openbsd', 'sunos'
    info.cli = `v${packageJSON.version}`;
    info.Node = process.version;
    info.Env = configSore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    info.Command = process.argv.slice(2).join(' ');
    return info;
});

const FDKCustomLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
};
const consoleFormat = printf(({ level, message }) => {
    const levelUpper = level?.toUpperCase();
    switch (levelUpper) {
        case 'INFO':
            message = chalk.blue(message);
            break;
        case 'WARN':
            message = chalk.yellow(message);
            break;
        case 'ERROR':
            message = chalk.red(message);
            break;
        case 'DEBUG':
            message = chalk.cyan(chalk.dim(message));
            break;
        default:
            break;
    }
    return `${message}`;
});
const transportsArr: any = [
    new transports.Console({
        level: 'debug',
    }),
];
let logger: winston.Logger;
export const initializeLogger = () => {
    if (process.env.DEBUG === 'fdk') {
        const fileTransporter = new transports.File({
            filename: 'debug.log',
            level: 'debug',
            format: format.combine(
                extraLoggerFields(),
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.errors({ stack: true }),
                format.splat(),
                format.json(),
            ),
        });
        transportsArr.push(fileTransporter);
    }
    logger = createLogger({
        levels: FDKCustomLevels.levels,
        format: consoleFormat,
        transports: transportsArr,
    });
};
export default class Logger {
    public static log(...args: any[]) {
        logger.info(args.join(''));
    }
    public static warn(...args: any[]) {
        logger.log('warn', args.join(''));
    }
    public static error(...args: any[]) {
        logger.log('error', args.join(''));
    }
    public static info(...args: any[]) {
        logger.log('info', args.join(''));
    }
    public static debug(...args: any[]) {
        if(process.env.DEBUG == 'fdk') {
            logger.log('debug', args.join(''));
        }
    }
}

export const COMMON_LOG_MESSAGES = {
    EnvNotSet: `Please set environment to use this command.\n${chalk.yellow(
        'Use fdk login --host <platform-host> to set environment',
    )}`,
    ContextNotSet: `Please set context to use this command.\n${chalk.yellow(
        'Use fdk context-list to set context',
    )}`,
    RequireAuth: `Please login to use this command.\n${chalk.yellow(
        `Use fdk login command for login`,
    )}`,
    contextMismatch: `Active Environment and Active Context Environment doesn't match.\n${chalk.yellow(
        'Use `fdk theme context-list` to switch context OR `fdk login --host <platform-host>` to login with different active environment.',
    )}`,
    invalidThemeType: `${chalk.yellow(`Theme Type can be react or vue2 only`)}`,
    ThemeTypeNotAvailableInContext: `${chalk.yellow(
        `Theme Type Not Available in Context and Package.json`,
    )}`,
    insufficientPermission: `You have insufficient permission to access the resource.\n${chalk.yellow(
        'Please contact your administrator to get access',
    )}`,
    companyAccessDenied: `Selected organization does not have access to the company.\n${chalk.yellow(
        'Please contact your administrator',
    )}`,
    accessToExtensions: `You don't have access to extensions.\n${chalk.yellow(
        'Please contact your administrator to get access',
    )}`,
    themesPermissionDenied: `You do not have permission to manage themes.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    extensionsPermissionDenied: `You do not have permission to access extensions.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    settingsPermissionDenied: `You do not have permission to change settings.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    teamPermissionDenied: `You do not have permission to manage the team.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    auditTrailPermissionDenied: `You do not have permission to view the audit trail.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    referralPermissionDenied: `You do not have permission to refer other users.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    developmentAccountsPermissionDenied: `You do not have permission to access development companies.\n${chalk.yellow(
        'Please contact your administrator to get access')}`,
    liveAccountsPermissionDenied: `You do not have permission to access live companies.\n${chalk.yellow(
        'Please contact your administrator to get access')}`
};
