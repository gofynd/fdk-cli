import path from 'path';
import fs from 'fs';
import Logger from '../lib/Logger';
import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import _ from 'lodash';
import { SourceMapConsumer } from 'source-map';
import { getActiveContext } from './utils';
import urlJoin from 'url-join';
import { parse as stackTraceParser } from 'stacktrace-parser';
import Theme from '../lib/Theme';
import glob from 'glob';
import detect from 'detect-port';
import chalk from 'chalk';
import UploadService from '../lib/api/services/upload.service';
import Configstore, { CONFIG_KEYS } from '../lib/Config';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { addSignatureFn } from '../lib/api/helper/interceptors';
const { transformRequest } = axios.defaults;

const BUILD_FOLDER = './.fdk/dist';
let port = 5001;
let sockets = [];
let publicCache = {};

export function reload() {
    sockets.forEach(s => {
        s.emit('reload');
    });
}

export function getLocalBaseUrl() {
    return 'https://localhost';
}

export function getFullLocalUrl(port) {
    return `${getLocalBaseUrl()}:${port}`;
}

export function getPort(port) {
    return detect(port);
}

export async function startServer({ domain, host, isSSR, port }) {
    const currentContext = getActiveContext();
    const currentDomain = `https://${currentContext.domain}`;
    // const currentDomain = 'http://localdev.jiox0.de:8087';
    const app = require('https-localhost')(getLocalBaseUrl());
    const certs = await app.getCerts();
    const server = require('https').createServer(certs, app);
    const io = require('socket.io')(server);

    io.on('connection', function (socket) {
        sockets.push(socket);
        socket.on('disconnect', function () {
            sockets = sockets.filter(s => s !== socket);
        });

        // When error occurs on browser after app has been served
        // We will send socket event to CLI and find file location
        socket.on('explain-error', async function (err) {
            const stack = stackTraceParser(err);

            if (stack[0]) {
                // Check in which bundle file error occuring and get map file
                const bundleFile = stack[0].file.split('/').pop() + '.map';

                // Get bundle file from local machine
                const mapContent = JSON.parse(
                    fs.readFileSync(`${BUILD_FOLDER}/${bundleFile}`, {
                        encoding: 'utf8',
                        flag: 'r',
                    })
                );

                const smc = await new SourceMapConsumer(mapContent);

                // Get position in original file
                const pos = smc.originalPositionFor({
                    line: stack[0].lineNumber,
                    column: stack[0].column,
                });

                const pathToFile =
                    pos.source.split('themeBundle/')[1] + ':' + pos.line + ':' + pos.column;

                // Log in CLI
                if (pos)
                    console.log(chalk.bgRed('\nError at ' + pathToFile + ' @' + pos.name + '\n'));
            }
        });
    });

    app.use('/public', async (req, res, done) => {
        try {
            const { url } = req;
            if (publicCache[url]) {
                res.set(publicCache[url].headers);
                return res.send(publicCache[url].body);
            }
            const networkRes = await axios.get(urlJoin(domain, 'public', url));
            publicCache[url] = publicCache[url] || {};
            publicCache[url].body = networkRes.data;
            publicCache[url].headers = networkRes.headers;
            res.set(publicCache[url].headers);
            return res.send(publicCache[url].body);
        } catch (e) {
            console.log('Error loading file ', url);
        }
    });

    app.get('/_healthz', (req, res) => {
        res.json({ ok: 'ok' });
    });

    // parse application/x-www-form-urlencoded
    app.use(express.json());

    const options = {
        target: currentDomain, // target host
        changeOrigin: true, // needed for virtual hosted sites
        cookieDomainRewrite: 'localhost', // rewrite cookies to localhost
        onProxyReq: fixRequestBody,
        onError: error => Logger.error(error),
    };
    // console.log(chalk.green('Man: currentDomain'), currentDomain);

    // proxy to solve CORS issue
    const corsProxy = createProxyMiddleware(options);
    app.use(
        ['/service', '/ext'],
        async (req, res, next) => {
            // generating new signature for proxy server
            req.transformRequest = transformRequest;
            req.originalUrl = req.originalUrl.startsWith('/service')
                ? req.originalUrl.replace('/service', '/api/service')
                : req.originalUrl;
            req.url = req.originalUrl;
            // don't send body for GET request
            if (!_.isEmpty(req.body)) {
                req.data = req.body;
            }
            req.baseURL = currentDomain;

            delete req.headers['x-fp-signature'];
            delete req.headers['x-fp-date'];
            const url = new URL(currentDomain);
            req.headers.host = url.host;
            // regenerating signature as per proxy server
            const config = await addSignatureFn(options)(req);
            req.headers['x-fp-signature'] = config.headers['x-fp-signature'];
            req.headers['x-fp-date'] = config.headers['x-fp-date'];
            next();
        },
        corsProxy
    );

    app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));
    app.get(['/__webpack_hmr', 'manifest.json'], async (req, res, next) => {
        return res.end();
    });
    app.get('/*', async (req, res) => {
        const BUNDLE_PATH = path.join(
            process.cwd(),
            path.join('.fdk', 'dist', 'themeBundle.common.js')
        );

        if (!fs.existsSync(BUNDLE_PATH))
            return res.sendFile(path.join(__dirname, '../../', '/dist/helper', '/loader.html'));
        if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
            return res.status(404).send('Not found');
        }

        const jetfireUrl = new URL(urlJoin(domain, req.originalUrl));

        jetfireUrl.searchParams.set('themeId', currentContext.theme_id);
        let themeUrl = '';
        if (isSSR) {
            const BUNDLE_PATH = path.join(process.cwd(), '/.fdk/dist/themeBundle.common.js');

            const User = Configstore.get(CONFIG_KEYS.USER);

            themeUrl = (await UploadService.uploadFile(BUNDLE_PATH, 'fdk-cli-dev-files', User._id))
                .start.cdn.url;
        } else {
            jetfireUrl.searchParams.set('__csr', 'true');
        }
        // console.log(chalk.green('Man: jetfireUrl', jetfireUrl));

        try {
            // Bundle directly passed on with POST request body.
            // console.log(chalk.red('================Jetfire call start=================='));

            const { data: html } = await axios({
                method: 'POST',
                url: jetfireUrl.toString(),
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                },
                data: {
                    theme_url: themeUrl,
                    port: port.toString(),
                },
            });

            let $ = cheerio.load(html);
            $('head').prepend(`
					<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
					<script>
					var socket = io();
					console.log('Initialized sockets')
					socket.on('reload',function(){
						location.reload();
					});
					</script>
				`);
            $('head').append(`
					<script>
						if(window.env) {
							window.env.SENTRY_DSN='';
							window.env.SENTRY_ENVIRONMENT='development';
						}
					</script>
				`);

            const umdJsInitial = $('link[data-umdjs-cli-source="initial"]');
            umdJsInitial.after(
                `<script type="text/javascript" src="${urlJoin(
                    getFullLocalUrl(port),
                    'themeBundle.umd.js'
                )}"></script>`
            );
            const umdJsAssests = glob
                .sync(`${Theme.BUILD_FOLDER}/themeBundle.umd.**.js`)
                .filter(x => !x.includes('.min.'));
            umdJsAssests.forEach(umdJsLink => {
                umdJsInitial.after(
                    `<script type="text/javascript" src="${urlJoin(
                        getFullLocalUrl(port),
                        umdJsLink.replace('./.fdk/dist/', '')
                    )}"></script>`
                );
            });

            const cssAssests = glob.sync(`${Theme.BUILD_FOLDER}/**.css`);
            const cssInitial = $('link[data-css-cli-source="initial"]');
            cssAssests.forEach(cssLink => {
                cssInitial.after(
                    `<link rel="stylesheet" href="${urlJoin(
                        getFullLocalUrl(port),
                        cssLink.replace('./.fdk/dist/', '')
                    )}"></link>`
                );
            });
            res.send($.html({ decodeEntities: false }));
        } catch (e) {
            // Check if error contains "all_server_components" string
            // if yes, then it means error is from jetfire
            const all_server_components = e.response.data.includes('all_server_components');
            let pathToFile = null;

            // Showing in CLI whether it's from Jetfire or Theme
            console.log(all_server_components ? 'Error in Jetfire' : 'Error in theme');

            // If it's from theme side
            // then find original location from .map file
            if (!all_server_components) {
                const stack = stackTraceParser(e.response.data);
                if (stack[0]) {
                    const mapContent = JSON.parse(
                        fs.readFileSync(`${BUILD_FOLDER}/themeBundle.common.js.map`, {
                            encoding: 'utf8',
                            flag: 'r',
                        })
                    );

                    const smc = await new SourceMapConsumer(mapContent);

                    const pos = smc.originalPositionFor({
                        line: stack[0].lineNumber,
                        column: stack[0].column,
                    });

                    if (pos) {
                        pathToFile =
                            pos.source.split('themeBundle/')[1] + ':' + pos.line + ':' + pos.column;
                        console.log(chalk.bgRed('\nError at ' + pathToFile + ' @' + pos.name));
                    }
                }
            }

            if (e.response && e.response.status == 504) {
                res.redirect(req.originalUrl);
            } else if (e.response && e.response.status == 500) {
                try {
                    Logger.error(e.response.data);
                    let errorString = e.response.data
                        .split('\n')
                        .find(line => line.trim().length > 0);
                    errorString = `<h3><b>${errorString}</b></h3>`;
                    const mapContent = JSON.parse(
                        fs.readFileSync(`${BUILD_FOLDER}/themeBundle.common.js.map`, {
                            encoding: 'utf8',
                            flag: 'r',
                        })
                    );

                    const smc = await new SourceMapConsumer(mapContent);

                    const stack = stackTraceParser(e.response.data);
                    stack?.forEach(({ methodName, lineNumber, column }) => {
                        try {
                            if (lineNumber == null || lineNumber < 1) {
                                errorString += `<p>      at  <strong>${
                                    methodName || ''
                                }</strong></p>`;
                            } else {
                                const pos = smc.originalPositionFor({ line: lineNumber, column });
                                if (pos && pos.line != null) {
                                    errorString += `<p>      at  <strong>${
                                        methodName || pos.name || ''
                                    }</strong> (${pos.source}:${pos.line}:${pos.column})</p>`;
                                }
                            }
                        } catch (err) {
                            console.log(`    at FAILED_TO_PARSE_LINE`);
                        }
                    });
                    res.send(
                        `<div style="padding: 10px;background: #efe2e0;color: #af2626;">${errorString}${
                            pathToFile
                                ? `<a style="background: #0078d7; color: white; text-decoration: none; padding: 8px 16px; margin-top: 16px; display: block; width: max-content; border-radius: 2px; font-family: arial;" href="vscode://file${process.cwd()}/${pathToFile}">Open in VS Code</a>`
                                : ''
                        }</div>`
                    );
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log(e.request && e.request.path, e.message);
            }
        }
    });

    await new Promise((resolve, reject) => {
        server.listen(port, err => {
            if (err) {
                return reject(err);
            }
            Logger.success(
                `Starting starter at port -- ${port} in ${isSSR ? 'SSR' : 'Non-SSR'} mode`
            );
            Logger.success(`************* Using Debugging build`);
            resolve(true);
        });
    });
}
