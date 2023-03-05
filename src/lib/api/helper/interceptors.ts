const combineURLs = require('axios/lib/helpers/combineURLs');
const isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL');
const { transformRequestOptions } = require('../../../helper/utils');
const { sign } = require('./signature');
import AuthenticationService from '../services/auth.service';
import ConfigStore, { CONFIG_KEYS } from '../../Config';
import CommandError from '../../CommandError';
import Curl from '../../../helper/curl';
import Logger from '../../Logger';
import Debug from '../../Debug';
import Auth from '../../Auth';

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
            if (pathname.includes('/service') || pathname.startsWith('/ext')) {
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
                        ConfigStore.delete(CONFIG_KEYS.USER);
                        ConfigStore.delete(CONFIG_KEYS.COOKIE);
                        throw new CommandError(error?.message, error?.code);
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
                let transformedData;
                if (method != 'get') {
                    const transformRequest = getTransformer(config);
                    transformedData = transformRequest(data, headers);
                }

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
                config.headers['x-debug'] = true;
            }
            return config;
        } catch (error) {
            throw new Error(error);
        }
    };
}
export { interceptorFn as addSignatureFn };
