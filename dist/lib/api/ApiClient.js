"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var Debug_1 = __importDefault(require("../Debug"));
var CommandError_1 = require("../CommandError");
var utils_1 = require("./../../helper/utils");
var addSignatureFn = require('./helper/interceptors').addSignatureFn;
var curl_1 = __importDefault(require("../../helper/curl"));
axios_1.default.defaults.withCredentials = true;
axios_1.default.interceptors.request.use(addSignatureFn({}));
var axiosMisc = axios_1.default.create({
    withCredentials: false,
    timeout: 60000
});
var engine = {
    head: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axios_1.default.head(url, {
            headers: opt.headers,
            params: opt.params,
            paramsSerializer: function (params) {
                return (0, utils_1.transformRequestOptions)(params);
            },
        });
    },
    get: function (url, opt, config) {
        if (opt === void 0) { opt = {}; }
        if (config === void 0) { config = {}; }
        return axios_1.default.get(url, __assign({ params: opt.params, headers: opt.headers, paramsSerializer: function (params) {
                return (0, utils_1.transformRequestOptions)(params);
            } }, config));
    },
    post: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axios_1.default.post(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    put: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axios_1.default.put(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    patch: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axios_1.default.patch(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    del: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axios_1.default.delete(url, {
            data: opt.data,
            headers: opt.headers,
            params: opt.params,
        });
    },
    getMisc: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axiosMisc.get(url, {
            params: opt.params,
            headers: opt.headers,
            paramsSerializer: function (params) {
                return (0, utils_1.transformRequestOptions)(params);
            },
        });
    },
    postMisc: function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return axiosMisc.post(url, opt.data, { headers: opt.headers });
    },
};
axios_1.default.interceptors.response.use(function (response) {
    var _a, _b;
    (0, Debug_1.default)('************** CURL **************');
    (0, Debug_1.default)("METHOD: ".concat((_a = response === null || response === void 0 ? void 0 : response.config) === null || _a === void 0 ? void 0 : _a.method, " | PATH: ").concat((_b = response === null || response === void 0 ? void 0 : response.request) === null || _b === void 0 ? void 0 : _b.path, " | CODE: ").concat(response === null || response === void 0 ? void 0 : response.status));
    //log curl request incase of debug
    var curl = new curl_1.default(response.config);
    (0, Debug_1.default)(curl.generateCommand());
    (0, Debug_1.default)('************** END OF CURL **************');
    (0, Debug_1.default)('\n');
    return response;
}, function (error) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    (0, Debug_1.default)('************** CURL **************');
    (0, Debug_1.default)("METHOD: ".concat((_a = error === null || error === void 0 ? void 0 : error.config) === null || _a === void 0 ? void 0 : _a.method, " | PATH: ").concat((_b = error === null || error === void 0 ? void 0 : error.request) === null || _b === void 0 ? void 0 : _b.path, " | CODE: ").concat((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.status));
    //log curl request incase of debug
    var curl = new curl_1.default(error.config);
    (0, Debug_1.default)(curl.generateCommand());
    (0, Debug_1.default)('************** END OF CURL **************');
    (0, Debug_1.default)('\n');
    if ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) {
        error.message = error.response.data.error;
    }
    else if ((_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.message) {
        error.message = (_j = (_h = error.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.message;
    }
    error.code = CommandError_1.ErrorCodes.API_ERROR.code;
    return Promise.reject(error);
});
// axios.interceptors.request.use(addSignatureFn({}));
// axios.interceptors.request.use(addOAuthToken({}));
exports.default = engine;
