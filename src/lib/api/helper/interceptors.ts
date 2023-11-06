const combineURLs = require('axios/lib/helpers/combineURLs');
const isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL');
const { transformRequestOptions } = require('../../../helper/utils');
const { sign } = require("@gofynd/fp-signature");
import Debug from '../../Debug';
import CommandError, { ErrorCodes } from '../../CommandError';
import ConfigStore, { CONFIG_KEYS } from '../../Config';
import { MAX_RETRY } from '../../../helper/constants';
import { COMMON_LOG_MESSAGES } from '../../../lib/Logger';

function getTransformer(config) {
    const { transformRequest } = config;

    if (transformRequest) {
        if (typeof transformRequest === 'function') {
            return transformRequest;
        } else if (transformRequest.length) {
            return transformRequest[0];
        }
    }

    throw new Error(
        'Could not get default transformRequest function from Axios defaults',
    );
}

function interceptorFn(options) {
    return async (config) => {
        try {
            if (!config.url) {
                throw new Error(
                    'No URL present in request config, unable to sign request',
                );
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
                if (pathname.startsWith('/service/partner')) {
                    const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
                    if (auth_token && auth_token.access_token) {
                        config.headers['Authorization'] =
                            'Bearer ' + auth_token.access_token;
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
                const signature = sign(signingOptions);
                // console.log(signingOptions);
                // config.headers = signingOptions.headers;
                config.headers['x-fp-date'] =
                signature['x-fp-date'];
                config.headers['x-fp-signature'] =
                signature['x-fp-signature'];
            }
            return config;
        } catch (error) {
            throw error;
        }
    };
}

export function responseInterceptor() {
    return (response) => {
        Debug(`Response status: ${response.status}`);
        Debug(`Response: ${JSON.stringify(response.data)}`);
        Debug(`Response Headers: ${JSON.stringify(response.headers)}`);
        return response; // IF 2XX then return response.data only
    };
}

function getErrorMessage(error) {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error.response.data) return error.response.data;
    if (error.response.message) return error.response.message;
    if (error.message) return error.message;
    return 'Something went wrong';
}

export function responseErrorInterceptor() {
    return (error) => {
        // Request made and server responded
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
            throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth);
        } else if (
            error.response &&
            error.response.status === 404 &&
            error.response.config.url.includes('/_compatibility')
        ) {
            throw new CommandError(
                ErrorCodes.DOWNGRADE_CLI_VERSION.message,
                ErrorCodes.DOWNGRADE_CLI_VERSION.code,
            );
        } else if (error.response) {
            Debug(`Error Response  :  ${JSON.stringify(error.response.data)}`);
            throw new CommandError(
                `${getErrorMessage(error)}`,
                ErrorCodes.API_ERROR.code,
                error?.response
            );
        } else if (error.request) {
            if (error.code == 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') {
                throw new CommandError(
                    `${ErrorCodes.LARGE_PAYLOAD.message}`,
                    ErrorCodes.LARGE_PAYLOAD.code,
                );
            }
            // Check if axios already tried 3 times and then getting into error interceptor
            // then directly send error network error
            if (error.config?.['axios-retry']?.retryCount === MAX_RETRY) {
                Debug(
                    `\nError => Code: ${error.code} Message: ${error.message} Url: ${error.config.url}\n`,
                );
                throw new Error('Please retry, possibly some network issue!!');
            }

            // If axios haven't tried 3(MAX_RETRY) times, then throw whatever error you got from last API call try
            throw error;
        } else {
            throw new Error(
                'There was an issue in setting up the request, Please raise issue',
            );
        }
    };
}

export { interceptorFn as addSignatureFn };
