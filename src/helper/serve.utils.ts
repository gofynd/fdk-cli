import path from 'path';
import fs from 'fs'
import localtunnel from 'localtunnel'
import Logger from '../lib/Logger';
import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import { SourceMapConsumer } from 'source-map'
import urlJoin from 'url-join';
import { parse as stackTraceParser}  from 'stacktrace-parser';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { addSignatureFn }  from '../lib/api/helper/interceptors';
import detect from 'detect-port';
import chalk from 'chalk';
const { transformRequest } = axios.defaults;

const BUILD_FOLDER = './.fdk/dist';
let port = 5001;
let sockets = [];
let publicCache = {};
let tunnel

export function reload() {
	sockets.forEach((s) => {
		s.emit('reload');
	});
}

export function getLocalBaseUrl() {
	return "https://localhost";
}

export function getFullLocalUrl() {
	return `${getLocalBaseUrl()}:${port}`;
}

export async function createTunnel() {
	tunnel = await localtunnel({ port, local_https: true, allow_invalid_cert: true });
	Logger.success(`Tunnelled at -- ${tunnel.url}`);
	reload()
}

function isTunnelRunning() {
	return tunnel && !tunnel.closed
}

export async function checkTunnel() {
	try {
		if (isTunnelRunning()) {
			const res = await axios.get(tunnel.url + '/_healthz')
			if (res.data.ok === 'ok') {
				return
			}
		}
		await createTunnel()
	} catch (e) {
		await createTunnel()
	}
}

function getPort(port) {
	return detect(port);
}

