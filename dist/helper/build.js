"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devBuild = exports.build = void 0;
var child_process_1 = require("child_process");
function build(_a) {
    var buildFolder = _a.buildFolder, imageCdnUrl = _a.imageCdnUrl, assetCdnUrl = _a.assetCdnUrl;
    return new Promise(function (resolve, reject) {
        var b = child_process_1.exec("node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest " + buildFolder + " --name themeBundle theme/index.js", {
            cwd: process.cwd(),
            env: __assign(__assign({}, process.env), { IMAGE_CDN_URL: imageCdnUrl, ASSET_CDN_URL: assetCdnUrl, NODE_ENV: "production" })
        });
        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);
        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}
exports.build = build;
function devBuild(_a) {
    var buildFolder = _a.buildFolder, imageCdnUrl = _a.imageCdnUrl, isProd = _a.isProd;
    return new Promise(function (resolve, reject) {
        var b = child_process_1.exec("node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest " + buildFolder + " --name themeBundle theme/index.js", {
            cwd: process.cwd(),
            env: __assign(__assign({}, process.env), { IMAGE_CDN_URL: imageCdnUrl, NODE_ENV: (isProd && "production") || "development" })
        });
        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);
        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}
exports.devBuild = devBuild;
