"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ApiClient_1 = __importDefault(require("../ApiClient"));
var url_1 = require("./url");
var utils_1 = require("./utils");
exports.default = {
    setupCompany: function (company_id, request_id, data) {
        if (data === void 0) { data = {}; }
        var axiosOption = Object.assign({
            params: {
                request_id: request_id
            }
        }, {
            data: data
        }, (0, utils_1.getCommonHeaderOptions)());
        return ApiClient_1.default.post(url_1.URLS.SETUP_COMPANY(company_id), axiosOption);
    },
};
