import { FOLDER_NAME } from '../helper/functions.utils';
import { CONTEXT_PATH, FDK_PATH } from '../helper/utils';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import fs from 'fs-extra';
import rimraf from 'rimraf';
const extContext = require("./fixtures/extension-context.json");

export default function mockFunction<T extends (...args: any[]) => any>(
    fn: T,
): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}

export function generateToken(decodedToken) {
    const currentDate = new Date();
    const expires_in = new Date(currentDate.getTime() + 30 * 60000); // add 30 mins expiry
    decodedToken.expires_in = expires_in;
    return new Buffer(`${JSON.stringify(decodedToken)}`).toString('base64');
}

export function setEnv() {
    configStore.set(CONFIG_KEYS.CURRENT_ENV, {}); // active_context: {}
    configStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, 'fyndx1');
}

export const loginUser = () => {
    setEnv();
    configStore.set(CONFIG_KEYS.AUTH_TOKEN, 'authtoken')
}

export const addExtensionContext = () => {
    fs.ensureDirSync(FDK_PATH());
    fs.writeJSONSync(CONTEXT_PATH(), extContext);
    configStore.set(CONFIG_KEYS.ORGANIZATION, extContext.extension.contexts[extContext.extension.active_context].organization_id);
}

export const cleanFunctionData = () => {
    rimraf.sync(FDK_PATH())
    rimraf.sync(FOLDER_NAME)
}