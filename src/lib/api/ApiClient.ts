import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import Debug from '../Debug';
import { transformRequestOptions } from './../../helper/utils';
import { addSignatureFn, responseErrorInterceptor, responseInterceptor } from './helper/interceptors';
import Curl from '../../helper/curl';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 300000; // 5 minute

let uninterceptedAxiosInstance = axios.create()
uninterceptedAxiosInstance.interceptors.request.use(addSignatureFn({}));
uninterceptedAxiosInstance.interceptors.response.use(responseInterceptor(), responseErrorInterceptor());

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
    },
    function (error: AxiosError) {
        console.log('Error from the request interceptor', error);
    }
);
axios.interceptors.request.use(addSignatureFn({}));
axios.interceptors.response.use(responseInterceptor(), responseErrorInterceptor());

let axiosMisc = axios.create({
    withCredentials: false,
});

interface Options {
    headers?: object
    params?: object
    data?: object
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
            paramsSerializer: params => {
                return transformRequestOptions(params);
            },
        });
    }

    get(url: string, opt: Options = {}, config = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.get(url, {
            params: opt.params,
            headers: opt.headers,
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
        });
    }

    put(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.put(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    }

    patch(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.patch(url, opt.data, {
            headers: opt.headers,
            params: opt.params,
        });
    }

    del(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return this.axiosInstance.delete(url, {
            data: opt.data,
            headers: opt.headers,
            params: opt.params,
        });
    }

    getMisc(url: string, opt: Options = {}): Promise<AxiosResponse<any>> {
        return axiosMisc.get(url, {
            params: opt.params,
            headers: opt.headers,
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
