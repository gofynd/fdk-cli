import Logger from './Logger';
import { selectExtensionFromList } from '../helper/extension_utils';
import * as CONSTANTS from './../helper/constants';
import extensionService from './api/services/extension.service';
import ExtensionContext from './ExtensionContext';
import ConfigStore, { CONFIG_KEYS } from './Config';
import { LAUNCH_TYPES } from '../helper/constants';
import CommandError, { ErrorCodes } from './CommandError';

export default class ExtensionEnv {
    public static async extensionEnvPullHandler(){
        const selected_extension = await selectExtensionFromList();
        const extension = await extensionService.getExtensionDataPartners(selected_extension.extension.id);
        const existingExtensionType = ConfigStore.get(CONFIG_KEYS.EXTENSION_LAUNCH_TYPE);

        let message = '';
        const paymentLaunchType = LAUNCH_TYPES.PAYMENT.toLowerCase();
        if(
            existingExtensionType === paymentLaunchType 
            && extension.launch_type !== paymentLaunchType
        ){
            message = `Current extension boilerplate is of type ${existingExtensionType} and not compatible with ${extension.launch_type} launch type`;
        } else if (
            extension.launch_type === paymentLaunchType 
            && existingExtensionType !== paymentLaunchType
        ){
            message = `Current extension boilerplate is of type ${existingExtensionType} and not compatible with ${extension.launch_type} launch type`;
        }
        if(message){
            throw new CommandError(message, ErrorCodes.INVALID_EXTENSION_LAUNCH_TYPE.code);
        }

        ConfigStore.set(CONFIG_KEYS.EXTENSION_LAUNCH_TYPE, extension.launch_type.toLowerCase());
        
        const extensionContext = new ExtensionContext();
        extensionContext.setAll({
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY]: extension._id,
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET]: extension.client_data.secret[0],
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL]: extension.base_url
        });

        Logger.info('Successfully Pulled Extension context')
    }
}