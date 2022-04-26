import axios, { AxiosResponse } from 'axios';
import Debug from '../Debug';
import { ErrorCodes } from '../CommandError';
import { transformRequestOptions } from './../../helper/utils';
const { addSignatureFn } = require('./helper/interceptors');
import Curl from '../../helper/curl';
axios.defaults.withCredentials = true;
axios.interceptors.request.use(addSignatureFn({}));

let axiosMisc = axios.create({
  withCredentials: false,
  timeout: 60000
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

axios.interceptors.response.use(
  function (response) {
    Debug('************** CURL **************');
    Debug(
      `METHOD: ${response?.config?.method} | PATH: ${response?.request?.path} | CODE: ${response?.status}`
    );
    //log curl request incase of debug
    const curl = new Curl(response.config);
    Debug(curl.generateCommand());
    Debug('************** END OF CURL **************');
    Debug('\n')
    return response;
  },
  function (error) {
    Debug('************** CURL **************');
    Debug(
        `METHOD: ${error?.config?.method} | PATH: ${error?.request?.path} | CODE: ${error?.response?.status}`
    );
    //log curl request incase of debug
    const curl = new Curl(error.config);
    Debug(curl.generateCommand());
    Debug('************** END OF CURL **************');
    Debug('\n')
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.response?.data?.message) {
      error.message = error.response?.data?.message;
    }
    error.code = ErrorCodes.API_ERROR.code;
    return Promise.reject(error);
  }
);
// axios.interceptors.request.use(addSignatureFn({}));
// axios.interceptors.request.use(addOAuthToken({}));

export default engine;

