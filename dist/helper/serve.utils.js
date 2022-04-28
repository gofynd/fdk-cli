"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.checkTunnel = exports.createTunnel = exports.getFullLocalUrl = exports.getLocalBaseUrl = exports.reload = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var localtunnel_1 = __importDefault(require("localtunnel"));
var Logger_1 = __importDefault(require("../lib/Logger"));
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
var express_1 = __importDefault(require("express"));
var source_map_1 = require("source-map");
var url_join_1 = __importDefault(require("url-join"));
var stacktrace_parser_1 = require("stacktrace-parser");
var express_http_proxy_1 = __importDefault(require("express-http-proxy"));
var detect_port_1 = __importDefault(require("detect-port"));
var chalk_1 = __importDefault(require("chalk"));
var BUILD_FOLDER = './.fdk/dist';
var port = 5001;
var sockets = [];
var publicCache = {};
var tunnel;
function reload() {
    sockets.forEach(function (s) {
        s.emit('reload');
    });
}
exports.reload = reload;
function getLocalBaseUrl(host) {
    return host.replace('api', 'localdev');
}
exports.getLocalBaseUrl = getLocalBaseUrl;
function getFullLocalUrl(host) {
    return getLocalBaseUrl(host) + ":" + port;
}
exports.getFullLocalUrl = getFullLocalUrl;
function createTunnel() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, localtunnel_1.default({ port: port, local_https: true, allow_invalid_cert: true })];
                case 1:
                    tunnel = _a.sent();
                    Logger_1.default.success("Tunnelled at -- " + tunnel.url);
                    reload();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createTunnel = createTunnel;
