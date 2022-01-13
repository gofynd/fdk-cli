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
var CommandError_1 = __importDefault(require("./CommandError"));
var Logger_1 = __importDefault(require("./Logger"));
var auth_service_1 = __importDefault(require("./api/services/auth.service"));
var inquirer_1 = __importDefault(require("inquirer"));
var Config_1 = __importStar(require("./Config"));
var Auth = /** @class */ (function () {
    function Auth() {
    }
    Auth.loginUserWithEmail = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var requestData, _a, data, headers, cookie, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        requestData = {
                            username: email,
                            password: password,
                            'g-recaptcha-response': '_skip_',
                        };
                        return [4 /*yield*/, auth_service_1.default.loginUserWithEmailAndPassword(requestData)];
                    case 1:
                        _a = _b.sent(), data = _a.data, headers = _a.headers;
                        delete data.user.roles;
                        cookie = headers['set-cookie'][0];
                        Config_1.default.set(Config_1.CONFIG_KEYS.COOKIE, cookie);
                        Config_1.default.set(Config_1.CONFIG_KEYS.USER, data.user);
                        Logger_1.default.success('User logged in successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        throw new CommandError_1.default(error_1.message, error_1.code);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Auth.loginInWithMobile = function (mobile) {
        return __awaiter(this, void 0, void 0, function () {
            var requestData_1, otpResponse_1, questions, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        requestData_1 = {
                            mobile: mobile,
                            country_code: '91',
                            'g-recaptcha-response': '_skip_',
                        };
                        return [4 /*yield*/, auth_service_1.default.sendMobileOtp(requestData_1)];
                    case 1:
                        otpResponse_1 = (_a.sent()).data;
                        questions = [
                            {
                                type: 'text',
                                name: 'otp',
                                message: 'Enter OTP: ',
                            },
                        ];
                        return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, data, headers, cookie;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (answers.otp.length !== 6)
                                                throw new CommandError_1.default('Invalid OTP');
                                            requestData_1.otp = answers.otp;
                                            requestData_1.request_id = otpResponse_1.request_id;
                                            return [4 /*yield*/, auth_service_1.default.verifyMobileOtp(requestData_1)];
                                        case 1:
                                            _a = _b.sent(), data = _a.data, headers = _a.headers;
                                            delete data.user.roles;
                                            cookie = headers['set-cookie'][0];
                                            Config_1.default.set(Config_1.CONFIG_KEYS.COOKIE, cookie);
                                            Config_1.default.set(Config_1.CONFIG_KEYS.USER, data.user);
                                            Logger_1.default.success('User logged in successfully');
                                            return [2 /*return*/];
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
    Auth.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var questions, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        questions = [
                            {
                                type: 'list',
                                name: 'confirmLogout',
                                message: 'Are you sure you want to logout',
                                choices: ['Yes', 'No'],
                            },
                        ];
                        return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) {
                                if (answers.confirmLogout === 'Yes') {
                                    Config_1.default.clear();
                                    Logger_1.default.success("User logged out successfully");
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        throw new CommandError_1.default(error_3.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Auth.getUserInfo = function () {
        var _a;
        try {
            var user = Config_1.default.get(Config_1.CONFIG_KEYS.USER);
            var activeEmail = ((_a = user.emails.find(function (e) { return e.active && e.primary; })) === null || _a === void 0 ? void 0 : _a.email) || 'Not primary email set';
            Logger_1.default.success("Name: " + user.first_name + " " + user.last_name);
            Logger_1.default.success("Email: " + activeEmail);
        }
        catch (error) {
            throw new CommandError_1.default(error.message);
        }
    };
    return Auth;
}());
exports.default = Auth;
