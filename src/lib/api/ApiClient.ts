import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance, ResponseType } from 'axios';
import axiosRetry from 'axios-retry';
import Debug from '../Debug';
import { isNetworkErrorCode, transformRequestOptions } from './../../helper/utils';
import { addSignatureFn, responseErrorInterceptor, responseInterceptor } from './helper/interceptors';
import Curl from '../../helper/curl';
import chalk from 'chalk';
import { MAX_RETRY } from '../../helper/constants';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 300000; // 5 minute

let uninterceptedAxiosInstance = axios.create()

const axiosRetryConfig = { 
    retries: MAX_RETRY,
    retryCondition(error) {
        const shouldRetry = isNetworkErrorCode(error.code)
        return shouldRetry
    },
    shouldResetTimeout: true,
    onRetry(retryCount, error, requestConfig) {
        console.log(chalk.red("\nNetworking fluctuation detected. Retrying request..."));
    },
    retryDelay(retryCount, error) {
        return 2000
    }
}

uninterceptedAxiosInstance.interceptors.request.use(addSignatureFn({}));
uninterceptedAxiosInstance.interceptors.response.use(
    (response) => {
        Debug(`Response status: ${response.status}`);
        Debug(`Response Headers: ${JSON.stringify(response.headers)}`);
        return response; // IF 2XX then return response.data only
    }, 
    responseErrorInterceptor()
);

// Axios Interceptors
axios.interceptors.request.use(
    function (request: AxiosRequestConfig) {
        try {
            // log curl request incase of debug
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
    }
);
axios.interceptors.request.use(addSignatureFn({}));
axios.interceptors.response.use(responseInterceptor(), responseErrorInterceptor());

let axiosMisc = axios.create({
    withCredentials: false,
});

// add retry interceptor
axiosRetry(axios, axiosRetryConfig);
axiosRetry(uninterceptedAxiosInstance, axiosRetryConfig);
axiosRetry(axiosMisc, axiosRetryConfig);

interface Options {
    headers?: object
    params?: object
    data?: object
    responseType?: ResponseType
}

class ApiEngine {
    axiosInstance: AxiosInstance;

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance;
    }

    head(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.head(url, {
            headers: opt.headers,
            params: opt.params,
            responseType: opt.responseType,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
        });
    }

    get(url: string, opt: Options = {}, config = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.get(url, {
            params: opt.params,
            headers: opt.headers,
            responseType: opt.responseType,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
            ...config,
        });
    }

    post(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.post(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    put(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.put(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    patch(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.patch(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    del(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.delete(url, {
            data: opt.data,
            headers: opt.headers,
            params: opt.params,
            responseType: opt.responseType,
        });
    }

    getMisc(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return axiosMisc.get(url, {
            params: opt.params,
            headers: opt.headers,
            responseType: opt.responseType,
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
        });
    }
    
    postMisc(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return axiosMisc.post(url, opt.data, { headers: opt.headers });
    }
}

// use uninterceptedApiClient to skip curl print in verbose mode
export const uninterceptedApiClient = new ApiEngine(uninterceptedAxiosInstance);
export default new ApiEngine(axios);
