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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var combineURLs = require('axios/lib/helpers/combineURLs');
var isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL');
var transformRequestOptions = require('../../../helper/utils').transformRequestOptions;
var sign = require('./signature').sign;
var auth_service_1 = __importDefault(require("../services/auth.service"));
var Config_1 = __importStar(require("../../Config"));
var Logger_1 = __importDefault(require("../../Logger"));
function getTransformer(config) {
    var transformRequest = config.transformRequest;
    if (transformRequest) {
        if (typeof transformRequest === 'function') {
            return transformRequest;
        }
        else if (transformRequest.length) {
            return transformRequest[0];
        }
    }
    throw new Error('Could not get default transformRequest function from Axios defaults');
}
function getCompanyId(path) {
    var pathArr = path.split('/');
    var companyId = pathArr[pathArr.findIndex(function (p) { return p === 'company'; }) + 1];
    return Number(companyId);
}
function interceptorFn(options) {
    var _this = this;
    return function (config) { return __awaiter(_this, void 0, void 0, function () {
        var url_1, _a, host, pathname, search, data, headers, method, params, cookie, company_id, data_1, error_1, queryParam, transformRequest, transformedData, common, _delete, get, head, post, put, patch, headersToSign, signingOptions, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    if (!config.url) {
                        throw new Error('No URL present in request config, unable to sign request');
                    }
                    url_1 = config.url;
                    if (config.baseURL && !isAbsoluteURL(config.url)) {
                        url_1 = combineURLs(config.baseURL, config.url);
                    }
                    _a = new URL(url_1), host = _a.host, pathname = _a.pathname, search = _a.search;
                    if (!pathname.startsWith('/service')) return [3 /*break*/, 6];
                    data = config.data, headers = config.headers, method = config.method, params = config.params;
                    cookie = Config_1.default.get(Config_1.CONFIG_KEYS.COOKIE);
                    config.headers['Cookie'] = cookie || '';
                    if (!pathname.startsWith('/service/platform')) return [3 /*break*/, 5];
                    company_id = getCompanyId(pathname);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, auth_service_1.default.getOauthToken(company_id)];
                case 2:
                    data_1 = (_b.sent()).data || {};
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    Logger_1.default.error("Failed to fetch OAuth token");
                    Config_1.default.delete(Config_1.CONFIG_KEYS.USER);
                    Config_1.default.delete(Config_1.CONFIG_KEYS.COOKIE);
                    throw new Error(error_1);
                case 4:
                    if (data_1.access_token) {
                        config.headers['Authorization'] = 'Bearer ' + data_1.access_token;
                    }
                    _b.label = 5;
                case 5:
                    queryParam = '';
                    if (params && Object.keys(params).length) {
                        if (search && search.trim() !== '') {
                            queryParam = "&".concat(transformRequestOptions(params));
                        }
                        else {
                            queryParam = "?".concat(transformRequestOptions(params));
                        }
                    }
                    transformRequest = getTransformer(config);
                    transformedData = transformRequest(data, headers);
                    common = headers.common, _delete = headers.delete, get = headers.get, head = headers.head, post = headers.post, put = headers.put, patch = headers.patch, headersToSign = __rest(headers, ["common", "delete", "get", "head", "post", "put", "patch"]);
                    signingOptions = {
                        method: method && method.toUpperCase(),
                        host: host,
                        path: pathname + search + queryParam,
                        body: transformedData,
                        headers: headersToSign,
                    };
                    sign(signingOptions);
                    // console.log(signingOptions);
                    // config.headers = signingOptions.headers;
                    config.headers['x-fp-date'] = signingOptions.headers['x-fp-date'];
                    config.headers['x-fp-signature'] = signingOptions.headers['x-fp-signature'];
                    _b.label = 6;
                case 6: return [2 /*return*/, config];
                case 7:
                    error_2 = _b.sent();
                    throw new Error(error_2);
                case 8: return [2 /*return*/];
            }
        });
    }); };
}
module.exports = {
    addSignatureFn: interceptorFn,
};
