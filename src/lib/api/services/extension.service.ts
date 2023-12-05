import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import ApiClient from '../ApiClient';

type RegisterExtensionPayload = {
    name: string;
    extention_type: 'private' | 'public';
    base_url: string;
    scope?: [string]
    logo?: Object
};

type UpdateLaunchURLPayload = {
    base_url: string;
};

export default {
    registerExtension: async (
        data: RegisterExtensionPayload,
    ) => {
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
                URLS.REGISTER_EXTENSION(),
                axiosOptions,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getExtensionData: async (
        extension_api_key: string,
    ) => {
        try {
            let headers = getCommonHeaderOptions().headers;

            let response = await ApiClient.get(
                URLS.GET_EXTENSION_DETAILS(extension_api_key),
                { headers: headers },
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateLaunchURL: async (
        extension_api_key: string,
        data: UpdateLaunchURLPayload,
    ) => {
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
                URLS.UPDATE_EXTENSION_DETAILS(extension_api_key),
                axiosOptions,
            );
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
};
