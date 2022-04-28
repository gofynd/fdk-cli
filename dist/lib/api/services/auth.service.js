"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ApiClient_1 = __importDefault(require("../ApiClient"));
var url_1 = require("./url");
var utils_1 = require("./utils");
exports.default = {
    loginUserWithEmailAndPassword: function (data) {
        var axiosOption = Object.assign({}, {
            data: data
        }, (0, utils_1.getCommonHeaderOptions)());
        return ApiClient_1.default.post(url_1.URLS.LOGIN_USER(), axiosOption);
    },
    sendMobileOtp: function (data) {
        var axiosOption = Object.assign({}, {
            data: data
        }, (0, utils_1.getCommonHeaderOptions)());
        return ApiClient_1.default.post(url_1.URLS.SEND_OTP(), axiosOption);
    },
    verifyMobileOtp: function (data) {
        var axiosOption = Object.assign({}, {
            data: data
        }, (0, utils_1.getCommonHeaderOptions)());
        return ApiClient_1.default.post(url_1.URLS.VERIFY_OTP(), axiosOption);
    },
    getOauthToken: function (company_id) {
        var axiosOption = Object.assign({}, (0, utils_1.getCommonHeaderOptions)());
        return ApiClient_1.default.get(url_1.URLS.OAUTH_TOKEN(company_id), axiosOption);
    }
};
