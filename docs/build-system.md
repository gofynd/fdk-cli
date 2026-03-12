# Build System

fdk-cli supports two theme frameworks (React and Vue2) and extension section builds. Each has its own build pipeline, webpack configuration, and output format.

The build system source files:

- `src/helper/build.ts` -- Build orchestration (Vue2 + React)
- `src/helper/theme.react.config.ts` -- React theme webpack configuration
- `src/helper/extension.react.config.ts` -- Extension section webpack configuration

---

## Output Directories

| Directory | Purpose | Used By |
|-----------|---------|---------|
| `.fdk/dist/` | Production build output (for `fdk theme sync`) | Upload to platform |
| `.fdk/distServed/` | Development build output (for `fdk theme serve`) | Local dev server |

Both directories are cleaned before each build.

---

## React Theme Webpack Configuration

React themes use webpack directly (not Vue CLI). The configuration is generated in `src/helper/theme.react.config.ts`.

### Entry Points

The webpack entry is defined by the theme's own webpack config (typically `themeBundle` pointing to `theme/index.js`). The CLI prepends additional entries depending on the build mode:

```typescript
if (mergedBaseConfig.entry.hasOwnProperty('themeBundle')) {
    let entryPoints = [...mergedBaseConfig.entry['themeBundle']];
    if (isLocal && isHMREnabled) {
        entryPoints.unshift(require.resolve('webpack-hot-middleware/client'));
    } else if (!isLocal) {
        entryPoints.unshift(path.resolve(targetDirectory || context, CDN_ENTRY_FILE));
    }
    mergedBaseConfig.entry['themeBundle'] = entryPoints;
}
```

- **Development with HMR**: `webpack-hot-middleware/client` is prepended for HMR support.
- **Production**: A CDN entry file (`.fdk/cdn_index.js`) is prepended for dynamic webpack public path.

### Output Configuration

```typescript
output: {
    path: buildPath,
    filename: isLocal
        ? 'themeBundle.umd.js'
        : 'themeBundle.[contenthash].umd.js',
    publicPath: isLocal ? localBasePath : assetNormalizedBasePath,
    chunkFilename: isLocal
        ? '[name].themeBundle.umd.js'
        : '[name].themeBundle.[contenthash].umd.js',
    library: {
        name: 'themeBundle',
        type: 'umd',
        umdNamedDefine: true,
    },
    globalObject: 'typeof self !=="undefined" ? self : this',
    assetModuleFilename: '[contenthash][ext]',
}
```

Key details:
- **UMD format**: Themes are built as UMD libraries so they can be loaded both on the server (Node.js for SSR) and in the browser.
- **Content hashing**: Production builds use `[contenthash]` for cache busting. Development builds use stable filenames.
- **Public path**: In development, set to `http://127.0.0.1:<port>/`. In production, set to the CDN base path.

### Externals

React themes exclude certain libraries from the bundle since they are provided by the Fynd platform runtime:

```typescript
externals: {
    react: 'React',
    'react-router-dom': 'ReactRouterDOM',
    'fdk-core/components': 'sharedComponentLibrary',
    'fdk-core/utils': 'sharedUtilsLibrary',
    'react-helmet-async': 'helmetModule',
    'styled-components': 'styledComponents',
}
```

These globals are provided by the Fynd storefront when the theme is loaded.

### Code Splitting

Code splitting is **disabled** for theme bundles:

```typescript
optimization: {
    splitChunks: {
        chunks() {
            return false;
        },
    },
}
```

All code is bundled into the main `themeBundle.umd.js` and named async chunks. This is because the Fynd platform manages chunk loading through its own mechanism.

### Minification

Production builds use TerserPlugin with function and class name preservation:

```typescript
optimization: {
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                keep_fnames: true,
                keep_classnames: true,
            },
        }),
    ],
}
```

Function names are preserved because the platform may reference component names for section mapping.

### HMR Plugins

In development mode with HMR enabled:

```typescript
plugins: [
    ...(isLocal && isHMREnabled
        ? [new webpack.HotModuleReplacementPlugin()]
        : []),
    ...(isLocal && isHMREnabled
        ? [new ReactRefreshWebpackPlugin({ overlay: false })]
        : []),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
]
```

- `HotModuleReplacementPlugin` -- Enables webpack HMR.
- `ReactRefreshWebpackPlugin` -- Enables React Fast Refresh (component-level hot reloading). The error overlay is disabled.
- `ProvidePlugin` for `Buffer` -- Polyfills Node.js Buffer for browser environments.

### Webpack Config Merging

Themes can provide their own webpack configuration. The CLI merges the theme's config with the base config using `webpack-merge`:

```typescript
const mergedBaseConfig = mergeWithRules({
    module: {
        rules: {
            test: 'match',
            use: 'append',
        },
    },
})(extendedWebpackResolved, baseWebpackConfig);
```

The merge strategy:
- Module rules with matching `test` patterns have their `use` arrays appended (not replaced).
- All other properties use the default merge behavior (last wins for primitives, deep merge for objects).

