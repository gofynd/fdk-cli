# Local Development Server

The fdk-cli dev server provides a full local development environment for themes, including live preview, proxy to the Fynd platform, hot module replacement (HMR), and server-side rendering (SSR) support.

The core implementation is in `src/helper/serve.utils.ts`.

---

## Architecture Overview

When you run `fdk theme serve`, the CLI starts an Express server that:

1. Serves your locally built theme bundles.
2. Proxies API calls to the live Fynd platform (Skyfire).
3. Injects Socket.io for live reload on file changes.
4. Optionally integrates webpack HMR for React themes.
5. Optionally supports SSR by uploading the server bundle to CDN.

There are two distinct server implementations:

| Theme Type | Server Function | HMR Support |
|------------|----------------|-------------|
| Vue2 | `startServer()` | No (file-watch + full reload) |
| React | `startReactServer()` | Yes (webpack-hot-middleware) |

---

## Server Setup

Both server types share a common setup function:

```typescript
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

    app.use(express.json());

    app.get('/_healthz', (req, res) => {
        res.json({ ok: 'ok' });
    });

    return { currentContext, app, server, io };
}
```

Key points:
- The server is a raw `http.createServer()` wrapping Express (not Express's built-in `listen()`), required for Socket.io compatibility.
- A health check endpoint at `/_healthz` is always available.
- Connected sockets are tracked in an array for broadcast reload signals.

---

## Proxy Configuration

The dev server proxies certain request paths to the live Fynd platform so that API calls, CDN resources, and extension endpoints work seamlessly during local development.

### Proxy Routes

```typescript
function applyProxy(app: any) {
    const currentContext = getActiveContext();
    const currentDomain = `https://${currentContext.domain}`;

    const options = {
        target: currentDomain,
        changeOrigin: true,
        cookieDomainRewrite: '127.0.0.1',
        onProxyReq: fixRequestBody,
        onError: (error) => Logger.error(error),
        agent: httpsAgent,
    };

    const corsProxy = createProxyMiddleware(options);

    // Routes WITH request signing
    app.use(['/service', '/ext'], withSignatureMiddleware, corsProxy);

    // Routes WITHOUT request signing
    app.use(['/cdn'], withoutSignatureMiddleware, corsProxy);
}
```

| Path Pattern | Signing | Target | Purpose |
|-------------|---------|--------|---------|
| `/service/*` | Yes (`x-fp-signature`) | Live platform domain | Platform API calls |
| `/ext/*` | Yes (`x-fp-signature`) | Live platform domain | Extension API calls |
| `/cdn/*` | No | Live platform domain | CDN asset fetching |

### Pre-Proxy Middleware

Before proxying, a middleware function rewrites requests:

```typescript
function createPreProxyMiddleware(currentDomain, options, withSignature) {
    return async (req, res, next) => {
        // Rewrite /service to /api/service
        if (req.originalUrl.startsWith('/service')) {
            req.originalUrl = req.originalUrl.replace('/service', '/api/service');
        }

        req.url = req.originalUrl;
        req.baseURL = currentDomain;

        const url = new URL(currentDomain);
        req.headers.host = url.host;

        // Add signature headers only if required
        if (withSignature) {
            const config = await addSignatureFn(options)(req);
            req.headers['x-fp-signature'] = config.headers['x-fp-signature'];
            req.headers['x-fp-date'] = config.headers['x-fp-date'];
        }
        next();
    };
}
```

This ensures that:
- The `Host` header is rewritten to match the target platform domain.
- Request signatures are regenerated for signed routes.
- Request bodies are preserved through the proxy.

---

## Vue2 Theme Server (startServer)

The Vue2 theme server uses a simpler approach without webpack HMR:

```typescript
export async function startServer({ domain, host, isSSR, port }) {
    const { currentContext, app, server, io } = await setupServer({ domain });

    applyProxy(app);

    app.use(express.static(path.resolve(process.cwd(), SERVE_BUILD_FOLDER)));
    // ...
}
```

### Request Handling Flow

1. **Static assets**: Served from `.fdk/distServed/`.
2. **Non-HTML requests**: Fetched from the original source (live platform) and cached.
3. **HTML page requests**:
   a. If the bundle is not yet built, a loader HTML page is returned.
   b. In SSR mode, the common bundle is uploaded to CDN and the URL is sent to Skyfire.
   c. In non-SSR mode, a `__csr=true` query parameter is added.
   d. Skyfire returns the rendered HTML.
   e. The CLI injects Socket.io reload script and local UMD bundle references.
   f. Local CSS assets are also injected.

### SSR vs Client-Only Mode

**SSR mode** (`--ssr true`, default):

```typescript
if (isSSR) {
    const BUNDLE_PATH = path.join(process.cwd(), '/.fdk/distServed/themeBundle.common.js');
    themeUrl = (await UploadService.uploadFile(
        BUNDLE_PATH, 'fdk-cli-dev-files', User.current_user._id,
    )).complete.cdn.url;
}
```

The server bundle (`themeBundle.common.js`) is uploaded to the Fynd CDN so Skyfire can execute it for server-side rendering. This provides a production-like experience but requires uploading on every change.

**Client-only mode** (`--ssr false`):

```typescript
else {
    jetfireUrl.searchParams.set('__csr', 'true');
}
```

Skyfire returns a shell HTML page, and the theme renders entirely on the client. Faster development loop, but no SSR preview.

### Bundle Injection

The server injects local bundles into the HTML returned by Skyfire:

```typescript
// Inject UMD JS bundles
const umdJsInitial = $('link[data-umdjs-cli-source="initial"]');
umdJsInitial.after(
    `<script type="text/javascript" src="${urlJoin(
        getFullLocalUrl(port), 'themeBundle.umd.js',
    )}"></script>`,
);

// Inject CSS bundles
const cssAssests = glob.sync(`${Theme.SERVE_BUILD_FOLDER}/**.css`);
const cssInitial = $('link[data-css-cli-source="initial"]');
cssAssests.forEach((cssLink) => {
    cssInitial.after(
        `<link rel="stylesheet" href="${urlJoin(
            getFullLocalUrl(port), cssLink.replace('./.fdk/distServed/', ''),
        )}"></link>`,
    );
});
```

---

## React Theme Server (startReactServer)

The React theme server supports webpack Hot Module Replacement (HMR):

### Webpack Dev Middleware

```typescript
if (isHMREnabled) {
    const ctx = {
        buildPath: path.resolve(process.cwd(), Theme.SERVE_BUILD_FOLDER),
        NODE_ENV: 'development',
        localThemePort: port,
        context: process.cwd(),
        isHMREnabled,
    };
    const [baseWebpackConfig] = createBaseWebpackConfig(ctx, webpackConfigFromTheme);
    const compiler = webpack(baseWebpackConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: baseWebpackConfig.output.publicPath,
        serverSideRender: true,
        writeToDisk: true,
        stats: 'none',
    }));

    app.use(webpackHotMiddleware(compiler));
}
```

Key configuration:
- `writeToDisk: true` -- Bundles are written to disk (`.fdk/distServed/`) so they can be uploaded to CDN for SSR.
- `serverSideRender: true` -- Enables server-side rendering compatible output.
- `stats: 'none'` -- Suppresses verbose webpack output.

### HMR Hot Update Filtering

Hot update requests are intercepted to prevent them from being routed to Skyfire:

```typescript
app.use((request, response, next) => {
    if (request.url.indexOf('.hot-update.json') !== -1) {
        return response.json({ c: ['themeBundle'], r: [], m: [] });
    }
    if (request.url.indexOf('.hot-update.js') !== -1) {
        return response.send('');
    }
    if (/\.\w+$/.test(request.url) && !/^\/public/.test(request.url)) {
        return response.send('');
    }
    next();
});
```

### React Theme Page Rendering

For HTML page requests, the React server:

1. Fetches required chunk information from Skyfire's `__required_chunks` endpoint.
2. Uploads required build files to CDN.
3. Sends the CDN URLs to Skyfire via POST.
4. Receives rendered HTML and injects Socket.io and HMR scripts.

```typescript
const reqChunkUrl = new URL(urlJoin(domain, '__required_chunks'));
reqChunkUrl.searchParams.set('themeId', currentContext.theme_id);
reqChunkUrl.searchParams.set('url', req.originalUrl);
const response = await axios.get(reqChunkUrl.toString());
const requiredFiles = ['themeBundle', ...(response.data || [])];
```

### Smart Reload with HMR

When HMR is enabled, the Socket.io reload script uses a "soft reload" approach instead of a full page refresh:

```typescript
socket.on('reload', function(){
    try {
        window.APP_DATA.themeBundleUMDURL = '/themeBundle.umd.js';
        window.APP_DATA.isServerRendered = false;
        window.APP_DATA.forceRender = true;
        window.webpackChunkthemeBundle = [];
        if (window.fpi) {
            window.APP_DATA.reduxData = window.fpi.store.getState();
        }
        window.loadApp().catch(console.log);
    } catch(e) { console.log(e); }
});
```

This preserves the Redux state and re-renders the application without a full page reload.

When HMR is disabled, a simple `window.location.reload()` is used instead.

---

## Socket.io Reload Signals

Socket.io is used to trigger browser reloads when theme files change:

```typescript
export function reload() {
    sockets.forEach((s) => {
        s.emit('reload');
    });
}
```

The Socket.io client library is injected into the page HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
<script>
    var socket = io();
    socket.on('reload', function(){
        location.reload();
    });
</script>
```

The `reload()` function is called by the build system whenever a file change triggers a rebuild. Note that Socket.io v2.5.1 is used on the server side.

---

## Locale Serving

The React dev server includes a locale endpoint for serving translation files during development:

```typescript
app.get('/translate-ui-labels', (req, res) => {
    const locale = req.query.locale || DEFAULT_LOCALE;
    const localesFolder = path.join(process.cwd(), 'theme', 'locales');

    if (!fs.existsSync(localesFolder)) {
        return res.json({ items: [] });
    }

    const locales = fs.readdirSync(localesFolder)
        .filter((file) => !file.endsWith('.schema.json') && file.split('.')[0] === locale);

    const localesArray = [];
    locales.forEach((locale) => {
        const filePath = path.join(localesFolder, locale);
        const content = fs.readFileSync(filePath, 'utf8');
        localesArray.push({
            locale: locale.replace('.json', ''),
            resource: JSON.parse(content),
        });
    });

    res.json({ items: localesArray });
});
```

Locale files are read from `theme/locales/` directory. Files matching `<locale>.json` are served, while `*.schema.json` files are excluded.

---

## Static Asset Serving

Both server types serve static assets from the build output directory:

```typescript
const SERVE_BUILD_FOLDER = './.fdk/distServed';
app.use(express.static(path.resolve(process.cwd(), SERVE_BUILD_FOLDER)));
```

For the React server, this is registered after the webpack dev middleware so that HMR takes precedence for JS/CSS assets.

---

## SSL/HTTPS Support

### Custom CA Certificates

If you are behind a VPN or corporate proxy that uses custom CA certificates:

```bash
# Set via environment variable
FDK_EXTRA_CA_CERTS=/path/to/ca-cert.pem fdk theme serve

# Or set permanently via config
fdk config set cafile /path/to/ca-cert.pem
```

The proxy middleware uses the custom CA when creating HTTPS agents:

```typescript
if (process.env.FDK_EXTRA_CA_CERTS) {
    const ca = fs.readFileSync(process.env.FDK_EXTRA_CA_CERTS);
    httpsAgent = new https.Agent({ ca });
}
```

### Disabling SSL Verification

For development environments with self-signed certificates:

```bash
# Set via environment variable
FDK_SSL_NO_VERIFY=true fdk theme serve

# Or set permanently via config
fdk config set strict-ssl false
```

This sets `rejectUnauthorized: false` on the HTTPS agent:

```typescript
if (process.env.FDK_SSL_NO_VERIFY == 'true') {
    httpsAgent = new https.Agent({ rejectUnauthorized: false });
}
```

The CLI will log a warning when SSL verification is bypassed:

```
Bypassing SSL verification
```

---

## Port Detection

The dev server uses `detect-port` to find an available port:

```typescript
import detect from 'detect-port';

export function getPort(port) {
    return detect(port);
}
```

The default port is `5001`. If it is already in use, the next available port is chosen.

You can specify a custom port:

```bash
fdk theme serve --port 3000
```

---

## Extension Section Server

A separate, simpler server is available for serving extension section bundles:

```typescript
export async function startExtensionServer(options: ExtensionServerOptions) {
    const { bundleDist, port, framework } = options;
    const app = express();
    const server = require('http').createServer(app);

    if (framework === 'react') {
        const io = require('socket.io')(server);
        // Socket.io setup for React framework reload
    }

    app.use(cors());
    app.use(express.json());
    app.use(express.static(bundleDist));

    return new Promise((resolve, reject) => {
        server.listen(port, (err) => {
            if (err) return reject(err);
            Logger.info(`Starting server at port -- ${port}`);
            resolve(true);
        });
    });
}
```

This server only serves static files from the extension's build output and optionally provides Socket.io for React framework hot reloading.

---

## Error Handling

### SSR Errors

When SSR fails with a 500 error, the dev server provides source-mapped error output:

```typescript
const mapContent = JSON.parse(
    fs.readFileSync(`${SERVE_BUILD_FOLDER}/themeBundle.common.js.map`, { encoding: 'utf8' }),
);
const smc = await new SourceMapConsumer(mapContent);
const stack = stackTraceParser(e.response.data);
```

This maps the bundled stack trace back to original source files, making debugging much easier.

### 504 Timeout Errors

If Skyfire returns a 504 (gateway timeout), the request is automatically retried via redirect:

```typescript
if (e?.response && e?.response?.status == 504) {
    res.redirect(req.originalUrl);
}
```

---

## How the Dev Server Connects to Live Skyfire

The connection between the local dev server and Skyfire (Fynd's rendering engine) works as follows:

1. The dev server reads the active context from `.fdk/context.json` to get the `domain` and `theme_id`.
2. For every HTML page request, the server sends a POST to `https://<domain>/<path>?themeId=<theme_id>`.
3. The POST body contains the local dev server URL and, for React themes, CDN URLs for uploaded bundles.
4. Skyfire renders the page (SSR or CSR shell) and returns HTML.
5. The dev server modifies the HTML to point JS/CSS references to the local server.
6. The browser loads the page from the local server, with API calls proxied to the live platform.

This approach gives you a production-like environment while developing locally, with real data and real platform APIs.
