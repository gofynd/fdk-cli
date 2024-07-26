import qs from 'query-string';
import { AxiosRequestConfig } from 'axios';
import combineURLs from 'axios/lib/helpers/combineURLs';
import isAbsoluteURL from 'axios/lib/helpers/isAbsoluteURL';

export default class CurlHelper {
    reqConfig: AxiosRequestConfig;
    constructor(config: AxiosRequestConfig) {
        this.reqConfig = config;
    }

    getUrl(): string {
        let url = this.reqConfig.url;

        if (this.reqConfig.baseURL && !isAbsoluteURL(url)) {
            url = combineURLs(this.reqConfig.baseURL, url).trim();
        }

        let queryParamString = '';

        if (this.reqConfig.paramsSerializer && typeof this.reqConfig.paramsSerializer === 'function') {
            let queryParams = this.reqConfig.paramsSerializer(
                this.reqConfig.params,
            );
            if (queryParams && queryParams.length) {
                queryParamString = `?${queryParams.trim()}`;
            }
        } else {
            if (
                this.reqConfig.params &&
                Object.keys(this.reqConfig.params).length &&
                qs.stringify(this.reqConfig.params).trim() !== ''
            ) {
                queryParamString = `?${qs
                    .stringify(this.reqConfig.params)
                    .trim()}`;
            }
        }

        return `'${url}${queryParamString}'`;
    }

    getBody(): string {
        if (
            this.reqConfig.method.toUpperCase() !== 'GET' &&
            this.reqConfig.data !== null &&
            this.reqConfig.data !== '' &&
            this.reqConfig.data
        ) {
            return `--data-raw '${JSON.stringify(this.reqConfig.data).trim()}'`;
        } else {
            return '';
        }
    }

    getHeaders(): string {
        const axiosHeaders = [
            'common',
            'delete',
            'get',
            'head',
            'post',
            'put',
            'patch',
        ];
        let headers = {};

        // Logger.info(JSON.stringify(this.reqConfig.headers));

        // add axios default headers
        if (this.reqConfig.headers[this.reqConfig.method]) {
            headers = this.reqConfig.headers[this.reqConfig.method];
        }
        headers = Object.keys(headers).reduce(
            (acc, key) => ((acc[key.toLowerCase()] = headers[key]), acc),
            {},
        );

        // add custom headers
        for (let headerName in this.reqConfig.headers) {
            if (
                !axiosHeaders.includes(headerName) &&
                this.reqConfig.headers[headerName] &&
                this.reqConfig.headers[headerName] !== ''
            ) {
                if (this.reqConfig.headers[headerName] as any instanceof Object) {
                    headers[headerName.toLowerCase()] = JSON.stringify(
                        this.reqConfig.headers[headerName],
                    );
                } else {
                    headers[headerName.toLowerCase()] =
                        this.reqConfig.headers[headerName];
                }
            }
        }

        // convert header object to curl string
        let headerString = '';
        for (let header in headers) {
            headerString =
                headerString + ` --header '${header}: ${headers[header]}'`;
        }

        return headerString.trim();
    }

    getMethod(): string {
        return `--request ${this.reqConfig.method.toUpperCase()}`;
    }

    generateCommand(): string {
        return `curl --include ${this.getMethod()} ${this.getUrl()} ${this.getHeaders()} ${this.getBody()}`.trim();
    }
}
