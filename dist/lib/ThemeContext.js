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
var CommandError_1 = __importStar(require("./CommandError"));
var Logger_1 = __importDefault(require("./Logger"));
var utils_1 = require("../helper/utils");
var configuration_service_1 = __importDefault(require("./api/services/configuration.service"));
var theme_service_1 = __importDefault(require("./api/services/theme.service"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var inquirer_1 = __importDefault(require("inquirer"));
var ThemeContext = /** @class */ (function () {
    function ThemeContext() {
    }
    ThemeContext.addThemeContext = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var configObj, appConfig, themeConfig, context, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        Logger_1.default.warn('Validating token');
                        configObj = JSON.parse(utils_1.decodeBase64(options.token) || '{}');
                        if (!configObj || !configObj.theme_id)
                            throw new CommandError_1.default('Invalid token', CommandError_1.ErrorCodes.INVALID_INPUT.code);
                        return [4 /*yield*/, configuration_service_1.default.getApplicationDetails(configObj)];
                    case 1:
                        appConfig = (_a.sent()).data;
                        return [4 /*yield*/, theme_service_1.default.getThemeById({
                                application_id: appConfig._id,
                                company_id: appConfig.company_id,
                                theme_id: configObj.theme_id,
                            })];
                    case 2:
                        themeConfig = (_a.sent()).data;
                        context = {
                            name: options.name,
                            application_id: appConfig._id,
                            domain: appConfig.domain.name,
                            company_id: appConfig.company_id,
                            theme_id: themeConfig._id,
                        };
                        Logger_1.default.warn('Saving context');
                        return [4 /*yield*/, utils_1.createContext(context)];
                    case 3:
                        _a.sent();
                        Logger_1.default.warn('Setting as current context');
                        Logger_1.default.success('DONE');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        throw new CommandError_1.default(error_1.message, error_1.code);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ThemeContext.listThemeContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contextPath_1, contextJSON_1, contextObj_1, questions, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!utils_1.isAThemeDirectory()) {
                            throw new CommandError_1.default(CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.message, CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.code);
                        }
                        if (!utils_1.hasContext()) {
                            Logger_1.default.warn('No contexts available');
                            Logger_1.default.success("Add contexts using fdk context add");
                            return [2 /*return*/];
                        }
                        contextPath_1 = path_1.default.join(process.cwd(), '.fdk/context.json');
                        return [4 /*yield*/, fs_extra_1.default.readJSON(contextPath_1)];
                    case 1:
                        contextJSON_1 = _a.sent();
                        contextObj_1 = contextJSON_1.theme;
                        Logger_1.default.success("Active context: " + contextObj_1.active_context);
                        questions = [
                            {
                                type: 'list',
                                name: 'listContext',
                                message: 'Availabe Context. Select on to set active context',
                                choices: Object.keys(contextObj_1.contexts)
                            }
                        ];
                        return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) { return __awaiter(_this, void 0, void 0, function () {
                                var error_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            contextObj_1.active_context = answers.listContext;
                                            contextJSON_1.theme = contextObj_1;
                                            return [4 /*yield*/, fs_extra_1.default.writeJson(contextPath_1, contextJSON_1, {
                                                    spaces: 2
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_3 = _a.sent();
                                            throw new CommandError_1.default(error_3.message, error_3.code);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new CommandError_1.default(error_2.message, error_2.code);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ThemeContext;
}());
exports.default = ThemeContext;
