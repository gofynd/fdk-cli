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
var CommandError_1 = __importDefault(require("./CommandError"));
var Logger_1 = __importDefault(require("./Logger"));
var company_setup_service_1 = __importDefault(require("./api/services/company_setup.service"));
var inquirer_1 = __importDefault(require("inquirer"));
var Config_1 = __importStar(require("./Config"));
var CompanySetup = /** @class */ (function () {
    function CompanySetup() {
    }
    CompanySetup.setupDevelopmentCompany = function () {
        return __awaiter(this, void 0, void 0, function () {
            var questions, request_id_1, next_step, prompt_message_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        questions = [
                            {
                                type: 'text',
                                name: 'company_id',
                                message: 'Enter Company ID: ',
                            },
                        ];
                        next_step = void 0;
                        prompt_message_1 = 'Creating Brand';
                        return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!answers.company_id)
                                                throw new CommandError_1.default('Invalid Company ID');
                                            Config_1.default.set(Config_1.CONFIG_KEYS.COMPANY_ID, answers.company_id);
                                            return [4 /*yield*/, CompanySetup.setupComponent(answers.company_id, request_id_1, prompt_message_1)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new CommandError_1.default(error_1.message, error_1.code);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CompanySetup.setupComponent = function (company_id, request_id, prompt_message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, headers;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger_1.default.info(prompt_message);
                        return [4 /*yield*/, company_setup_service_1.default.setupCompany(company_id, request_id)];
                    case 1:
                        _a = _b.sent(), data = _a.data, headers = _a.headers;
                        Logger_1.default.success(data.message);
                        if (data.next_step) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, CompanySetup.setupComponent(company_id, data.request_id, data.prompt_message)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }, data.cli_wait_time || 100);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return CompanySetup;
}());
exports.default = CompanySetup;
