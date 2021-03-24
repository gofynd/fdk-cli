const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const urlJoin = require('url-join');
const chokidar = require('chokidar');
const { devBuild } = require('../../utils/build');
const { getApp } = require('../../apis/app');
const { getActiveContext } = require('../../utils/utils');
const child = require('child_process');
const buildFolder = './.fdk/dist';
const express = require('express');
const open = require('open');
const axios = require('axios');
const cheerio = require('cheerio');
const proxy = require('express-http-proxy');
const localtunnel = require('localtunnel');
const stackTraceParser = require('stacktrace-parser');
const { SourceMapConsumer } = require('source-map');

const port = 5000;
let sockets = [];
let publicCache = {};
let tunnel

function reload() {
	sockets.forEach((s) => {
		s.emit('reload');
	});
}

function getLocalBaseUrl(host) {
	return host.replace('api', 'localdev');
}

function getFullLocalUrl(host) {
	return `https://${getLocalBaseUrl(host)}:${port}`;
}

async function createTunnel() {
	tunnel = await localtunnel({ port, local_https: true, allow_invalid_cert: true });
	console.log(chalk.bold.green(`Tunnelled at -- ${tunnel.url}`));
	reload()
}

function isTunnelRunning() {
	return tunnel && !tunnel.closed
}

async function checkTunnel() {
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

async function startServer({ domain, host, isSSR }) {
	const app = require('https-localhost')(getLocalBaseUrl(host));
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

	// app.use('/platform', proxy(`https://${host}`, {
	//   proxyReqPathResolver: function (req) {
	//     return `/platform${req.url}`;
	//   }
	// }));
	app.use(`/api`, proxy(`https://${host}`));
	app.use(express.static(path.resolve(process.cwd(), buildFolder)));

	app.get('/*', async (req, res) => {
		if (req.originalUrl == '/themeBundle.common.js') {
			return res.sendFile(path.resolve(process.cwd(), `${buildFolder}/themeBundle.common.js`))
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
			jetfireUrl.searchParams.append('__cli_protocol', protocol);
			jetfireUrl.searchParams.append('__cli_url', tnnelHost);
		} else {
			jetfireUrl.searchParams.append('__csr', true);
		}
		try {
			let { data: html } = await axios.get(jetfireUrl.toString());
			let $ = cheerio.load(html);
			$('head').prepend(`
					<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
					<script>
					var socket = io();
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
				if (!isTunnelRunning()) {
					await createTunnel()
				}
				res.redirect(req.originalUrl)

			} else if (e.response && e.response.status == 500) {
				try {
					let errorString = e.response.data.split('\n').find(line => line.trim().length > 0);
					errorString = `<h3><b>${errorString}</b></h3>`;
					const mapContent = JSON.parse(fs.readFileSync(`${buildFolder}/themeBundle.common.js.map`, { encoding: 'utf8', flag: 'r' }));
					const smc = await new SourceMapConsumer(mapContent);
					const stack = stackTraceParser.parse(e.response.data);
					stack.forEach(({ methodName, lineNumber, column }) => {
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
			console.log(chalk.bold.green(`Starting starter at port -- ${port}`));
			if (isSSR) {
				interval = setInterval(checkTunnel, 1000 * 30);
			}
			resolve();
		});
	});
}

exports.command = 'serve';
exports.desc = 'Local preview of theme';

exports.builder = yargs => {
	return yargs.options('ssr', {
		describe: 'Enable Server Side Redering',
		default: true,
	});
}

exports.handler = async (args) => {
	try {
		const isSSR = typeof args['ssr'] === "boolean" ? args['ssr'] : args['ssr']  == 'true' ? true : false
		let { appId, token, host } = await Promise.resolve().then(() =>
			getActiveContext()
		);
		let { data: appInfo } = await getApp(appId, token, host);
		let domain = Array.isArray(appInfo.domains)
			? `https://${appInfo.domains[0].name}`
			: `https://${appInfo.domain.name}`;

		// initial build
		console.log(chalk.bold.green(`Locally building............`));
		await devBuild({
			buildFolder,
			imageCdnUrl: urlJoin(getFullLocalUrl(host), 'assets/images'),
		});

		// start dev server
		console.log(chalk.bold.green(`Starting server`));
		await startServer({ domain, host, isSSR });

		// open browser
		await open(getFullLocalUrl(host));

		// watch for changes
		console.log(chalk.bold.green(`Watching files for changes`));
		let watcher = chokidar.watch(path.resolve(process.cwd(), 'theme'), {
			persistent: true,
		});
		watcher.on('change', async () => {
			console.log(chalk.bold.green(`building............`));
			await devBuild({
				buildFolder: path.resolve(process.cwd(), buildFolder),
				imageCdnUrl: urlJoin(getFullLocalUrl(host), 'assets/images'),
			});
			reload();
		});
	} catch (error) {
		console.log(error.message);
		process.exit(1);
	}
};
