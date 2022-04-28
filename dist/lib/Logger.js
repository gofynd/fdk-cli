"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMON_LOG_MESSAGES = exports.initializeLogger = void 0;
var chalk_1 = __importDefault(require("chalk"));
var winston_1 = require("winston");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, label = winston_1.format.label, printf = winston_1.format.printf;
var FDKCustomLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        success: 4,
    },
};
var consoleFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
    var levelUpper = level === null || level === void 0 ? void 0 : level.toUpperCase();
    switch (levelUpper) {
        case 'INFO':
            message = chalk_1.default.blue(message);
            break;
        case 'SUCCESS':
            message = chalk_1.default.green(message);
            break;
        case 'WARN':
            message = chalk_1.default.yellow(message);
            break;
        case 'ERROR':
            message = chalk_1.default.red(message);
            break;
        case 'DEBUG':
            message = chalk_1.default.cyan(chalk_1.default.dim(message));
            break;
        default:
            break;
    }
    return "".concat(message);
});
var fileFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
    return "".concat(timestamp, " : ").concat(message);
});
var transportsArr = [
    new winston_1.transports.Console({
        level: 'success',
    }),
];
var logger;
var initializeLogger = function () {
    if (process.env.DEBUG === 'fdk') {
        var fileTransporter = new winston_1.transports.File({
            filename: 'debug.log',
            level: 'success',
            format: combine(label({ label: '' }), timestamp(), winston_1.format.splat(), fileFormat),
        });
        transportsArr.push(fileTransporter);
    }
    logger = (0, winston_1.createLogger)({
        levels: FDKCustomLevels.levels,
        format: combine(label({ label: '' }), timestamp(), winston_1.format.splat(), consoleFormat),
        transports: transportsArr,
    });
};
exports.initializeLogger = initializeLogger;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(...args);
        logger.info(args.join(''));
    };
    Logger.success = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(chalk.green(...args));
        logger.log('success', args.join(''));
    };
    Logger.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(chalk.yellow(...args));
        logger.log('warn', args.join(''));
    };
    Logger.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(chalk.red(...args));
        logger.log('error', args.join(''));
    };
    Logger.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(chalk.blue(...args));
        logger.log('info', args.join(''));
    };
    Logger.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // console.log(`${chalk.cyan(...args)}`);
        logger.log('debug', args.join(''));
    };
    Logger.newLine = function () {
        console.log();
    };
    return Logger;
}());
exports.default = Logger;
exports.COMMON_LOG_MESSAGES = {
    EnvNotSet: "Please set environment to use this command.\n".concat(chalk_1.default.yellow('Use fdk envs to set environment')),
    ContextNotSet: "Please set context to use this command.\n".concat(chalk_1.default.yellow('Use fdk context-list to set context')),
    RequireAuth: "Please login to use this command.\n".concat(chalk_1.default.yellow('Use fdk login --help to know more')),
    contextMismatch: "Active Environment and Active Context Environment doesn't match.\n".concat(chalk_1.default.yellow('Use `fdk theme context-list` to switch context OR `fdk env set -n <env-name>` to change active environment.'))
};
