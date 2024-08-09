import Logger from './Logger';
import { selectExtensionFromList } from '../helper/extension_utils';
import * as CONSTANTS from './../helper/constants';
import extensionService from './api/services/extension.service';
import ExtensionContext from './ExtensionContext';

export default class ExtensionEnv {
    public static async extensionEnvPullHandler(){
        const selected_extension = await selectExtensionFromList();
        const extension = await extensionService.getExtensionDataPartners(selected_extension.extension.id);
        
        const extensionContext = new ExtensionContext();
        extensionContext.setAll({
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_KEY]: extension._id,
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_API_SECRET]: extension.client_data.secret[0],
            [CONSTANTS.EXTENSION_CONTEXT.EXTENSION_BASE_URL]: extension.base_url
        });

        Logger.info('Successfully Pulled Extension context')
    }
}