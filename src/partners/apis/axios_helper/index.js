const combineURLs = require("axios/lib/helpers/combineURLs");
const isAbsoluteURL = require("axios/lib/helpers/isAbsoluteURL");
import CommandError, { ErrorCodes } from '../../../lib/CommandError';

const {
    sign
} = require("./signature");

const transformRequestOptions = params => {
    let options = '';

    for (const key in params) {
        if (typeof params[key] !== 'object' && params[key]) {
            const encodeVal = encodeURIComponent(params[key]);
            options += `${key}=${encodeVal}&`;
        } else if (Array.isArray(params[key])) {
            params[key].forEach(el => {
                const encodeVal = encodeURIComponent(el);
                options += `${key}=${encodeVal}&`;
            });
        } else if (typeof params[key] === 'object' && params[key]) {
            options += transformRequestOptions(params[key]);
        }
    }
    return options ? options.slice(0, -1) : options;
};

function getTransformer(config) {
    const {
        transformRequest
    } = config;

    if (transformRequest) {
        if (typeof transformRequest === "function") {
            return transformRequest;
        } else if (transformRequest.length) {
            return transformRequest[0];
        }
    }

    throw new CommandError(
        "Could not get default transformRequest function from Axios defaults"
    );
}


 function interceptorFn(options) {
    return async (config) => {

        try {

            if (!config.url) {
                throw new CommandError("No URL present in request config, unable to sign request");
            }

            let url = config.url;
            if (config.baseURL && !isAbsoluteURL(config.url)) {
                url = combineURLs(config.baseURL, config.url);
            }
            const {
                host,
                pathname,
                search
            } = new URL(url);
            if (pathname.startsWith('/service')) {
                const {
                    data,
                    headers,
                    method,
                    params
                } = config;
                if (pathname.startsWith('/service/platform')) {
                    const { getOauthToken } = require('../user')
                    const host = headers['host'];
                    const cookie = headers['Cookie'];
                    const company_id = headers['x-company-id']
                    let { access_token } =  await getOauthToken(host, cookie, company_id) || {};
                    delete headers['host']
                    delete headers['x-company-id']
                    if(access_token){
                        config.headers['Authorization'] = 'Bearer ' + access_token;
                    }
                }
                let queryParam = '';
                if (params && Object.keys(params).length) {
                    if (search && search.trim() !== '') {
                        queryParam = `&${transformRequestOptions(params)}`
                    } else {
                        queryParam = `?${transformRequestOptions(params)}`
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
                    headers: headersToSign
                };
                sign(signingOptions);
                // console.log(signingOptions);
                // config.headers = signingOptions.headers;
                config.headers['x-fp-date'] = signingOptions.headers['x-fp-date'];
                config.headers['x-fp-signature'] = signingOptions.headers['x-fp-signature'];
            }
        
            return config
        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    };
}


module.exports = {
    addSignatureFn: interceptorFn,
};