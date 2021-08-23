const Configstore = require('configstore');
const packageJSON = require('../../package.json');

export const CONFIG_KEYS = {
    CURRENT_ENV: 'current_env',
    CURRENT_ENV_VALUE: 'current_env.value',
    USER:'current_env.user',
    API_VERSION: 'api_version',
    COOKIE:'current_env.cookie'
}

// global config store - The config is stored in a JSON file located in $XDG_CONFIG_HOME or ~/.config
export default new Configstore(packageJSON.name);