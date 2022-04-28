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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLS = exports.BASE_URL = void 0;
var Config_1 = __importStar(require("../../Config"));
var url_join_1 = __importDefault(require("url-join"));
var Env_1 = require("../../Env");
var currentEnv = Config_1.default.get(Config_1.CONFIG_KEYS.CURRENT_ENV_VALUE) || 'x0';
var apiVersion = Config_1.default.get(Config_1.CONFIG_KEYS.API_VERSION) || '1.0';
exports.BASE_URL = "https://".concat(Env_1.AVAILABLE_ENVS[currentEnv]);
var THEME_URL = exports.BASE_URL + '/service/platform/theme/v' + apiVersion;
var AUTH_URL = exports.BASE_URL + '/service/panel/authentication/v' + apiVersion;
var CONFIGURATION_URL = exports.BASE_URL + '/service/platform/configuration/v' + apiVersion;
var ASSET_URL = exports.BASE_URL + '/service/platform/assets/v' + apiVersion;
var MIXMASTER_PLTM_URL = exports.BASE_URL + '/service/platform/partners/v' + apiVersion;
exports.URLS = {
    // AUTHENTICATION
    LOGIN_USER: function () {
        return (0, url_join_1.default)(AUTH_URL, '/auth/login/password');
    },
    SEND_OTP: function () {
        return (0, url_join_1.default)(AUTH_URL, '/auth/login/mobile/otp/send');
    },
    VERIFY_OTP: function () {
        return (0, url_join_1.default)(AUTH_URL, '/auth/login/mobile/otp/verify');
    },
    OAUTH_TOKEN: function (company_id) {
        return (0, url_join_1.default)(AUTH_URL, "/company/".concat(company_id, "/oauth/staff/token"));
    },
    //CONFIGURATION
    GET_APPLICATION_DETAILS: function (application_id, company_id) {
        return (0, url_join_1.default)(CONFIGURATION_URL, "/company/".concat(company_id, "/application/").concat(application_id));
    },
    //ASSETS
    START_UPLOAD_FILE: function (application_id, company_id, namespaces) {
        return (0, url_join_1.default)(ASSET_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/namespaces/").concat(namespaces, "/upload/start"));
    },
    COMPLETE_UPLOAD_FILE: function (application_id, company_id, namespaces) {
        return (0, url_join_1.default)(ASSET_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/namespaces/").concat(namespaces, "/upload/complete"));
    },
    //THEME
    CREATE_THEME: function (application_id, company_id) {
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id));
    },
    THEME_BY_ID: function (application_id, company_id, theme_id) {
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/").concat(theme_id));
    },
    PUBLISH_THEME: function (application_id, company_id, theme_id) {
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/").concat(theme_id, "/publish"));
    },
    UNPUBLISH_THEME: function (application_id, company_id, theme_id) {
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/").concat(theme_id, "/unpublish"));
    },
    GET_APPLICATION_THEME_LIBRARY: function (application_id, company_id, theme_id) {
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/").concat(theme_id, "/library"));
    },
    // AVAILABLE_PAGE
    AVAILABLE_PAGE: function (application_id, company_id, theme_id, page_value) {
        if (page_value === void 0) { page_value = 'page'; }
        return (0, url_join_1.default)(THEME_URL, "/company/".concat(company_id, "/application/").concat(application_id, "/").concat(theme_id, "/").concat(page_value));
    },
    SETUP_COMPANY: function (company_id) {
        return (0, url_join_1.default)(MIXMASTER_PLTM_URL, "/company/".concat(company_id, "/setup"));
    },
};
