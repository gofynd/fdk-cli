import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import { Transports } from 'winston/lib/winston/transports';
const { combine, timestamp, label, printf } = format;
const FDKCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    success: 4,
  },
};
const consoleFormat = printf(({ level, message, label, timestamp }) => {
  const levelUpper = level?.toUpperCase();
  switch (levelUpper) {
    case 'INFO':
      message = chalk.blue(message);
      break;
    case 'SUCCESS':
      message = chalk.green(message);
      break;
    case 'WARN':
      message = chalk.yellow(message);
      break;
    case 'ERROR':
      message = chalk.red(message);
      break;
    case 'DEBUG':
      message = chalk.cyan(chalk.dim(message))
      break;
    default:
      break;
  }
  return `${message}`;
});
const fileFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} : ${message}`;
});
const transportsArr: any = [
  new transports.Console({
    level: 'success',
  }),
];
let logger;
export const initializeLogger = () => {
  if (process.env.DEBUG === 'fdk') {
    const fileTransporter = new transports.File({
      filename: 'debug.log',
      level: 'success',
      format: combine(label({ label: '' }), timestamp(), format.splat(), fileFormat),
    });
    transportsArr.push(fileTransporter);
  }
  logger = createLogger({
    levels: FDKCustomLevels.levels,
    format: combine(label({ label: '' }), timestamp(), format.splat(), consoleFormat),
    transports: transportsArr,
  });
};
export default class Logger {
  public static log(...args: any[]) {
    // console.log(...args);
    logger.info(args.join(''));
  }
  public static success(...args: any[]) {
    // console.log(chalk.green(...args));
    logger.log('success', args.join(''));
  }
  public static warn(...args: any[]) {
    // console.log(chalk.yellow(...args));
    logger.log('warn', args.join(''));
  }
  public static error(...args: any[]) {
    // console.log(chalk.red(...args));
    logger.log('error', args.join(''));
  }
  public static info(...args: any[]) {
    // console.log(chalk.blue(...args));
    logger.log('info', args.join(''));
  }
  public static debug(...args: any[]) {
    // console.log(`${chalk.cyan(...args)}`);
    logger.log('debug', args.join(''));
  }
  public static newLine() {
    console.log();
  }
}

export const COMMON_LOG_MESSAGES = {
  EnvNotSet: `Please set environment to use this command.\n${chalk.yellow(
    'Use fdk envs to set environment'
  )}`,
  ContextNotSet: `Please set context to use this command.\n${chalk.yellow(
    'Use fdk context-list to set context'
  )}`,
  RequireAuth: `Please login to use this command.\n${chalk.yellow(
    'Use fdk login --help to know more'
  )}`,
  contextMismatch: `Active Environment and Active Context Environment doesn't match.\n${chalk.yellow(
    'Use `fdk theme context-list` to switch context OR `fdk env set -n <env-name>` to change active environment.'
  )}`
};
