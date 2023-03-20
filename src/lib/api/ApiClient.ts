import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Debug from '../Debug';
import CommandError, { ErrorCodes } from '../CommandError';
import { transformRequestOptions } from './../../helper/utils';
import { addSignatureFn } from './helper/interceptors';
import Curl from '../../helper/curl';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 300000; // 5 minute

// Axios Interceptors
axios.interceptors.request.use(
    function (request: AxiosRequestConfig) {
        try {
            //log curl request incase of debug
            const curl = new Curl(request);
            Debug('************** CURL **************');
            Debug(`METHOD: ${request?.method.toUpperCase()} | PATH: ${request?.url}`);
            Debug(curl.generateCommand());
            Debug('************** END OF CURL **************');
        } catch (error) {
            Debug(`Error Generating Curl: ${error}`);
        } finally {
            return request;
        }
    },
    function (error: AxiosError) {
        console.log('Error from the request interceptor', error);
    }
);
axios.interceptors.request.use(addSignatureFn({}));
axios.interceptors.response.use(
    function (response) {
        Debug(`Response status: ${response.status}`);
        Debug(`Response: ${JSON.stringify(response.data)}`);
        Debug(`Response Headers: ${JSON.stringify(response.headers)}`);
        return response; // IF 2XX then return response.data only
    },
    function (error) {
        // Request made and server responded
        if (error.response) {
            Debug(`Error Response  :  ${JSON.stringify(error.response.data)}`);
            throw new CommandError(`${error.response.data.message}`, ErrorCodes.API_ERROR.code);
        } else if (error.request) {
            // The request was made but no error.response was received
            throw new Error(
                'Not received response from the server, possibly some network issue, please retry!!'
            );
        } else {
            throw new Error('There was an issue in setting up the request, Please raise issue');
        }
    }
);

let axiosMisc = axios.create({
    withCredentials: false,
});

interface ApiEngine {
    head: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    get: (url: any, opt: any, config?: {}) => Promise<AxiosResponse<any>>;
    post: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    put: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    patch: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    del: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    getMisc: (url: any, opt: any) => Promise<AxiosResponse<any>>;
    postMisc: (url: any, opt: any) => Promise<AxiosResponse<any>>;
}
let engine: ApiEngine = {
    head: function (url, opt = {}) {
        return axios.head(url, {
            headers: opt.headers,
            params: opt.params,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
        });
    },
    get: function (url, opt = {}, config = {}) {
        return axios.get(url, {
            params: opt.params,
            headers: opt.headers,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
            ...config,
        });
    },
    post: function (url, opt = {}) {
        return axios.post(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    put: function (url, opt = {}) {
        return axios.put(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    patch: function (url, opt = {}) {
        return axios.patch(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    },
    del: function (url, opt = {}) {
        return axios.delete(url, {
            data: opt.data,
            headers: opt.headers,
            params: opt.params,
        });
    },
    getMisc: function (url, opt = {}) {
        return axiosMisc.get(url, {
            params: opt.params,
            headers: opt.headers,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
        });
    },
    postMisc: function (url, opt = {}) {
        return axiosMisc.post(url, opt.data, { headers: opt.headers });
    },
};

export default engine;
