import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Debug from '../Debug';
import { ErrorCodes } from '../CommandError';
import { transformRequestOptions } from './../../helper/utils';
const { addSignatureFn } = require('./helper/interceptors');
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
      Debug('\n')

    } catch (error) {
      Debug(`Error Generating Curl: ${error}`);
    } finally {
      return request;
    }
  },
  function (error: AxiosError) {
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.response?.data?.message) {
      error.message = error.response?.data?.message;
    }
    error.code = ErrorCodes.API_ERROR.code;
    return Promise.reject(error);
  }
);
axios.interceptors.request.use(addSignatureFn({}));

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
      timeout: opt.timeout || 0,
      paramsSerializer: params => {
        return transformRequestOptions(params);
      },
    });
  },
  get: function (url, opt = {}, config = {}) {
    return axios.get(url, {
      params: opt.params,
      headers: opt.headers,
      timeout: opt.timeout || 0,
      paramsSerializer: params => {
        return transformRequestOptions(params);
      },
      ...config,
    });
  },
  post: function (url, opt = {}) {
    return axios.post(url, opt.data, {
      timeout : opt.timeout || 0,
      headers: opt.headers,
      params: opt.params,
    });
  },
  put: function (url, opt = {}) {
    return axios.put(url, opt.data, {
      timeout: opt.timeout || 0,
      headers: opt.headers,
      params: opt.params,
    });
  },
  patch: function (url, opt = {}) {
    return axios.patch(url, opt.data, {
      timeout: opt.timeout || 0,
      headers: opt.headers,
      params: opt.params,
    });
  },
  del: function (url, opt = {}) {
    return axios.delete(url, {
      timeout: opt.timeout || 0,
      data: opt.data,
      headers: opt.headers,
      params: opt.params,
    });
  },
  getMisc: function (url, opt = {}) {
    return axiosMisc.get(url, {
      timeout: opt.timeout || 0,
      params: opt.params,
      headers: opt.headers,
      paramsSerializer: params => {
        return transformRequestOptions(params);
      },
    });
  },
  postMisc: function (url, opt = {}) {
    return axiosMisc.post(url, opt.data, { headers: opt.headers, timeout: opt.timeout || 0 });
  },
};

export default engine;

