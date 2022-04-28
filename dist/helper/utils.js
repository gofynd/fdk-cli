"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.pageNameModifier = exports.sortString = exports.asyncForEach = exports.hasContext = exports.isAThemeDirectory = exports.createContext = exports.getActiveContext = exports.decodeBase64 = exports.transformRequestOptions = void 0;
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var CommandError_1 = __importStar(require("../lib/CommandError"));
var Logger_1 = require("../lib/Logger");
var Config_1 = __importStar(require("../lib/Config"));
var file_utils_1 = require("./file.utils");
var FDK_PATH = function () { return path_1.default.join(process.cwd(), '.fdk'); };
var CONTEXT_PATH = function () { return path_1.default.join(FDK_PATH(), 'context.json'); };
var DEFAULT_CONTEXT = { theme: { active_context: '', contexts: {} }, partners: {} };
var transformRequestOptions = function (params) {
    var options = '';
    var _loop_1 = function (key) {
        if (typeof params[key] !== 'object' && params[key]) {
            var encodeVal = encodeURIComponent(params[key]);
            options += "".concat(key, "=").concat(encodeVal, "&");
        }
        else if (Array.isArray(params[key])) {
            params[key].forEach(function (el) {
                var encodeVal = encodeURIComponent(el);
                options += "".concat(key, "=").concat(encodeVal, "&");
            });
        }
        else if (typeof params[key] === 'object' && params[key]) {
            options += (0, exports.transformRequestOptions)(params[key]);
        }
    };
    for (var key in params) {
        _loop_1(key);
    }
    return options ? options.slice(0, -1) : options;
};
exports.transformRequestOptions = transformRequestOptions;
var decodeBase64 = function (encodedString) {
    return Buffer.from(encodedString, 'base64').toString('utf8');
};
exports.decodeBase64 = decodeBase64;
var getActiveContext = function () {
    if ((0, exports.isAThemeDirectory)() && (0, exports.hasContext)()) {
        var contextData = fs_extra_1.default.readJSONSync(CONTEXT_PATH());
        if (!contextData)
            throw new CommandError_1.default("".concat(CommandError_1.ErrorCodes.INVALID_CONTEXT.message, ".\n").concat(Logger_1.COMMON_LOG_MESSAGES.ContextNotSet), CommandError_1.ErrorCodes.INVALID_CONTEXT.code);
        return contextData.theme.contexts[contextData.theme.active_context];
    }
    throw new CommandError_1.default(CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.message, CommandError_1.ErrorCodes.INVALID_THEME_DIRECTORY.code);
};
exports.getActiveContext = getActiveContext;
var createContext = function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var contextsData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!(0, exports.isAThemeDirectory)())
                    (0, file_utils_1.createDirectory)(FDK_PATH());
                if (!(0, exports.hasContext)()) {
                    fs_extra_1.default.writeJSON(CONTEXT_PATH(), DEFAULT_CONTEXT);
                }
                return [4 /*yield*/, fs_extra_1.default.readJSON(CONTEXT_PATH())];
            case 1:
                contextsData = _a.sent();
                if (contextsData.theme.contexts[context.name])
                    throw new CommandError_1.default('Context with the same name already exists');
                context.env = Config_1.default.get(Config_1.CONFIG_KEYS.CURRENT_ENV_VALUE);
                contextsData.theme.active_context = context.name;
                contextsData.theme.contexts[context.name] = context;
                return [4 /*yield*/, fs_extra_1.default.writeJSON(CONTEXT_PATH(), contextsData, {
                        spaces: 2,
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                throw new CommandError_1.default(error_1.message, error_1.code);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createContext = createContext;
var isAThemeDirectory = function () {
    return fs_extra_1.default.existsSync(FDK_PATH());
};
exports.isAThemeDirectory = isAThemeDirectory;
var hasContext = function () {
    return fs_extra_1.default.existsSync(CONTEXT_PATH()) && fs_extra_1.default.readJSONSync(CONTEXT_PATH()).theme.contexts;
};
exports.hasContext = hasContext;
var asyncForEach = function (array, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var index;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = 0;
                _a.label = 1;
            case 1:
                if (!(index < array.length)) return [3 /*break*/, 4];
                return [4 /*yield*/, callback(array[index], index, array)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                index++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.asyncForEach = asyncForEach;
function sortString(str) {
    var arr = str.split('');
    arr.sort();
    return arr.join('');
}
exports.sortString = sortString;
var pageNameModifier = function (page) {
    var pageArr = page.split('-');
    var res = '';
    pageArr.forEach(function (p) {
        var _a;
        res += ((_a = p[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + p.substring(1) + ' ';
    });
    return res.trim();
};
exports.pageNameModifier = pageNameModifier;
