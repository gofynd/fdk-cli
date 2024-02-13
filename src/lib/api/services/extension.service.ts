import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import ApiClient from '../ApiClient';
import CommandError, { ErrorCodes } from '../../CommandError';

// This is just been kept for backward compatibility as of now once v1.10.0 gets deployed on all cluster please remove this
type RegisterExtensionPaylaod = {
    name: string;
    extention_type: 'private' | 'public';
    base_url: string;
};

export type RegisterExtensionPayloadNew = {
    name: string;
    extention_type: 'private' | 'public';
    base_url: string;
    scope?: [string];
    logo?: Object;
    developed_by_name?: string;
    contact_email?: string
};

type UpdateLaunchURLPayload = {
    base_url: string;
};

export default {
// This is just been kept for backward compatibility as of now once v1.10.0 gets deployed on all cluster please remove this
    registerExtension: async (
        partner_access_token: string,
        data: RegisterExtensionPaylaod,
    ) => {
        try {
            let headers = getCommonHeaderOptions().headers;
            headers['x-partner-token'] = partner_access_token;

            let axiosOptions = Object.assign(
                {},
                {
                    data: data,
                },
                {
                    headers: headers,
                },
            );
            const response = await ApiClient.post(
                URLS.REGISTER_EXTENSION(),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    registerExtensionPartners: async (data: RegisterExtensionPayloadNew)=> {
        try {
            let headers = getCommonHeaderOptions().headers;
            data.scope = ['company/profile'];
            data.logo = { 
                small: 'https://res.cloudinary.com/dwzm9bysq/image/upload/v1566539375/production/media/store/logo/jwosxsgh9ufoucdxpm10.png',
                large: 'https://res.cloudinary.com/dwzm9bysq/image/upload/v1566539375/production/media/store/logo/jwosxsgh9ufoucdxpm10.png'
            }

            let axiosOptions = Object.assign(
                {},
                {
                    data: data,
                },
                {
                    headers: headers,
                },
            );
            const response = await ApiClient.post(
                URLS.REGISTER_EXTENSION_PARTNER(),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

// This is just been kept for backward compatibility as of now once v1.10.0 gets deployed on all cluster please remove this
    getExtensionData: async (
        extension_api_key: string,
        extension_api_secret: string,
        partner_access_token: string,
    ) => {
        try {
            const authorizationToken = Buffer.from(
                `${extension_api_key}:${extension_api_secret}`,
                'utf-8',
            ).toString('base64');

            let headers = getCommonHeaderOptions().headers;
            headers['Authorization'] = `Bearer ${authorizationToken}`;
            headers['x-partner-token'] = partner_access_token;

            let response = await ApiClient.get(
                URLS.GET_EXTENSION_DETAILS(extension_api_key),
                { headers: headers },
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getExtensionDataPartners: async (extension_api_key: string)=> {
        try {
            let headers = getCommonHeaderOptions().headers;
            let response = await ApiClient.get(
                URLS.GET_EXTENSION_DETAILS_PARTNERS(extension_api_key),
                { headers: headers },
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getExtensionDataUsingToken: async (
        extension_api_key: string,
        partner_access_token: string,
    ) => {
        try {
            let headers = getCommonHeaderOptions().headers;
            headers['x-partner-token'] = partner_access_token;

            let response = await ApiClient.get(
                URLS.GET_EXTENSION_DETAILS(extension_api_key),
                { headers: headers },
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
// This is just been kept for backward compatibility as of now once v1.10.0 gets deployed on all cluster please remove this
    updateLaunchURL: async (
        extension_api_key: string,
        partner_access_token: string,
        data: UpdateLaunchURLPayload,
    ) => {
        try {
            let headers = getCommonHeaderOptions().headers;
            headers['x-partner-token'] = partner_access_token;

            let axiosOptions = Object.assign(
                {},
                {
                    data: data,
                },
                {
                    headers: headers,
                },
            );

            let response = await ApiClient.patch(
                URLS.UPDATE_EXTENSION_DETAILS(extension_api_key),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateLaunchURLPartners: async (extension_api_key: string, data: UpdateLaunchURLPayload,) => {
        try {
            let headers = getCommonHeaderOptions().headers;

            let axiosOptions = Object.assign(
                {},
                {
                    data: data,
                },
                {
                    headers: headers,
                },
            );

            let response = await ApiClient.patch(
                URLS.UPDATE_EXTENSION_DETAILS_PARTNERS(extension_api_key),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOrganizationData: async (partner_access_token: string) => {
        try {
            let headers = getCommonHeaderOptions().headers;
            headers['x-partner-token'] = partner_access_token;

            let response = await ApiClient.get(
                URLS.GET_ORGANIZATION_DATA(partner_access_token),
                { headers: headers },
            );
            response.data.partner_access_token = partner_access_token;
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Preview URL
    getDevelopmentAccounts: async (page_no: number, page_size: number) => {
        try {
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_DEVELOPMENT_ACCOUNTS(page_no, page_size),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getLiveAccounts: async (page_no: number, page_size: number) => {
        try {
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_LIVE_ACCOUNTS(page_no, page_size),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getFyndPlatformVersion: async () => {
        try {
            let axiosOptions = Object.assign({}, getCommonHeaderOptions()); 
            let response = await ApiClient.get(URLS.FYND_PLATFORM_VERSION(), axiosOptions);
            return response.data;
        }
        catch(err){
            // We are not throwing error in case of route is not available or version is not available in cluster as it will block the user so for backward compatibility of new version to previous cluster in future need to remove it once 1.10.0 is over all cluster
            if(err.response.status === 400){
               return false;
            }
            if(err.response.status === 404){
                return false;
            }
            throw err; 
        }
    }
};