Theme webpack config path: The CLI looks for a config at the path defined by `Theme.REACT_CLI_CONFIG_PATH`.

---

## Dynamic Webpack Public Path

For production builds, the webpack `publicPath` needs to point to the CDN URL where assets are hosted. Since this URL is not known at build time, fdk-cli generates a dynamic CDN script:

```typescript
export const dynamicCDNScript = ({ assetNormalizedBasePath, vueJs }) => {
    const cdnBasePath = vueJs ? `${assetNormalizedBasePath}/` : assetNormalizedBasePath;
    return `
        function getCDNurl() {
            let cdnUrl = '${cdnBasePath}';
            try {
                if (fynd_platform_cdn) {
                    cdnUrl = fynd_platform_cdn;
                } else {
                    console.warn('Dynamic CDN path not found!');
                }
            } catch (error) {
                console.warn('Could not set dynamic CDN path');
            }
            return cdnUrl;
        }
        __webpack_public_path__ = getCDNurl();
    `;
};
```

This script is written to `.fdk/cdn_index.js` before the build and prepended to the entry point. At runtime, it checks for a `fynd_platform_cdn` global variable (set by the Fynd storefront) and uses it as the webpack public path. If the global is not available, it falls back to the build-time CDN base path.

The file is deleted after the build completes.

---

## Vue2 Theme Configuration

Vue2 themes use Vue CLI Service (`@vue/cli-service`) for building.

### Production Build

```typescript
export function build({ buildFolder, imageCdnUrl, assetCdnUrl, assetHash = '' }) {
    const VUE_CLI_PATH = path.join('.', 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');

    let b = exec(
        `node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle --filename ${assetHash}_themeBundle ${CDN_ENTRY_FILE}`,
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                IMAGE_CDN_URL: imageCdnUrl,
                ASSET_CDN_URL: assetCdnUrl,
                ASSET_HASH: assetHash,
                NODE_ENV: 'production',
                VUE_CLI_SERVICE_CONFIG_PATH: path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH),
                BUILD_TYPE: 'sync',
            },
        },
    );
}
```

Key details:
- `--target lib` -- Builds as a library (UMD output).
- `--name themeBundle` -- Output library name.
- `--filename ${assetHash}_themeBundle` -- Filename includes a hash for cache busting.
- The CDN entry file (`cdn_index.js`) is used as the entry point, which imports `theme/index.js`.
- Environment variables `IMAGE_CDN_URL`, `ASSET_CDN_URL`, and `ASSET_HASH` are passed for asset URL resolution.

### Development Build

```typescript
export function devBuild({ buildFolder, imageCdnUrl, isProd }) {
    let b = exec(
        `node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle ${DEV_VUE_THEME_ENTRY_FILE}`,
        {
            env: {
                ...process.env,
                IMAGE_CDN_URL: imageCdnUrl,
                NODE_ENV: (isProd && 'production') || 'development',
                VUE_CLI_SERVICE_CONFIG_PATH: path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH),
                BUILD_TYPE: 'serve',
            },
        },
    );
}
```

The development build uses `theme/index.js` directly as the entry point (no CDN wrapper), sets `NODE_ENV` to `development`, and sets `BUILD_TYPE` to `serve`.

### Node 18+ Compatibility

For Node.js >= 18, the `--openssl-legacy-provider` flag is added to handle OpenSSL changes:

```typescript
const isNodeVersionIsGreaterThan18 = +process.version.split('.')[0].slice(1) >= 18;
// ...
...(isNodeVersionIsGreaterThan18 && { NODE_OPTIONS: '--openssl-legacy-provider' }),
```

---

## React Theme Build Functions

### Production Build (devReactBuild)

Despite its name, `devReactBuild` handles both development and production builds:

```typescript
export async function devReactBuild({
    buildFolder, runOnLocal, assetBasePath, localThemePort,
    imageCdnUrl, isHMREnabled, targetDirectory
}): Promise<MultiStats> {
    const buildPath = path.join(process.cwd(), buildFolder);
    rimraf.sync(buildPath);  // Clean build directory

    let webpackConfigFromTheme = {};
    const themeWebpackConfigPath = path.join(process.cwd(), Theme.REACT_CLI_CONFIG_PATH);
    if (fs.existsSync(themeWebpackConfigPath)) {
        ({ default: webpackConfigFromTheme } = await import(themeWebpackConfigPath));
    }

    const ctx = {
        buildPath,
        NODE_ENV: (!runOnLocal && 'production') || 'development',
        assetBasePath, imageCdnUrl, localThemePort,
        context: process.cwd(), isHMREnabled, targetDirectory
    };

    const baseWebpackConfig = createBaseWebpackConfig(ctx, webpackConfigFromTheme);
    // ...
    webpack(baseWebpackConfig, (err, stats) => { /* ... */ });
}
```

When `runOnLocal` is `false` (production), the CDN entry file is generated and prepended to the entry.

### Watch Mode (devReactWatch)

For development with file watching (used when HMR is not available):

