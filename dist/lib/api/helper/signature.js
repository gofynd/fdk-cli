'use strict';
var url = require('url');
var querystring = require('query-string');
var sha256 = require('crypto-js/sha256');
var hmacSHA256 = require('crypto-js/hmac-sha256');
function hmac(key, string, encoding) {
    return hmacSHA256(string, key).toString();
}
function hash(string, encoding) {
    return sha256(string).toString();
}
// This function assumes the string has already been percent encoded
function encodeRfc3986(urlEncodedString) {
    return urlEncodedString.replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}
function encodeRfc3986Full(str) {
    return str;
    // return encodeRfc3986(encodeURIComponent(str));
}
var HEADERS_TO_IGNORE = {
    authorization: true,
    connection: true,
    'x-amzn-trace-id': true,
    'user-agent': true,
    expect: true,
    'presigned-expires': true,
    range: true,
};
var HEADERS_TO_INCLUDE = ['x-fp-.*', 'host'];
// request: { path | body, [host], [method], [headers], [service], [region] }
var RequestSigner = /** @class */ (function () {
    function RequestSigner(request) {
        if (typeof request === 'string') {
            request = url.parse(request);
        }
        var headers = (request.headers = request.headers || {});
        this.request = request;
        if (!request.method && request.body) {
            request.method = 'POST';
        }
        if (!headers.Host && !headers.host) {
            headers.Host = request.hostname || request.host;
            // If a port is specified explicitly, use it as is
            if (request.port) {
                headers.Host += ':' + request.port;
            }
        }
        if (!request.hostname && !request.host) {
            request.hostname = headers.Host || headers.host;
        }
    }
    RequestSigner.prototype.prepareRequest = function () {
        this.parsePath();
        var request = this.request;
        var headers = request.headers;
        var query;
        if (request.signQuery) {
            this.parsedPath.query = query = this.parsedPath.query || {};
            if (query['x-fp-date']) {
                this.datetime = query['x-fp-date'];
            }
            else {
                query['x-fp-date'] = this.getDateTime();
            }
        }
        else {
            if (!request.doNotModifyHeaders) {
                if (headers['x-fp-date']) {
                    this.datetime = headers['x-fp-date'] || headers['x-fp-date'];
                }
                else {
                    headers['x-fp-date'] = this.getDateTime();
                }
            }
            delete headers['x-fp-signature'];
            delete headers['X-Fp-Signature'];
        }
    };
    RequestSigner.prototype.sign = function () {
        if (!this.parsedPath) {
            this.prepareRequest();
        }
        if (this.request.signQuery) {
            this.parsedPath.query['x-fp-signature'] = this.signature();
        }
        else {
            this.request.headers['x-fp-signature'] = this.signature();
        }
        this.request.path = this.formatPath();
        return this.request;
    };
    RequestSigner.prototype.getDateTime = function () {
        if (!this.datetime) {
            var headers = this.request.headers;
            var date = new Date(headers.Date || headers.date || new Date());
            this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
        }
        return this.datetime;
    };
    RequestSigner.prototype.getDate = function () {
        return this.getDateTime().substr(0, 8);
    };
    RequestSigner.prototype.signature = function () {
        var kCredentials = '1234567';
        var strTosign = this.stringToSign();
        // console.log(strTosign);
        return "v1.1:".concat(hmac(kCredentials, strTosign, 'hex'));
    };
    RequestSigner.prototype.stringToSign = function () {
        return [this.getDateTime(), hash(this.canonicalString(), 'hex')].join('\n');
    };
    RequestSigner.prototype.canonicalString = function () {
        if (!this.parsedPath) {
            this.prepareRequest();
        }
        var pathStr = this.parsedPath.path;
        var query = this.parsedPath.query;
        var headers = this.request.headers;
        var queryStr = '';
        var normalizePath = true;
        var decodePath = this.request.doNotEncodePath;
        var decodeSlashesInPath = false;
        var firstValOnly = false;
        var bodyHash = hash(this.request.body || '', 'hex');
        if (query) {
            var reducedQuery_1 = Object.keys(query).reduce(function (obj, key) {
                if (!key) {
                    return obj;
                }
                obj[encodeRfc3986Full(key)] = !Array.isArray(query[key])
                    ? query[key]
                    : firstValOnly
                        ? query[key][0]
                        : query[key];
                return obj;
            }, {});
            var encodedQueryPieces_1 = [];
            Object.keys(reducedQuery_1)
                .sort()
                .forEach(function (key) {
                if (!Array.isArray(reducedQuery_1[key])) {
                    encodedQueryPieces_1.push(key + '=' + encodeRfc3986Full(reducedQuery_1[key]));
                }
                else {
                    reducedQuery_1[key]
                        .map(encodeRfc3986Full)
                        .sort()
                        .forEach(function (val) {
                        encodedQueryPieces_1.push(key + '=' + val);
                    });
                }
            });
            queryStr = encodedQueryPieces_1.join('&');
        }
        if (pathStr !== '/') {
            if (normalizePath) {
                pathStr = pathStr.replace(/\/{2,}/g, '/');
            }
            pathStr = pathStr
                .split('/')
                .reduce(function (path, piece) {
                if (normalizePath && piece === '..') {
                    path.pop();
                }
                else if (!normalizePath || piece !== '.') {
                    if (decodePath)
                        piece = decodeURIComponent(piece.replace(/\+/g, ' '));
                    path.push(encodeRfc3986Full(piece));
                }
                return path;
            }, [])
                .join('/');
            if (pathStr[0] !== '/')
                pathStr = '/' + pathStr;
            if (decodeSlashesInPath)
                pathStr = pathStr.replace(/%2F/g, '/');
        }
        var canonicalReq = [
            this.request.method || 'GET',
            pathStr,
            queryStr,
            this.canonicalHeaders() + '\n',
            this.signedHeaders(),
            bodyHash,
        ].join('\n');
        // console.log("====================");
        // console.log(canonicalReq);
        // console.log("====================");
        return canonicalReq;
    };
    RequestSigner.prototype.canonicalHeaders = function () {
        var headers = this.request.headers;
        function trimAll(header) {
            return header.toString().trim().replace(/\s+/g, ' ');
        }
        return Object.keys(headers)
            .filter(function (key) {
            var notInIgnoreHeader = HEADERS_TO_IGNORE[key.toLowerCase()] == null;
            if (notInIgnoreHeader) {
                var foundMatch = false;
                for (var t in HEADERS_TO_INCLUDE) {
                    foundMatch = foundMatch || new RegExp(HEADERS_TO_INCLUDE[t], 'ig').test(key);
                }
                return foundMatch;
            }
            else {
                return false;
            }
        })
            .sort(function (a, b) {
            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
        })
            .map(function (key) {
            return key.toLowerCase() + ':' + trimAll(headers[key]);
        })
            .join('\n');
    };
    RequestSigner.prototype.signedHeaders = function () {
        return Object.keys(this.request.headers)
            .map(function (key) {
            return key.toLowerCase();
        })
            .filter(function (key) {
            var notInIgnoreHeader = HEADERS_TO_IGNORE[key.toLowerCase()] == null;
            if (notInIgnoreHeader) {
                var foundMatch = false;
                for (var t in HEADERS_TO_INCLUDE) {
                    foundMatch = foundMatch || new RegExp(HEADERS_TO_INCLUDE[t], 'ig').test(key);
                }
                return foundMatch;
            }
            else {
                return false;
            }
        })
            .sort()
            .join(';');
    };
    RequestSigner.prototype.parsePath = function () {
        var path = this.request.path || '/';
        var queryIx = path.indexOf('?');
        var query = null;
        if (queryIx >= 0) {
            query = querystring.parse(path.slice(queryIx + 1));
            path = path.slice(0, queryIx);
        }
        path = path.split("/").map(function (t) {
            return encodeURIComponent(decodeURIComponent(t));
        }).join("/");
        this.parsedPath = {
            path: path,
            query: query,
        };
    };
    RequestSigner.prototype.formatPath = function () {
        var path = this.parsedPath.path;
        var query = this.parsedPath.query;
        if (!query) {
            return path;
        }
        // Services don't support empty query string keys
        if (query[''] != null) {
            delete query[''];
        }
        return path + '?' + encodeRfc3986(querystring.stringify(query));
    };
    return RequestSigner;
}());
function signMethod(request) {
    return new RequestSigner(request).sign();
}
module.exports = {
    sign: signMethod,
};
