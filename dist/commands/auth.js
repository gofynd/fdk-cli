"use strict";
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
var inquirer_1 = __importDefault(require("inquirer"));
var Auth_1 = __importDefault(require("../lib/Auth"));
var CommandError_1 = __importDefault(require("../lib/CommandError"));
var Debug_1 = __importDefault(require("../lib/Debug"));
var validator_1 = __importDefault(require("validator"));
var AuthenticationHandler = function (options, command) { return __awaiter(void 0, void 0, void 0, function () {
    var email_1, mobile, password, questions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                email_1 = options.email, mobile = options.mobile, password = options.password;
                if (!(email_1 && email_1.length)) return [3 /*break*/, 5];
                if (!validator_1.default.isEmail(email_1)) {
                    throw new CommandError_1.default('Enter a valid email');
                }
                if (!!password) return [3 /*break*/, 2];
                questions = [
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Enter password',
                    },
                ];
                return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Auth_1.default.loginUserWithEmail(email_1, answers.password)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, Auth_1.default.loginUserWithEmail(email_1, password)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [3 /*break*/, 8];
            case 5:
                if (!(mobile && mobile.length)) return [3 /*break*/, 7];
                if (!validator_1.default.isMobilePhone(mobile, 'en-IN')) {
                    throw new CommandError_1.default('Enter a valid mobile number');
                }
                return [4 /*yield*/, Auth_1.default.loginInWithMobile(mobile)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                command.help();
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_1 = _a.sent();
                Debug_1.default(error_1.message);
                throw new CommandError_1.default(error_1.message, error_1 === null || error_1 === void 0 ? void 0 : error_1.code);
            case 10: return [2 /*return*/];
        }
    });
}); };
function context(program) {
    // List available context
    program
        .command('auth')
        .alias('login')
        .option('-e, --email [email]', 'Email ID')
        .option('-p, --password [email]', 'password')
        .option('-m, --mobile [mobile]', 'Mobile number')
        .description('Login user with email or phone number')
        .asyncAction(AuthenticationHandler);
    // Show active context
    program.command('logout').description('Logout user').asyncAction(Auth_1.default.logout);
    program.command('user').description('Prints logged in user information').asyncAction(Auth_1.default.getUserInfo);
}
exports.default = context;