```typescript
export async function devReactWatch({ buildFolder, ... }, callback) {
    const compiler = webpack(baseWebpackConfig);
    compiler.watch({
        aggregateTimeout: 1500,
        ignored: /node_modules/,
        poll: undefined,
    }, (err, stats) => {
        callback(stats);
    });
}
```

- `aggregateTimeout: 1500` -- Waits 1.5 seconds after a change before rebuilding (debounce).
- `ignored: /node_modules/` -- Ignores changes in node_modules.
- The callback is invoked after each rebuild, typically triggering a Socket.io reload.

---

## Extension Build Configuration

Extension sections have their own webpack config in `src/helper/extension.react.config.ts`.

### UMD Bundle

```typescript
const baseConfig: Configuration = {
    externals: {
        react: 'React',
        'react-router-dom': 'ReactRouterDOM',
        'fdk-core/components': 'sharedComponentLibrary',
        'fdk-core/utils': 'sharedUtilsLibrary',
        'react-helmet-async': 'helmetModule',
    },
    output: {
        filename: `${env.bundleName}.umd.min.js`,
        library: {
            name: 'extension',
            type: 'umd',
            umdNamedDefine: true,
        },
        globalObject: 'typeof self !=="undefined" ? self : this',
    },
};
```

### CommonJS Bundle (for SSR)

Production builds also generate a CommonJS bundle for server-side rendering:

```typescript
const sectionConfig: Configuration = {
    mode: 'production',
    target: 'node',
    externals: {
        react: 'React',
        'fdk-core/components': 'fs',
        'react-router-dom': 'fs',
        'fdk-core/utils': 'fs',
        'react-helmet-async': 'fs',
    },
    output: {
        filename: 'sections.commonjs.js',
        library: {
            name: 'sections',
            type: 'commonjs',
        },
    },
};
```

The externals map platform libraries to `'fs'` (a no-op in the server context) since these are not needed during SSR extraction.

### Local Development Socket Injection

For local development, a `CustomSnippetPlugin` injects a Socket.io client into every JS bundle:

```typescript
class CustomSnippetPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('CustomSnippetPlugin', (compilation, callback) => {
            for (const filename in compilation.assets) {
                if (filename.endsWith('.js')) {
                    let source = compilation.assets[filename].source();
                    source += `\n\n// Custom Snippet Start\n${snippetCode}\n// Custom Snippet End\n`;
                    compilation.assets[filename] = {
                        source: () => source,
                        size: () => source.length
                    };
                }
            }
            callback();
        });
    }
}
```

The injected snippet connects to the local dev server's Socket.io and reloads the page when changes are detected:

```javascript
const _script = document.createElement('script');
_script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
_script.onload = function () {
    var socket = io('http://127.0.0.1:<port>');
    socket.on('reload', function(){
        window.location.reload();
    });
};
document.head.appendChild(_script);
```

### Build Output

| Build Mode | Output Files |
|------------|-------------|
| Local (development) | `<bundleName>.umd.min.js` only |
| Production | `<bundleName>.umd.min.js` + `sections.commonjs.js` |

```typescript
if (isLocalBuild) {
    return [mergedBaseConfig];
}
return [mergedBaseConfig, mergedSectionConfig];
```

---

## CSS Handling

### React Themes

CSS handling is delegated to the theme's own webpack config. The base config does not include CSS loaders -- the theme's `webpack.config.js` must provide them. The CLI uses `mini-css-extract-plugin` (available as a dependency) for extracting CSS into separate files.

CSS files are extracted to the build output directory alongside JS bundles, using the pattern `*.css`. The dev server serves these from `.fdk/distServed/`.

### Vue2 Themes

Vue CLI handles CSS processing automatically through its built-in webpack configuration. CSS is extracted in production builds and inlined in development builds.

---

## Dev vs Production Builds

| Aspect | Development | Production |
|--------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| Source maps | `source-map` (full) | `false` (none) |
| Minification | No | Yes (TerserPlugin) |
| Filename hashing | No (stable names) | Yes (`[contenthash]`) |
| HMR | Enabled (React only) | Disabled |
| CDN public path | `http://127.0.0.1:<port>/` | Dynamic CDN URL |
| Build mode | `webpack.watch()` or dev middleware | Single `webpack()` run |
| Socket.io injection | Yes | No |

---

## Environment Variables in Builds

| Variable | Passed To | Description |
|----------|-----------|-------------|
| `NODE_ENV` | webpack/Vue CLI | `development` or `production` |
| `IMAGE_CDN_URL` | Vue2 builds | Base URL for image assets |
| `ASSET_CDN_URL` | Vue2 builds | Base URL for all assets |
| `ASSET_HASH` | Vue2 builds | Hash for cache busting |
| `VUE_CLI_SERVICE_CONFIG_PATH` | Vue2 builds | Path to generated Vue config |
| `BUILD_TYPE` | Vue2 builds | `sync` (production) or `serve` (development) |
| `NODE_OPTIONS` | Vue2 on Node 18+ | `--openssl-legacy-provider` |
