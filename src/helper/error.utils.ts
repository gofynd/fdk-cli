import Env from '../lib/Env';
import { getActiveContext } from './utils';

export function consolidateErrorMessage (status, statusText, message, route) {
    console.log('status  : ', status, statusText);
    console.log('message : ', message);
    console.log('path    : ', route);
    console.log('domain  : ', getActiveContext().domain || '');
    console.log('env     : ', Env.getEnvValue() || '');
    throw new Error();
}