function isTunnelRunning() {
    return tunnel && !tunnel.closed;
}
function checkTunnel() {
    return __awaiter(this, void 0, void 0, function () {
        var res, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 6]);
                    if (!isTunnelRunning()) return [3 /*break*/, 2];
                    return [4 /*yield*/, axios_1.default.get(tunnel.url + '/_healthz')];
                case 1:
                    res = _a.sent();
                    if (res.data.ok === 'ok') {
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, createTunnel()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    return [4 /*yield*/, createTunnel()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.checkTunnel = checkTunnel;
function getPort(port) {
    return detect_port_1.default(port);
}
function startServer(_a) {
    var domain = _a.domain, host = _a.host, isSSR = _a.isSSR, serverPort = _a.serverPort;
    return __awaiter(this, void 0, void 0, function () {
        var e_2, app, certs, server, io;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getPort(serverPort)];
                case 1:
                    port = _b.sent();
                    if (port !== serverPort)
                        Logger_1.default.warn(chalk_1.default.bold.yellowBright("PORT: " + serverPort + " is busy, Switching to PORT: " + port));
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _b.sent();
                    Logger_1.default.error('Error occurred while detecting port.\n', e_2);
                    return [3 /*break*/, 3];
                case 3:
                    app = require('https-localhost')(getLocalBaseUrl(host));
                    return [4 /*yield*/, app.getCerts()];
                case 4:
                    certs = _b.sent();
                    server = require('https').createServer(certs, app);
                    io = require('socket.io')(server);
                    if (!(isSSR && !isTunnelRunning())) return [3 /*break*/, 6];
                    return [4 /*yield*/, createTunnel()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    io.on('connection', function (socket) {
                        sockets.push(socket);
                        socket.on('disconnect', function () {
                            sockets = sockets.filter(function (s) { return s !== socket; });
                        });
                    });
                    app.use('/public', function (req, res, done) { return __awaiter(_this, void 0, void 0, function () {
                        var url, networkRes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    url = req.url;
                                    if (publicCache[url]) {
                                        res.set(publicCache[url].headers);
                                        return [2 /*return*/, res.send(publicCache[url].body)];
                                    }
                                    return [4 /*yield*/, axios_1.default.get(url_join_1.default(domain, 'public', req.url))];
                                case 1:
                                    networkRes = _a.sent();
                                    publicCache[url] = publicCache[url] || {};
                                    publicCache[url].body = networkRes.data;
                                    publicCache[url].headers = networkRes.headers;
                                    res.set(publicCache[url].headers);
                                    return [2 /*return*/, res.send(publicCache[url].body)];
                            }
                        });
                    }); });
                    app.get('/_healthz', function (req, res) {
                        res.json({ ok: 'ok' });
                    });
                    // app.use('/platform', proxy(`https://${host}`, {
                    //   proxyReqPathResolver: function (req) {
                    //     return `/platform${req.url}`;
                    //   }
                    // }));
                    app.use("/api", express_http_proxy_1.default("" + host));
                    app.use(express_1.default.static(path_1.default.resolve(process.cwd(), BUILD_FOLDER)));
                    app.get('/*', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var jetfireUrl, _a, protocol, tnnelHost, html, $, e_3, errorString_1, mapContent, smc_1, stack, e_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (req.originalUrl == '/themeBundle.common.js') {
                                        return [2 /*return*/, res.sendFile(path_1.default.resolve(process.cwd(), BUILD_FOLDER + "/themeBundle.common.js"))];
                                    }
                                    if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
                                        return [2 /*return*/, res.status(404).send('Not found')];
                                    }
                                    console.log(req.hostname, req.url);
                                    jetfireUrl = new URL(url_join_1.default(domain, req.originalUrl));
                                    if (!isSSR) return [3 /*break*/, 3];
                                    if (!!isTunnelRunning()) return [3 /*break*/, 2];
                                    return [4 /*yield*/, createTunnel()];
                                case 1:
                                    _b.sent();
                                    _b.label = 2;
                                case 2:
                                    _a = new URL(tunnel.url), protocol = _a.protocol, tnnelHost = _a.host;
                                    jetfireUrl.searchParams.set('__cli_protocol', protocol);
                                    jetfireUrl.searchParams.set('__cli_url', tnnelHost);
                                    return [3 /*break*/, 4];
                                case 3:
                                    jetfireUrl.searchParams.set('__csr', 'true');
                                    _b.label = 4;
                                case 4:
                                    _b.trys.push([4, 6, , 16]);
                                    return [4 /*yield*/, axios_1.default.get(jetfireUrl.toString())];
                                case 5:
                                    html = (_b.sent()).data;
                                    $ = cheerio_1.default.load(html);
                                    $('head').prepend("\n\t\t\t\t\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js\"></script>\n\t\t\t\t\t<script>\n\t\t\t\t\tvar socket = io();\n\t\t\t\t\tconsole.log('Initialized sockets')\n\t\t\t\t\tsocket.on('reload',function(){\n\t\t\t\t\t\tlocation.reload();\n\t\t\t\t\t});\n\t\t\t\t\t</script>\n\t\t\t\t");
                                    $('head').append("\n\t\t\t\t\t<script>\n\t\t\t\t\t\tif(window.env) {\n\t\t\t\t\t\t\twindow.env.SENTRY_DSN='';\n\t\t\t\t\t\t\twindow.env.SENTRY_ENVIRONMENT='development';\n\t\t\t\t\t\t}\n\t\t\t\t\t</script>\n\t\t\t\t");
                                    $('#theme-umd-js').attr('src', url_join_1.default(getFullLocalUrl(host), 'themeBundle.umd.js'));
                                    $('#theme-umd-js-link').attr('href', url_join_1.default(getFullLocalUrl(host), 'themeBundle.umd.js'));
                                    $('#theme-css').attr('href', url_join_1.default(getFullLocalUrl(host), 'themeBundle.css'));
                                    res.send($.html({ decodeEntities: false }));
                                    return [3 /*break*/, 16];
                                case 6:
                                    e_3 = _b.sent();
                                    if (!(e_3.response && e_3.response.status == 504)) return [3 /*break*/, 9];
                                    if (!!isTunnelRunning()) return [3 /*break*/, 8];
                                    return [4 /*yield*/, createTunnel()];
                                case 7:
                                    _b.sent();
                                    _b.label = 8;
                                case 8:
                                    res.redirect(req.originalUrl);
                                    return [3 /*break*/, 15];
                                case 9:
                                    if (!(e_3.response && e_3.response.status == 500)) return [3 /*break*/, 14];
                                    _b.label = 10;
                                case 10:
                                    _b.trys.push([10, 12, , 13]);
                                    Logger_1.default.error(e_3.response.data);
                                    errorString_1 = e_3.response.data.split('\n').find(function (line) { return line.trim().length > 0; });
                                    errorString_1 = "<h3><b>" + errorString_1 + "</b></h3>";
                                    mapContent = JSON.parse(fs_1.default.readFileSync(BUILD_FOLDER + "/themeBundle.common.js.map", { encoding: 'utf8', flag: 'r' }));
                                    return [4 /*yield*/, new source_map_1.SourceMapConsumer(mapContent)];
                                case 11:
                                    smc_1 = _b.sent();
                                    stack = stacktrace_parser_1.parse(e_3.response.data);
                                    stack === null || stack === void 0 ? void 0 : stack.forEach(function (_a) {
                                        var methodName = _a.methodName, lineNumber = _a.lineNumber, column = _a.column;
                                        try {
                                            if (lineNumber == null || lineNumber < 1) {
                                                errorString_1 += "<p>      at  <strong>" + (methodName || '') + "</strong></p>";
                                            }
                                            else {
                                                var pos = smc_1.originalPositionFor({ line: lineNumber, column: column });
                                                if (pos && pos.line != null) {
                                                    errorString_1 += "<p>      at  <strong>" + (methodName || pos.name || '') + "</strong> (" + pos.source + ":" + pos.line + ":" + pos.column + ")</p>";
                                                }
                                            }
                                        }
                                        catch (err) {
                                            console.log("    at FAILED_TO_PARSE_LINE");
                                        }
                                    });
                                    res.send("<div style=\"padding: 10px;background: #efe2e0;color: #af2626;\">" + errorString_1 + "</div>");
                                    return [3 /*break*/, 13];
                                case 12:
                                    e_4 = _b.sent();
                                    console.log(e_4);
                                    return [3 /*break*/, 13];
                                case 13: return [3 /*break*/, 15];
                                case 14:
                                    console.log(e_3.request && e_3.request.path, e_3.message);
                                    _b.label = 15;
                                case 15: return [3 /*break*/, 16];
                                case 16: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var interval;
                            server.listen(port, function (err) {
                                if (err) {
                                    if (isSSR) {
                                        if (interval) {
                                            clearInterval(interval);
                                        }
                                        tunnel.close();
                                    }
                                    return reject(err);
                                }
                                Logger_1.default.success("Starting server on port -- " + port);
                                if (isSSR) {
                                    interval = setInterval(checkTunnel, 1000 * 30);
                                }
                                resolve(true);
                            });
                        })];
                case 7:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.startServer = startServer;
