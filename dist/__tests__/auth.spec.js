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
var axios_1 = __importDefault(require("axios"));
var inquirer_1 = __importDefault(require("inquirer"));
var axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
var url_1 = require("../lib/api/services/url");
var Config_1 = __importStar(require("../lib/Config"));
var helper_1 = __importDefault(require("./helper"));
var fdk_1 = require("../fdk");
var data = require('./fixtures/email-login.json');
var mobileData = require('./fixtures/mobile-login.json');
jest.mock('inquirer');
var program;
describe('Auth Commands', function () {
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.parseAsync(['ts-node', './src/fdk.ts', 'env', 'set', '-n', 'fyndx0'])];
                case 1:
                    _a.sent();
                    program.commands.forEach(function (command) {
                        command._optionValues = {};
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var mock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, fdk_1.init)('fdk')];
                case 1:
                    program = _a.sent();
                    mock = new axios_mock_adapter_1.default(axios_1.default);
                    mock.onPost("".concat(url_1.URLS.SEND_OTP())).reply(200, mobileData);
                    mock.onPost("".concat(url_1.URLS.VERIFY_OTP())).reply(200, data, {
                        'set-cookie': [{ Name: 'Anurag Pandey123' }],
                    });
                    mock.onPost("".concat(url_1.URLS.LOGIN_USER())).reply(200, data, {
                        'set-cookie': [{ Name: 'Anurag Pandey' }],
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        Config_1.default.clear();
    });
    it('should successfully login user with email', function () { return __awaiter(void 0, void 0, void 0, function () {
        var inquirerMock, cookies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inquirerMock = (0, helper_1.default)(inquirer_1.default.prompt);
                    inquirerMock.mockResolvedValue({ password: '1234567' });
                    return [4 /*yield*/, program.parseAsync([
                            'ts-node',
                            './src/fdk.ts',
                            'login',
                            '-e',
                            'anuragpandey@gofynd.com',
                        ])];
                case 1:
                    _a.sent();
                    cookies = Config_1.default.get(Config_1.CONFIG_KEYS.COOKIE);
                    expect(cookies.Name).toMatch('Anurag Pandey');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should successfully login user with mobile', function () { return __awaiter(void 0, void 0, void 0, function () {
        var inquirerMock, cookies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inquirerMock = (0, helper_1.default)(inquirer_1.default.prompt);
                    inquirerMock.mockResolvedValue({ otp: '123456' });
                    return [4 /*yield*/, program.parseAsync(['ts-node', './src/fdk.ts', 'login', '-m', '7678880802'])];
                case 1:
                    _a.sent();
                    cookies = Config_1.default.get(Config_1.CONFIG_KEYS.COOKIE);
                    expect(cookies.Name).toMatch('Anurag Pandey123');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should successfully logout user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var inquirerMock, storeSize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.parseAsync([
                        'ts-node',
                        './src/fdk.ts',
                        'login',
                        '-e',
                        'anuragpandey@gofynd.com',
                    ])];
                case 1:
                    _a.sent();
                    inquirerMock = (0, helper_1.default)(inquirer_1.default.prompt);
                    inquirerMock.mockResolvedValue({ confirmLogout: 'Yes' });
                    return [4 /*yield*/, program.parseAsync(['ts-node', './src/fdk.ts', 'logout'])];
                case 2:
                    _a.sent();
                    storeSize = Config_1.default.size;
                    expect(storeSize).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should console active user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var currentUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.parseAsync([
                        'ts-node',
                        './src/fdk.ts',
                        'login',
                        '-e',
                        'anuragpandey@gofynd.com',
                    ])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, program.parseAsync(['ts-node', './src/fdk.ts', 'user'])];
                case 2:
                    _a.sent();
                    currentUser = Config_1.default.get(Config_1.CONFIG_KEYS.USER);
                    expect(currentUser.emails[0][0]).toMatch(data.user.emails[0][0]);
                    return [2 /*return*/];
            }
        });
    }); });
});
