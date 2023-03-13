import Logger from '../lib/Logger';
import Env from '../lib/Env';

export function consolidateErrorMessage (status = '', statusText = '', method = '', message = '', path = '') {
    
    // Sanity check to make sure values are not null. If status value is not present then high possibility of absence of other values as well. (Change with any other approach if required.)
    if(typeof status === 'number') {
        Logger.warn('status  : ', status, ' ', statusText);
        Logger.warn('method  : ', method);
        Logger.warn('message : ', message);
        Logger.warn('path    : ', path);
        Logger.warn('env     : ', Env.getEnvValue());
    }
}