import path from 'path';
import fs from 'fs';
import Logger from '../lib/Logger';
import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import _ from 'lodash';
import { SourceMapConsumer } from 'source-map';
import { getActiveContext, parseBundleFilename } from './utils';
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
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import createBaseWebpackConfig from '../helper/theme.react.config';
const packageJSON = require('../../package.json');

const BUILD_FOLDER = './.fdk/dist';
let port = 5001;
let sockets = [];
let publicCache = {};

export function reload() {
    sockets.forEach((s) => {
        s.emit('reload');
    });
}

export function getLocalBaseUrl() {
    return 'http://127.0.0.1';
}

export function getFullLocalUrl(port) {
    return `${getLocalBaseUrl()}:${port}`;
}

export function getPort(port) {
    return detect(port);
}

function applyProxy(app: any) {
    const currentContext = getActiveContext();
    const currentDomain = `https://${currentContext.domain}`;
    const options = {
        target: currentDomain, // target host
        changeOrigin: true, // needed for virtual hosted sites
        cookieDomainRewrite: '127.0.0.1', // rewrite cookies to localhost
        onProxyReq: fixRequestBody,
        onError: (error) => Logger.error(error),
    };

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
        corsProxy,
    );
}

async function setupServer({ domain }) {
    const currentContext = getActiveContext();
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    io.on('connection', function (socket) {
        sockets.push(socket);
        socket.on('disconnect', function () {
            sockets = sockets.filter((s) => s !== socket);
        });
    });

    // parse application/x-www-form-urlencoded
    app.use(express.json());

    app.use('/public', async (req, res, done) => {
		const themeId = currentContext.theme_id;
        const { url } = req;
        try {
            if (publicCache[url]) {
                for (const [key, value] of Object.entries(
                    publicCache[url].headers,
                )) {
                    res.header(key, `${value}`);
                }
                return res.send(publicCache[url].body);
            }
            const networkRes = await axios.get(urlJoin(domain, 'public', url, `?themeId=${themeId}`));
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

    return { currentContext, app, server, io };
}

export async function startServer({ domain, host, isSSR, port }) {
    const { currentContext, app, server, io } = await setupServer({ domain });

    applyProxy(app);

    app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));
    app.get(['/__webpack_hmr', '/manifest.json'], async (req, res, next) => {
        return res.end();
    });
    app.get('/*', async (req, res) => {
        const BUNDLE_PATH = path.join(
            process.cwd(),
            path.join('.fdk', 'dist', 'themeBundle.common.js'),
        );
        if (!fs.existsSync(BUNDLE_PATH))
            return res.sendFile(
                path.join(__dirname, '../../', '/dist/helper', '/loader.html'),
            );
        if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
            return res.status(404).send('Not found');
        }

        const jetfireUrl = new URL(urlJoin(domain, req.originalUrl));
        jetfireUrl.searchParams.set('themeId', currentContext.theme_id);
        let themeUrl = '';
        if (isSSR) {
            const BUNDLE_PATH = path.join(
                process.cwd(),
                '/.fdk/dist/themeBundle.common.js',
            );
            const User = Configstore.get(CONFIG_KEYS.AUTH_TOKEN);
            themeUrl = (
                await UploadService.uploadFile(
                    BUNDLE_PATH,
                    'fdk-cli-dev-files',
                    User.current_user._id,
                )
            ).start.cdn.url;
        } else {
            jetfireUrl.searchParams.set('__csr', 'true');
        }
        try {
            // Bundle directly passed on with POST request body.
            const { data: html } = await axios({
                method: 'POST',
                url: jetfireUrl.toString(),
                headers: {
                    'Content-Yype': 'application/json',
                    Accept: 'application/json',
                },
                data: {
                    theme_url: themeUrl,
                    domain: getFullLocalUrl(port),
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
                    'themeBundle.umd.js',
                )}"></script>`,
            );
            const umdJsAssests = glob
                .sync(`${Theme.BUILD_FOLDER}/themeBundle.umd.**.js`)
                .filter((x) => !x.includes('.min.'));
            umdJsAssests.forEach((umdJsLink) => {
                umdJsInitial.after(
                    `<script type="text/javascript" src="${urlJoin(
                        getFullLocalUrl(port),
                        umdJsLink.replace('./.fdk/dist/', ''),
                    )}"></script>`,
                );
            });

            const cssAssests = glob.sync(`${Theme.BUILD_FOLDER}/**.css`);
            const cssInitial = $('link[data-css-cli-source="initial"]');
            cssAssests.forEach((cssLink) => {
                cssInitial.after(
                    `<link rel="stylesheet" href="${urlJoin(
                        getFullLocalUrl(port),
                        cssLink.replace('./.fdk/dist/', ''),
                    )}"></link>`,
                );
            });
            res.send($.html({ decodeEntities: false }));
        } catch (e) {
            if (e.response && e.response.status == 504) {
                res.redirect(req.originalUrl);
            } else if (e.response && e.response.status == 500) {
                try {
                    Logger.error(e.response.data);
                    let errorString = e.response.data
                        .split('\n')
                        .find((line) => line.trim().length > 0);
                    errorString = `<h3><b>${errorString}</b></h3>`;
                    const mapContent = JSON.parse(
                        fs.readFileSync(
                            `${BUILD_FOLDER}/themeBundle.common.js.map`,
                            { encoding: 'utf8', flag: 'r' },
                        ),
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
                                const pos = smc.originalPositionFor({
                                    line: lineNumber,
                                    column,
                                });
                                if (pos && pos.line != null) {
                                    errorString += `<p>      at  <strong>${
                                        methodName || pos.name || ''
                                    }</strong> (${pos.source}:${pos.line}:${
                                        pos.column
                                    })</p>`;
                                }
                            }
                        } catch (err) {
                            console.log(`    at FAILED_TO_PARSE_LINE`);
                        }
                    });
                    res.send(
                        `<div style="padding: 10px;background: #efe2e0;color: #af2626;">${errorString}</div>`,
                    );
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log(e?.request?.path ?? '', e.message);
            }
        }
    });

    await new Promise((resolve, reject) => {
        server.listen(port, (err) => {
            if (err) {
                return reject(err);
            }
            Logger.info(
                `Starting starter at port -- ${port} in ${
                    isSSR ? 'SSR' : 'Non-SSR'
                } mode`,
            );
            Logger.info(`************* Using Debugging build`);
            resolve(true);
        });
    });
}

