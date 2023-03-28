import Configstore from "configstore";
const packageJSON = require('../../package.json');

export const CONFIG_KEYS = {
    CURRENT_ENV: 'current_env',
    NGROK_AUTHTOKEN: 'ngrok_authtoken',
    PARTNER_ACCESS_TOKEN: 'current_env.partner_access_token',
    CURRENT_ENV_VALUE: 'current_env.value',
    USER:'current_env.user',
    API_VERSION: 'api_version',
    COOKIE:'current_env.cookie',
    COMPANY_ID: 'current_env.company_id'
}

// global config store - The config is stored in a JSON file located in $XDG_CONFIG_HOME or ~/.config
export default new Configstore(packageJSON.name);