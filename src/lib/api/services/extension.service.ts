import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import ApiClient from '../ApiClient';

type RegisterExtensionPaylaod = {
    name: string;
    extention_type: 'private' | 'public';
    base_url: string;
};

type UpdateLaunchURLPayload = {
    base_url: string;
};

export default {
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

    // Extension Section
    getAllSections: async (
        extensionId: string,
    ) => {
        try {
            const company_id = 1;
            const axiosOption = Object.assign(
                {},
                {},
                {
                    headers: {
                        ...getCommonHeaderOptions().headers,
                        'x-application-data': '{}',
                        'x-user-data': '{}',
                    }
                },
            );
            const res = await ApiClient.get(
                URLS.GET_SECTIONS(company_id, extensionId),
                axiosOption,
            );
            return res.data;
        } catch (error) {
            throw error;
        }
    },
};
