import Logger from '../lib/Logger';
import Env from '../lib/Env';

export function consolidateErrorMessage (status = '', statusText = '', method = '', message = '', path = '') {
    Logger.warn('status  : ', status, ' ', statusText);
    Logger.warn('method  : ', method);
    Logger.warn('message : ', message);
    Logger.warn('path    : ', path);
    Logger.warn('env     : ', Env.getEnvValue());
}