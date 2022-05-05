const combineURLs = require('axios/lib/helpers/combineURLs');
const isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL');
const { transformRequestOptions } = require('../../../helper/utils');
const { sign } = require('./signature');
import AuthenticationService from '../services/auth.service';
import ConfigStore, { CONFIG_KEYS } from '../../Config';
import Curl from '../../../helper/curl';
import Logger from '../../Logger';
import Debug from '../../Debug';
import Auth from '../../Auth';
import CommandError from '../../CommandError';
function getTransformer(config) {
    const { transformRequest } = config;

    if (transformRequest) {
        if (typeof transformRequest === 'function') {
            return transformRequest;
        } else if (transformRequest.length) {
            return transformRequest[0];
        }
    }

    throw new Error('Could not get default transformRequest function from Axios defaults');
}

function getCompanyId(path: string): number {
    const pathArr = path.split('/');
    const companyId = pathArr[pathArr.findIndex(p => p === 'company') + 1];
    
    return Number(companyId);
}
function interceptorFn(options) {
    return async config => {
        try {
            if (!config.url) {
                throw new Error('No URL present in request config, unable to sign request');
            }
            let url = config.url;
            if (config.baseURL && !isAbsoluteURL(config.url)) {
                url = combineURLs(config.baseURL, config.url);
            }
            const { host, pathname, search } = new URL(url);
            if (pathname.startsWith('/service')) {
                const { data, headers, method, params } = config;
                // set cookie
                const cookie = ConfigStore.get(CONFIG_KEYS.COOKIE);
                config.headers['Cookie'] = cookie || '';
                if (pathname.startsWith('/service/platform')) {
                    const company_id = getCompanyId(pathname);
                    let data;
                    try {
                        data = (await AuthenticationService.getOauthToken(company_id)).data || {};
                    } catch (error) {
                        Logger.error("Failed to fetch OAuth token")
                        ConfigStore.delete(CONFIG_KEYS.USER);
                        ConfigStore.delete(CONFIG_KEYS.COOKIE);
                        throw new Error(error);
                    }

                    if (data.access_token) {
                        config.headers['Authorization'] = 'Bearer ' + data.access_token;
                    }
                }
                let queryParam = '';
                if (params && Object.keys(params).length) {
                    if (search && search.trim() !== '') {
                        queryParam = `&${transformRequestOptions(params)}`;
                    } else {
                        queryParam = `?${transformRequestOptions(params)}`;
                    }
                }
                const transformRequest = getTransformer(config);

                const transformedData = transformRequest(data, headers);

                // Remove all the default Axios headers
                const {
                    common,
                    delete: _delete, // 'delete' is a reserved word
                    get,
                    head,
                    post,
                    put,
                    patch,
                    ...headersToSign
                } = headers;

                const signingOptions = {
                    method: method && method.toUpperCase(),
                    host: host,
                    path: pathname + search + queryParam,
                    body: transformedData,
                    headers: headersToSign,
                };
                sign(signingOptions);
                // console.log(signingOptions);
                // config.headers = signingOptions.headers;
                config.headers['x-fp-date'] = signingOptions.headers['x-fp-date'];
                config.headers['x-fp-signature'] = signingOptions.headers['x-fp-signature'];
            }

            return config;
        } catch (error) {
          throw new Error(error);
        }
    };
}

function responseInterceptorFn(response) {
    return response; // IF 2XX then return response only
}

function responseInterceptorErrorFn(error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        Logger.log('Response Error');
        throw new CommandError(error.code, error.response.data);
      } else if (error.request) {      
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        Logger.log('Request Error');
        throw new CommandError(error.code, error.message);
      } else {
        // Something happened in setting up the request that triggered an Error
        Logger.log('Setting up Request Error');
        throw new CommandError(error.code, error.message);
      }
}

module.exports = {
    addSignatureFn: interceptorFn,
    responseInterceptor: responseInterceptorFn,
    responseInterceptorError: responseInterceptorErrorFn
};
