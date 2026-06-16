import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosInstance,
    ResponseType,
    AxiosRequestHeaders,
} from 'axios';
import {
    isNetworkErrorCode,
    transformRequestOptions,
} from './../../helper/utils';
import Debug from '../Debug';
import axiosRetry from 'axios-retry';
import {
    addSignatureFn,
    responseErrorInterceptor,
    responseInterceptor,
} from './helper/interceptors';
import Curl from '../../helper/curl';
import Logger from '../Logger';
import { MAX_RETRY } from '../../helper/constants';
import https from 'https'
axios.defaults.withCredentials = true;
axios.defaults.timeout = 60000; // 1 minute

let uninterceptedAxiosInstance = axios.create();

const axiosRetryConfig = {
    retries: MAX_RETRY,
    retryCondition(error) {
        const shouldRetry = isNetworkErrorCode(error.code);
        return shouldRetry;
    },
    shouldResetTimeout: true,
    onRetry(retryCount, error, requestConfig) {
        Debug(error);
        Logger.warn(`\nRetrying........ (${retryCount}/${MAX_RETRY})`);
    },
    retryDelay(retryCount, error) {
        return 2000;
    },
};

uninterceptedAxiosInstance.interceptors.request.use(addSignatureFn({}));
uninterceptedAxiosInstance.interceptors.response.use((response) => {
    Debug(`Response status: ${response.status}`);
    Debug(`Response Headers: ${JSON.stringify(response.headers)}`);
    return response; // IF 2XX then return response.data only
}, responseErrorInterceptor());

// Axios Interceptors
axios.interceptors.request.use(
    function (request: InternalAxiosRequestConfig) {
        try {
            // log curl request incase of debug
            const curl = new Curl(request);
            Debug('************** CURL **************');
            Debug(
                `METHOD: ${request?.method.toUpperCase()} | PATH: ${request?.url}`,
            );
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
    },
);
axios.interceptors.request.use(addSignatureFn({}));
axios.interceptors.response.use(
    responseInterceptor(),
    responseErrorInterceptor(),
);

let axiosMisc = axios.create({
    withCredentials: false,
});

// add retry interceptor
axiosRetry(axios, axiosRetryConfig);
axiosRetry(uninterceptedAxiosInstance, axiosRetryConfig);
axiosRetry(axiosMisc, axiosRetryConfig);

interface Options {
    headers?: object;
    params?: object;
    data?: object;
    responseType?: ResponseType;
}

class ApiEngine {
    axiosInstance: AxiosInstance;

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance;
    }

    head(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.head(url, {
            headers: opt.headers as AxiosRequestHeaders,
            params: opt.params,
            responseType: opt.responseType,
            paramsSerializer: (params) => {
                return transformRequestOptions(params);
            },
        });
    }

    get(
        url: string,
        opt: Options = {},
        config = {},
    ): Promise<AxiosResponse<any>> {
        return this.axiosInstance.get(url, {
            params: opt.params,
            headers: opt.headers as AxiosRequestHeaders,
            responseType: opt.responseType,
            paramsSerializer: (params) => {
                return transformRequestOptions(params);
            },
            ...config,
        });
    }

    post(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.post(url, opt.data, {
            headers: opt.headers as AxiosRequestHeaders,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    put(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.put(url, opt.data, {
            headers: opt.headers as AxiosRequestHeaders,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    patch(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.patch(url, opt.data, {
            headers: opt.headers as AxiosRequestHeaders,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    del(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.delete(url, {
            data: opt.data,
            headers: opt.headers as AxiosRequestHeaders,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    getMisc(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return axiosMisc.get(url, {
            params: opt.params,
            headers: opt.headers as AxiosRequestHeaders,
            responseType: opt.responseType,
            paramsSerializer: (params) => {
                return transformRequestOptions(params);
            },
        });
    }

    postMisc(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return axiosMisc.post(url, opt.data, { headers: opt.headers as AxiosRequestHeaders });
    }
}

// use uninterceptedApiClient to skip curl print in verbose mode
export const uninterceptedApiClient = new ApiEngine(uninterceptedAxiosInstance);
// for backward compatibility of update extensions we need to hit and api and if throws error then need to call backward compatibility api and in that if the first api fails the response Error interceptor was getting triggered so thats why creating a new axios instance for such cases.
export const withoutErrorResponseInterceptorAxios = axios.create();
withoutErrorResponseInterceptorAxios.interceptors.request.use(
    addSignatureFn({}),
);
withoutErrorResponseInterceptorAxios.interceptors.response.use(
    responseInterceptor(),
);
export default new ApiEngine(axios);
