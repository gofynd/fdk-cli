"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var commander_1 = __importStar(require("commander"));
var leven_1 = __importDefault(require("leven"));
var latest_version_1 = __importDefault(require("latest-version"));
var semver_1 = __importDefault(require("semver"));
var boxen_1 = __importDefault(require("boxen"));
var chalk_1 = __importDefault(require("chalk"));
var Logger_1 = __importStar(require("./lib/Logger"));
var Debug_1 = __importDefault(require("./lib/Debug"));
var CommandError_1 = __importStar(require("./lib/CommandError"));
var commands_1 = require("./commands");
var Config_1 = __importStar(require("./lib/Config"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var Logger_2 = require("./lib/Logger");
var utils_1 = require("./helper/utils");
var inquirer_1 = __importDefault(require("inquirer"));
var path_1 = __importDefault(require("path"));
var Env_1 = __importDefault(require("./lib/Env"));
var utils_js_1 = require("./helper/utils.js");
var constants_1 = require("./helper/constants");
var packageJSON = require('../package.json');
// Common Handler for all commands are executed from here
commander_1.Command.prototype.asyncAction = function (asyncFn) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, this.action(function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return __awaiter(_this, void 0, void 0, function () {
                        var parent_1, log_file_path, latest, versionChange, major, color, logMessage, envCommand_1, authCommand_1, themeCommand_1, activeContextEnv, answer, err_1, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    parent_1 = args[1].parent;
                                    while (true) {
                                        if (parent_1.parent)
                                            parent_1 = parent_1.parent;
                                        else
                                            break;
                                    }
                                    if (parent_1._optionValues.verbose) {
                                        process.env.DEBUG = 'fdk';
                                        log_file_path = process.cwd() + '/debug.log';
                                        if (fs_extra_1.default.existsSync(log_file_path))
                                            fs_extra_1.default.removeSync(log_file_path);
                                    }
                                    else {
                                        process.env.DEBUG = 'false';
                                    }
                                    Logger_2.initializeLogger();
                                    return [4 /*yield*/, checkCliVersionAsync()];
                                case 1:
                                    latest = _a.sent();
                                    Debug_1.default("Latest version: " + latest + " | " + semver_1.default.lt(packageJSON.version, latest));
                                    versionChange = semver_1.default.diff(packageJSON.version, latest);
                                    major = versionChange === 'major';
                                    color = major ? 'red' : 'green';
                                    logMessage = "There is a new version of " + packageJSON.name + " available (" + latest + ").\nYou are currently using " + packageJSON.name + " " + packageJSON.version + ".\nInstall fdk-cli globally using the package manager of your choice.\n" + (major ? "\nNote: You need to update `" + packageJSON.name + "` first inorder to use it." : '') + "\nRun `npm install -g " + packageJSON.name + "` to get the latest version.";
                                    if (latest && semver_1.default.lt(packageJSON.version, latest)) {
                                        console.log(boxen_1.default(major ? chalk_1.default.red(logMessage) : chalk_1.default.green(logMessage), { borderColor: color, padding: 1 }));
                                        if (semver_1.default.diff(packageJSON.version, latest) === 'major') {
                                            process.exit(1);
                                        }
                                    }
                                    envCommand_1 = args[1].parent.name();
                                    authCommand_1 = args[1].name();
                                    themeCommand_1 = args[1].name();
                                    if (!(constants_1.ENVIRONMENT_COMMANDS.findIndex(function (c) { return envCommand_1.includes(c); }) !== -1) &&
                                        !Config_1.default.get(Config_1.CONFIG_KEYS.CURRENT_ENV_VALUE)) {
                                        throw new CommandError_1.default(Logger_1.COMMON_LOG_MESSAGES.EnvNotSet);
                                    }
                                    if (!(constants_1.AUTHENTICATION_COMMANDS.findIndex(function (c) { return authCommand_1.includes(c); }) !== -1) &&
                                        !(constants_1.ENVIRONMENT_COMMANDS.findIndex(function (c) { return envCommand_1.includes(c); }) !== -1) &&
                                        !Config_1.default.get(Config_1.CONFIG_KEYS.COOKIE)) {
                                        throw new CommandError_1.default(Logger_1.COMMON_LOG_MESSAGES.RequireAuth);
                                    }
                                    if (constants_1.THEME_COMMANDS.findIndex(function (c) { return themeCommand_1.includes(c); }) !== -1) {
                                        activeContextEnv = utils_js_1.getActiveContext().env;
                                        if (activeContextEnv !== Env_1.default.getEnvValue()) {
                                            throw new CommandError_1.default(Logger_1.COMMON_LOG_MESSAGES.contextMismatch);
                                        }
                                    }
                                    if (!(parent_1.args.includes('theme') &&
                                        !parent_1.args.includes('new') &&
                                        !parent_1.args.includes('init'))) return [3 /*break*/, 3];
                                    if (!!utils_1.isAThemeDirectory()) return [3 /*break*/, 3];
                                    return [4 /*yield*/, promptForFDKFolder()];
                                case 2:
                                    answer = _a.sent();
                                    if (!answer) {
                                        throw new CommandError_1.default(CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.message, CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.code);
                                    }
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, asyncFn.apply(void 0, args)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _a.sent();
                                    // TODO: Find better ways to consolidate error messages
                                    if (err_1 instanceof CommandError_1.default) {
                                        message = err_1.code + " - " + err_1.message + " ";
                                        Logger_1.default.error(message);
                                    }
                                    else {
                                        Logger_1.default.error(err_1);
                                    }
                                    Debug_1.default(err_1.stack);
                                    process.exit(1);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                })];
        });
    });
};
//Enable verbose logging
// Command.prototype.helpInformation = function () {
//     console.log(this);
//   return [''].join() + '\n';
// };
function init(programName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //Setup commander instance
            commander_1.default
                .name(programName)
                .version(packageJSON.version)
                .option('-v, --verbose', 'A value that can be increased');
            //register commands with commander instance
            commands_1.registerCommands(commander_1.default);
            //set API versios
            Config_1.default.set(Config_1.CONFIG_KEYS.API_VERSION, '1.0');
            commander_1.default.on('command:*', function (subCommand) {
                var msg = "\"" + subCommand.join(' ') + "\" is not an fdk command. See \"fdk --help\" for the full list of commands.";
                var availableCommands = commander_1.default.commands.map(function (cmd) { return cmd.name(); });
                // finding the best match whose edit distance is less than 40% of their length.
                var suggestion = availableCommands.find(function (commandName) { return leven_1.default(commandName, subCommand[0]) < commandName.length * 0.4; });
                if (suggestion) {
                    msg = "\"" + subCommand + "\" is not an fdk command -- did you mean " + suggestion + "?\n See \"fdk --help\" for the full list of commands.";
                }
                console.log(chalk_1.default.yellow(msg));
            });
            commander_1.default.parse(process.argv);
            // Show help when no sub-command specified
            if (commander_1.default.args.length === 0) {
                commander_1.default.help();
            }
            return [2 /*return*/];
        });
    });
}
exports.init = init;
function checkCliVersionAsync() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, latest_version_1.default(packageJSON.name)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function promptForFDKFolder() {
    return __awaiter(this, void 0, void 0, function () {
        var questions, answers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    questions = [
                        {
                            type: 'confirm',
                            name: 'showCreateFolder',
                            message: '.fdk folder is missing. Do you wish to create it?',
                        },
                    ];
                    return [4 /*yield*/, inquirer_1.default.prompt(questions)];
                case 1:
                    answers = _a.sent();
                    if (!answers.showCreateFolder) return [3 /*break*/, 3];
                    return [4 /*yield*/, fs_extra_1.default.mkdir(path_1.default.join(process.cwd(), '.fdk'))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3: return [2 /*return*/, false];
            }
        });
    });
}
