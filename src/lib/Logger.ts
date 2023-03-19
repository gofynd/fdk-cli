import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
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
const consoleFormat = printf(({ level, message }) => {
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
const transportsArr: any = [
  new transports.Console({
    level: 'info',
  }),
];
let logger;
export const initializeLogger = () => {
  if (process.env.DEBUG === 'fdk') {
    const fileTransporter = new transports.File({
      filename: 'debug.log',
      level: 'debug',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    })
    transportsArr.push(fileTransporter);
  }
  logger = createLogger({
    levels: FDKCustomLevels.levels,
    format: consoleFormat,
    transports: transportsArr
  });
};
export default class Logger {
  public static log(...args: any[]) {
    logger.info(args.join(''));
  }
  public static success(...args: any[]) {
    logger.log('success', args.join(''));
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
    logger.log('debug', args.join(''));
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
