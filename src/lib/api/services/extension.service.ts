import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import ApiClient from '../ApiClient';
import {
    CreateFunctionPayload, 
    UpdateFunctionPayload, 
    UpdateFunctionVersionPayload, 
    FunctionResponse,
    RunTestPayload,
    FunctionTestModel,
    FunctionTest,
    UpdateTestResponse
} from '../../../helper/functions.types';

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

    getExtensionFunctionsList: async(extension_id: string, page_no?: number, page_size?: number)=> {
        try{
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_EXTENSION_FUNCTIONS(extension_id, page_no, page_size),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err;
        }
    },

    getFunctionBySlug: async (extension_id: string, slug: string): Promise<[true, FunctionResponse] | [false]> => {
        try{
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_FUNCTION_BY_SLUG(extension_id, slug),
                axiosOptions
            );
            return [true, response.data];
        }
        catch(err){
            if(err?.response?.status === 404){
                return [false];
            }
            throw err;
        }
    },

    getFunctionsAllEvent: async () => {
        try{
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_FUNCTIONS_ALL_EVENTS(),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err;
        }
    },

    createExtensionFunction: async (data: CreateFunctionPayload, extension_id: string): Promise<FunctionResponse> => {
        try{
            let axiosOptions = Object.assign({},{data: data }, getCommonHeaderOptions());
            let response = await ApiClient.post(
                URLS.GET_EXTENSION_FUNCTIONS(extension_id),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err; 
        }
    },

    updateExtensionFunction: async (data: UpdateFunctionPayload, extension_id: string, function_id: string) => {
        try{
            let axiosOptions = Object.assign({},{data: data }, getCommonHeaderOptions());
            let response = await ApiClient.put(
                URLS.GET_FUNCTION_BY_SLUG(extension_id, function_id),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err; 
        }
    },

    updateFunctionVersion: async (data: UpdateFunctionVersionPayload, extension_id: string, function_id: string, version_id: string) => {
        try{
            let axiosOptions = Object.assign({},{data: data }, getCommonHeaderOptions());
            let response = await ApiClient.put(
                URLS.FUNCTION_VERSION_BY_VERSION_ID(extension_id, function_id, version_id),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err; 
        }
    },

    getFunctionVersionByVersionId: async (extension_id: string, function_id: string, version_id: string) => {
        try{
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.FUNCTION_VERSION_BY_VERSION_ID(extension_id, function_id, version_id),
                axiosOptions
            );
            return response.data;
        }
        catch(err){
            throw err; 
        }
    },

    getExtension: async (extension_api_key: string) => {
        try {
            let axiosOptions = Object.assign({}, getCommonHeaderOptions());
            let response = await ApiClient.get(
                URLS.GET_EXTENSION(extension_api_key),
                axiosOptions
            )
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    runFunctionTests: async (extension_id: string, function_id: string, data: RunTestPayload) => {
        try {
            const axiosOptions = Object.assign({}, {data: data}, getCommonHeaderOptions());
            const response = await ApiClient.post(
                URLS.RUN_FUNCTION_TEST(extension_id, function_id),
                axiosOptions
            )
            return response.data;
        } catch(err) {
            throw err;
        }
    },

    getAllFunctionTests: async (extension_id: string, function_id: string): Promise<FunctionTestModel[]> => {
        try {
            const axiosOptions = Object.assign({}, getCommonHeaderOptions());
            const response = await ApiClient.get(
                URLS.ALL_FUNCTION_TESTS(extension_id, function_id, 10000, 1),
                axiosOptions
            )
        return response.data.items;
        } catch(error) {
            throw error;
        }
    },

    updateFunctionTests: async (data: FunctionTest[], extension_id: string, function_id: string): Promise<UpdateTestResponse> => {
        try {
            const axiosOptions = Object.assign({}, {data: data}, getCommonHeaderOptions());
            const response = await ApiClient.post(
                URLS.UPDATE_BULK_TESTS(extension_id, function_id),
                axiosOptions
            )
            return response.data
        } catch(error) {
            throw error;
        }
    },
};
