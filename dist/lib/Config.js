"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_KEYS = void 0;
var Configstore = require('configstore');
var packageJSON = require('../../package.json');
exports.CONFIG_KEYS = {
    CURRENT_ENV: 'current_env',
    CURRENT_ENV_VALUE: 'current_env.value',
    USER: 'current_env.user',
    API_VERSION: 'api_version',
    COOKIE: 'current_env.cookie',
    COMPANY_ID: 'current_env.company_id'
};
// global config store - The config is stored in a JSON file located in $XDG_CONFIG_HOME or ~/.config
exports.default = new Configstore(packageJSON.name);
