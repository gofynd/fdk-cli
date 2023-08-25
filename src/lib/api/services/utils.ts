const packageJSON = require('../../../../package.json');
import configStore, { CONFIG_KEYS } from '../../Config';
import { AVAILABLE_ENVS } from '../../Env';

export const getCommonHeaderOptions = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-fp-cli': `${packageJSON.version}`,
        }
    };
};

export const getBaseURL = () => {
    const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    if(AVAILABLE_ENVS[currentEnv])
        return `https://${AVAILABLE_ENVS[currentEnv]}`;
    
    return `https://${currentEnv}`
};