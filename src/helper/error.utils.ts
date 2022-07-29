import Logger from '../lib/Logger';
import Env from '../lib/Env';
import { getActiveContext } from './utils';

export function consolidateErrorMessage (status = '', statusText = '', method = '', message = '', route = '') {
    Logger.warn('status  : ', status, ' ', statusText);
    Logger.warn('method  : ', method);
    Logger.warn('message : ', message);
    Logger.warn('path    : ', route);
    Logger.warn('domain  : ', getActiveContext().domain);
    Logger.warn('env     : ', Env.getEnvValue());
    throw new Error();
}