export async function startServer({ domain, host, isSSR, serverPort }) {

	try {
		port = await getPort(serverPort);
		if(port !== serverPort) Logger.warn(chalk.bold.yellowBright(`PORT: ${serverPort} is busy, Switching to PORT: ${port}`));
	} catch(e) {
		Logger.error('Error occurred while detecting port.\n', e);
	}

	const app = require('https-localhost')(getLocalBaseUrl());
	const certs = await app.getCerts();
	const server = require('https').createServer(certs, app);
	const io = require('socket.io')(server);
	if (isSSR && !isTunnelRunning()) {
		await createTunnel()
	}

	io.on('connection', function (socket) {
		sockets.push(socket);
		socket.on('disconnect', function () {
			sockets = sockets.filter((s) => s !== socket);
		});
	});

	app.use('/public', async (req, res, done) => {
		let { url } = req;
		if (publicCache[url]) {
			res.set(publicCache[url].headers);
			return res.send(publicCache[url].body);
		}
		let networkRes = await axios.get(urlJoin(domain, 'public', req.url));
		publicCache[url] = publicCache[url] || {};
		publicCache[url].body = networkRes.data;
		publicCache[url].headers = networkRes.headers;
		res.set(publicCache[url].headers);
		return res.send(publicCache[url].body);
	});

	app.get('/_healthz', (req, res) => {
		res.json({ ok: 'ok' });
	});

	// parse application/x-www-form-urlencoded
	app.use(express.json());
	  
	const options = {
		target: host, // target host
		changeOrigin: true, // needed for virtual hosted sites
		cookieDomainRewrite: 'localhost', // rewrite cookies to localhost
		onProxyReq: fixRequestBody,
		router: function(req) {
			//change host for /ext routes
			if(req.baseUrl === '/ext'){
				return `https://${req.headers['x-fp-cli-forwarded-host']}`;
			}
			return host;
		}
	  };

	  // proxy to solve CORS issue
	  const corsProxy = createProxyMiddleware(options);
	  app.use(['/service', '/ext'], async (req,res,next) => {
		// formating express request object as per axios so signature logic will work  
		req.transformRequest = transformRequest;
		req.url = req.originalUrl;
		req.data = req.body;
		if(req.baseUrl === '/ext'){
			host = `https://${req.headers['x-fp-cli-forwarded-host']}`;
		}
		req.baseURL = host;
		delete req.headers['x-fp-signature'];
		delete req.headers['x-fp-date'];
		const url = new URL(host);
		req.headers.host = url.host;
		// regenerating signature as per proxy server
		const config = await addSignatureFn(options)(req);
		req.headers['x-fp-signature'] = config.headers['x-fp-signature'];
		req.headers['x-fp-date'] = config.headers['x-fp-date'];
		next();
	  }, corsProxy);

	app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));

	app.get('/*', async (req, res) => {
		if (req.originalUrl == '/themeBundle.common.js') {
			return res.sendFile(path.resolve(process.cwd(), `${BUILD_FOLDER}/themeBundle.common.js`))
		}
		if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
			return res.status(404).send('Not found');
		}
		console.log(req.hostname, req.url)
		const jetfireUrl = new URL(urlJoin(domain, req.originalUrl));
		if (isSSR) {
			if (!isTunnelRunning()) {
				await createTunnel()
			}
			const { protocol, host: tnnelHost } = new URL(tunnel.url);
			jetfireUrl.searchParams.set('__cli_protocol', protocol);
			jetfireUrl.searchParams.set('__cli_url', tnnelHost);
		} else {
			jetfireUrl.searchParams.set('__csr', 'true');
		}
		jetfireUrl.searchParams.set('__cli_port', port.toString());
		try {
			let { data: html } = await axios.get(jetfireUrl.toString());
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
			$('#theme-umd-js').attr(
				'src',
				urlJoin(getFullLocalUrl(), 'themeBundle.umd.js')
			);
			$('#theme-umd-js-link').attr(
				'href',
				urlJoin(getFullLocalUrl(), 'themeBundle.umd.js')
			);
			$('#theme-css').attr(
				'href',
				urlJoin(getFullLocalUrl(), 'themeBundle.css')
			);
			res.send($.html({ decodeEntities: false }));
		} catch (e) {
			if (e.response && e.response.status == 504) {
				if (!isTunnelRunning()) {
					await createTunnel()
				}
				res.redirect(req.originalUrl)
			} else if (e.response && e.response.status == 500) {
				try {
					Logger.error(e.response.data)
					let errorString = e.response.data.split('\n').find(line => line.trim().length > 0);
					errorString = `<h3><b>${errorString}</b></h3>`;
					const mapContent = JSON.parse(fs.readFileSync(`${BUILD_FOLDER}/themeBundle.common.js.map`, { encoding: 'utf8', flag: 'r' }));
					const smc = await new SourceMapConsumer(mapContent);
					const stack = stackTraceParser(e.response.data);
					stack?.forEach(({ methodName, lineNumber, column }) => {
						try {
							if (lineNumber == null || lineNumber < 1) {
								errorString += `<p>      at  <strong>${methodName || ''}</strong></p>`;
							} else {
								const pos = smc.originalPositionFor({ line: lineNumber, column });
								if (pos && pos.line != null) {
									errorString += `<p>      at  <strong>${methodName || pos.name || ''}</strong> (${pos.source}:${pos.line}:${pos.column})</p>`;
								}
							}
						} catch (err) {
							console.log(`    at FAILED_TO_PARSE_LINE`);
						}
					});
					res.send(`<div style="padding: 10px;background: #efe2e0;color: #af2626;">${errorString}</div>`);
				}
				catch (e) {
					console.log(e)
				}
			} else {
				console.log(e.request && e.request.path, e.message)
			}
		}
	});

	await new Promise((resolve, reject) => {
		let interval;
		server.listen(port, (err) => {
			if (err) {
				if (isSSR) {
					if (interval) {
						clearInterval(interval);
					}
					tunnel.close()
				}
				return reject(err);
			}
			Logger.success(`Starting server on port -- ${port}`);
			if (isSSR) {
				interval = setInterval(checkTunnel, 1000 * 30);
			}
			resolve(true);
		});
	});
}