export async function startReactServer({ domain, host, isHMREnabled, port }) {
    const { currentContext, app, server, io } = await setupServer({ domain });

    if (isHMREnabled) {
        let webpackConfigFromTheme = {};
        const themeWebpackConfigPath = path.join(
            process.cwd(),
            Theme.REACT_CLI_CONFIG_PATH,
        );

        if (fs.existsSync(themeWebpackConfigPath)) {
            ({ default: webpackConfigFromTheme } = await import(
                themeWebpackConfigPath
            ));
        }

        const ctx = {
            buildPath: path.resolve(process.cwd(), Theme.BUILD_FOLDER),
            NODE_ENV: 'development',
            localThemePort: port,
            context: process.cwd(),
            isHMREnabled,
        };
        const [baseWebpackConfig] = createBaseWebpackConfig(
            ctx,
            webpackConfigFromTheme,
        );

        const compiler = webpack(baseWebpackConfig);

        app.use(
            webpackDevMiddleware(compiler, {
                publicPath: baseWebpackConfig.output.publicPath,
                serverSideRender: true,
                writeToDisk: true,
                stats: 'none',
            }),
        );

        app.use(webpackHotMiddleware(compiler));
    }
    app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));

    app.use((request, response, next) => {
        if (request.url.indexOf('.hot-update.json') !== -1) {
            return response.json({ c: ['themeBundle'], r: [], m: [] });
        }
        next();
    });

    applyProxy(app);

    const uploadedFiles = {};

    app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));

    app.get('/*', async (req, res) => {
        const BUNDLE_DIR = path.join(process.cwd(), path.join('.fdk', 'dist'));
        if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
            return res.status(404).send('Not found');
        }
        // While build is not complete
        if (!fs.existsSync(path.join(BUNDLE_DIR, 'themeBundle.umd.js'))) {
            return res.sendFile(
                path.join(__dirname, '../../', '/dist/helper', '/loader.html'),
            );
        }
        const skyfireUrl = new URL(urlJoin(domain, req.originalUrl));
        const reqChunkUrl = new URL(urlJoin(domain, '__required_chunks'));
        skyfireUrl.searchParams.set('themeId', currentContext.theme_id);
        reqChunkUrl.searchParams.set('themeId', currentContext.theme_id);
        reqChunkUrl.searchParams.set('url', req.originalUrl);
        const response = await axios.get(reqChunkUrl.toString());
        const requiredFiles = ['themeBundle', ...(response.data || [])];

        const User = Configstore.get(CONFIG_KEYS.AUTH_TOKEN);
        const buildFiles = fs.readdirSync(BUNDLE_DIR);

        const promises = [];
        const themeURLs: any = {};
        for (let fileName of buildFiles) {
            const { extension, componentName } = parseBundleFilename(fileName);
            if (
                ['js', 'css'].includes(extension) &&
                requiredFiles.indexOf(componentName) !== -1 &&
                fileName.indexOf('hot-update') === -1
            ) {
                const promise = UploadService.uploadFile(
                    path.join(BUNDLE_DIR, fileName),
                    'fdk-cli-dev-files',
                    User.current_user._id,
                ).then((response) => {
                    const url = response.complete.cdn.url;
                    themeURLs[componentName] = themeURLs[componentName] || {};
                    themeURLs[componentName][extension] = url;
                });
                promises.push(promise);
            }
        }

        await Promise.all(promises);

        const { data: html } = await axios
            .post(skyfireUrl.toString(), {
                themeURLs,
                cliMeta: {
                    port,
                },
            })
            .catch((error) => {
                console.log(error);
                return { data: error };
            });
        let $ = cheerio.load(html);
        $('head').prepend(`
				<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
				<script>
				var socket = io();
				socket.on('reload',function(){
					${
                        isHMREnabled
                            ? `
						try {
							window.APP_DATA.themeBundleUMDURL = '/themeBundle.umd.js';
							window.APP_DATA.isServerRendered = false;
							window.APP_DATA.forceRender = true;
							window.webpackChunkthemeBundle = [];
							// document.getElementById('app').innerHTML='';
							if (window.fpi) {
								window.APP_DATA.reduxData = window.fpi.store.getState();
							}
							window.loadApp().catch(console.log);
						} catch(e) { console.log( e );}
					`
                            : `
						window.location.reload();
					`
                    }
					
				});
				</script>
			`);
        res.send($.html({ decodeEntities: false }));
    });

    return new Promise((resolve, reject) => {
        server.listen(port, (err) => {
            if (err) {
                return reject(err);
            }
            Logger.info(`Starting server at port -- ${port}`);
            Logger.info(`************* Using Debugging build`);
            resolve(true);
        });
    });
}
