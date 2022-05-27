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
exports.AVAILABLE_ENVS = void 0;
var Config_1 = __importStar(require("./Config"));
var CommandError_1 = __importDefault(require("./CommandError"));
var Logger_1 = __importStar(require("./Logger"));
var chalk_1 = __importDefault(require("chalk"));
exports.AVAILABLE_ENVS = {
    fyndx1: 'api.fyndx1.de',
    fyndx0: 'api.fyndx0.de',
    fynd: 'api.fynd.com',
    jiox2: 'api.jiox2.de',
    jiox1: 'api.jiox1.de',
    jiox0: 'api.jiox0.de',
    jioretailer: 'api.jioretailer.com',
    jioecomm: 'api.jioecomm.com',
    jiomarketx0: 'api.jiomarketx0.de',
    jiox5: 'api.jiox5.de',
    jiox3: 'api.jiox3.de',
    jiomartpartners: 'api.jiomartpartners.com',
    jmpx2: 'api.jmpx2.de',
    tirabeauty: 'api.tirabeauty.com',
    tirax2: 'api.tirax2.de',
};
var Env = /** @class */ (function () {
    function Env() {
    }
    Env.setEnv = function (ctx) {
        Config_1.default.set(Config_1.CONFIG_KEYS.CURRENT_ENV, {}); // active_context: {}
        Config_1.default.set(Config_1.CONFIG_KEYS.CURRENT_ENV_VALUE, ctx); // x0: {}
    };
    Env.getEnvValue = function () {
        return Config_1.default.get(Config_1.CONFIG_KEYS.CURRENT_ENV_VALUE);
    };
    Env.getEnv = function () {
        var ctx = Env.getEnvValue();
        if (!ctx) {
            throw new CommandError_1.default(Logger_1.COMMON_LOG_MESSAGES.EnvNotSet);
        }
        Logger_1.default.success("Active Environment: ".concat(chalk_1.default.bold(ctx)));
    };
    Env.listEnvs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ACTIVE_ENVIRONMENT_1;
            return __generator(this, function (_a) {
                try {
                    ACTIVE_ENVIRONMENT_1 = Env.getEnvValue();
                    Logger_1.default.info(chalk_1.default.bold.blueBright("List of supported Environments:"));
                    Object.keys(exports.AVAILABLE_ENVS).forEach(function (key) {
                        if (ACTIVE_ENVIRONMENT_1 && key.toString() === ACTIVE_ENVIRONMENT_1.toString()) {
                            Logger_1.default.info("".concat(chalk_1.default.bold.greenBright(key), "*"));
                        }
                        else {
                            Logger_1.default.info(chalk_1.default.bold.gray(key));
                        }
                    });
                }
                catch (error) {
                    throw new CommandError_1.default(error.message);
                }
                return [2 /*return*/];
            });
        });
    };
    Env.setNewEnvs = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (options.name) {
                        if (Object.keys(exports.AVAILABLE_ENVS).includes(options.name)) {
                            Env.setEnv(options.name);
                            Logger_1.default.success("Env set to: ".concat(chalk_1.default.bold(options.name)));
                        }
                        else {
                            Logger_1.default.error("*".concat(chalk_1.default.bold(options.name), "* environment is not supported.\n"));
                            Env.listEnvs();
                        }
                    }
                }
                catch (e) {
                    throw new CommandError_1.default(e.message);
                }
                return [2 /*return*/];
            });
        });
    };
    return Env;
}());
exports.default = Env;
