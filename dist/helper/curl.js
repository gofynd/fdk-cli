"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CurlHelper = /** @class */ (function () {
    function CurlHelper(config) {
        if (config === void 0) { config = {}; }
        this.request = config;
    }
    CurlHelper.prototype.getHeaders = function () {
        var _a;
        var headers = this.request.headers, curlHeaders = "";
        // get the headers concerning the appropriate method (defined in the global axios instance)
        if (headers.hasOwnProperty("common")) {
            headers = this.request.headers[(_a = this.request) === null || _a === void 0 ? void 0 : _a.method];
        }
        // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
        for (var property in this.request.headers) {
            if (!["common", "delete", "get", "head", "patch", "post", "put"].includes(property)) {
                headers[property] = this.request.headers[property];
            }
        }
        for (var property in headers) {
            if ({}.hasOwnProperty.call(headers, property)) {
                var header = property + ":" + headers[property];
                curlHeaders = curlHeaders + " -H \"" + header + "\"";
            }
        }
        return curlHeaders.trim();
    };
    CurlHelper.prototype.getMethod = function () {
        var _a, _b;
        return "-X " + ((_b = (_a = this.request) === null || _a === void 0 ? void 0 : _a.method) === null || _b === void 0 ? void 0 : _b.toUpperCase());
    };
    CurlHelper.prototype.getBody = function () {
        var _a, _b;
        if (typeof this.request.data !== "undefined" &&
            this.request.data !== "" &&
            this.request.data !== null &&
            ((_b = (_a = this.request) === null || _a === void 0 ? void 0 : _a.method) === null || _b === void 0 ? void 0 : _b.toUpperCase()) !== "GET") {
            var data = typeof this.request.data === "object" ||
                Object.prototype.toString.call(this.request.data) === "[object Array]"
                ? JSON.stringify(this.request.data)
                : this.request.data;
            return ("--data '" + data + "'").trim();
        }
        else {
            return "";
        }
    };
    CurlHelper.prototype.getUrl = function () {
        if (this.request.baseURL) {
            return this.request.baseURL + "/" + this.request.url;
        }
        return this.request.url;
    };
    CurlHelper.prototype.getQueryString = function () {
        var params = "", i = 0;
        for (var param in this.request.params) {
            if ({}.hasOwnProperty.call(this.request.params, param)) {
                params +=
                    i !== 0
                        ? "&" + param + "=" + this.request.params[param]
                        : "?" + param + "=" + this.request.params[param];
                i++;
            }
        }
        return params;
    };
    CurlHelper.prototype.getBuiltURL = function () {
        var url = this.getUrl();
        if (this.getQueryString() !== "") {
            url = url.charAt(url.length - 1) === "/" ? url.substr(0, url.length - 1) : url;
            url += this.getQueryString();
        }
        return url.trim();
    };
    CurlHelper.prototype.generateCommand = function () {
        return ("curl " + this.getMethod() + " " + this.getHeaders() + " " + this.getBody() + " \"" + this.getBuiltURL() + "\"")
            .trim()
            .replace(/\s{2,}/g, " ");
    };
    return CurlHelper;
}());
exports.default = CurlHelper;
