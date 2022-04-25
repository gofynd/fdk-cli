import path from 'path';
import fs from 'fs'
import Logger from '../lib/Logger';
import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import { SourceMapConsumer } from 'source-map'
import urlJoin from 'url-join';
import { parse as stackTraceParser}  from 'stacktrace-parser';
import proxy from 'express-http-proxy';
import FormData from 'form-data';
import UploadService from '../lib/api/services/upload.service';

const BUILD_FOLDER = './.fdk/dist';
const port = 5001;
let sockets = [];
let publicCache = {};

export function reload() {
	sockets.forEach((s) => {
		s.emit('reload');
	});
}

export function getLocalBaseUrl(host) {
	return host.replace('api', 'localdev');
}

export function getFullLocalUrl(host) {
	return `${getLocalBaseUrl(host)}:${port}`;
}

export async function startServer({ domain, host, isSSR }) {
	const app = require('https-localhost')(getLocalBaseUrl(host));
	const certs = await app.getCerts();
	const server = require('https').createServer(certs, app);
	const io = require('socket.io')(server);

	io.on('connection', function (socket) {
		sockets.push(socket);
		socket.on('disconnect', function () {
			sockets = sockets.filter((s) => s !== socket);
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
		} catch(e) {
			console.log("Error loading file ", url)
		}
	});

	app.get('/_healthz', (req, res) => {
		res.json({ ok: 'ok' });
	});

	app.use('/platform', proxy(`https://${host}`, {
	  proxyReqPathResolver: function (req) {
	    return `/platform${req.url}`;
	  }
	}));
	app.use(`/api`, proxy(`${host}`));
	app.use(express.static(path.resolve(process.cwd(), BUILD_FOLDER)));

	app.get('/*', async (req, res) => {

		if (req.originalUrl == '/favicon.ico' || req.originalUrl == '/.webp') {
			return res.status(404).send('Not found');
		}

		const jetfireUrl = new URL(urlJoin(domain, req.originalUrl));

		console.log(req.hostname, req.url);
		console.log('original URL', req.originalUrl);

		if (!isSSR) {
			jetfireUrl.searchParams.set('__csr', 'true');
		}
		try {
			const BUNDLE_PATH = path.join(process.cwd(), '/.fdk/dist/themeBundle.common.js');
			// let themeBundleCommonJs = await fs.createReadStream(BUNDLE_PATH);
			// var form = new FormData();
			// form.append('data', themeBundleCommonJs);
			
			const imageLoc = await UploadService.uploadFile(BUNDLE_PATH, 'application-theme-assets', "abcdefgh");
			console.log('Jetfire URL: ', jetfireUrl.toString());
			console.log('S3 URL: ', imageLoc.start.cdn.url);
			
			// Bundle Buffer directly passed on with POST request body.
			try {
				var { data: html } = await axios({
					method: 'POST',
					url: jetfireUrl.toString(),
					headers: {
						'content-type': 'application/json',
      					'Accept': 'application/json'
					},
					data: {
						theme_url: imageLoc.start.cdn.url
					}
					// headers: form.getHeaders(),
					// data: form
				});
			} catch(e) {
				console.log('POST API ERROR', e);
			}

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
				urlJoin(getFullLocalUrl(host), 'themeBundle.umd.js')
			);
			$('#theme-umd-js-link').attr(
				'href',
				urlJoin(getFullLocalUrl(host), 'themeBundle.umd.js')
			);
			$('#theme-css').attr(
				'href',
				urlJoin(getFullLocalUrl(host), 'themeBundle.css')
			);
			res.send($.html({ decodeEntities: false }));
		} catch (e) {
			if (e.response && e.response.status == 504) {
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
		server.listen(port, (err) => {
			if (err) {
				return reject(err);
			}
			Logger.success(`Starting starter at port -- ${port} in ${isSSR? 'SSR': 'Non-SSR'} mode`);
			resolve(true);
		});
	});
}