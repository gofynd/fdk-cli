import path from "path"
import TerserPlugin from 'terser-webpack-plugin';
import webpack, { Configuration } from 'webpack';
import { mergeWithRules, merge } from 'webpack-merge';
import { getLocalBaseUrl } from './serve.utils';
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
import { CDN_ENTRY_FILE } from './build';
const context = process.cwd();

const baseConfig = (configOptions) => {
    const {
        isLocal,
        isHMREnabled,
        assetNormalizedBasePath,
        localBasePath,
        buildPath,
    } = configOptions;

    return {
        mode: isLocal ? 'development' : 'production',
        devtool: isLocal ? 'source-map' : false,
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_fnames: true,
                        keep_classnames: true,
                    },
                }),
            ],
            splitChunks: {
                chunks() {
                    return false;
                },
            },
        },
        externals: {
            react: 'React',
            'react-router-dom': 'ReactRouterDOM',
            'fdk-core/components': 'sharedComponentLibrary',
            'fdk-core/utils': 'sharedUtilsLibrary',
            'react-helmet-async': 'helmetModule',
            'styled-components': 'styledComponents',
        },
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
            // [ext] has "." as prefix
            assetModuleFilename: '[contenthash][ext]',
        },
        plugins: [
            ...(isLocal && isHMREnabled
                ? [new webpack.HotModuleReplacementPlugin()]
                : []),
            ...(isLocal && isHMREnabled
                ? [
                      new ReactRefreshWebpackPlugin({
                          overlay: false,
                      }),
                  ]
                : []),
            new webpack.ProvidePlugin({
                // you must "npm install buffer" to use this.
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    };
};
export default (ctx, extendedWebpackConfig): Configuration[] => {
    const {
        NODE_ENV,
        assetBasePath = '',
        imageCdnUrl = '',
        localThemePort = 5500,
        isHMREnabled = true,
        targetDirectory
    } = ctx;

    const assetNormalizedBasePath =
        assetBasePath[assetBasePath.length - 1] === '/'
            ? assetBasePath
            : assetBasePath + '/';
    const imageCDNNormalizedBasePath =
        imageCdnUrl[imageCdnUrl.length - 1] === '/'
            ? imageCdnUrl
            : imageCdnUrl + '/';
    const isLocal = NODE_ENV === 'development';
    const localBasePath = `${getLocalBaseUrl()}:${localThemePort}/`;
    const localAssetsPath = `${getLocalBaseUrl()}:${localThemePort}/assets/`;


    const configOptions = {
        ...ctx,
        isLocal,
        localBasePath,
        localAssetsPath,
        imageCDNNormalizedBasePath,
        assetNormalizedBasePath,
    };
    const baseWebpackConfig = baseConfig(configOptions);
    const extendedWebpackResolved = extendedWebpackConfig(configOptions);
    const mergedBaseConfig: Configuration = mergeWithRules({
        module: {
            rules: {
                test: 'match',
                use: 'append',
            },
        },
    })(extendedWebpackResolved, baseWebpackConfig);

    if (mergedBaseConfig.entry.hasOwnProperty('themeBundle')) {
        let entryPoints = [...mergedBaseConfig.entry['themeBundle']];
        if (isLocal && isHMREnabled) {
            entryPoints.unshift(require.resolve('webpack-hot-middleware/client'));
        } else if (!isLocal) {
            entryPoints.unshift(path.resolve(targetDirectory || context, CDN_ENTRY_FILE));
        }
        mergedBaseConfig.entry['themeBundle'] = entryPoints;
    }

    return [mergedBaseConfig];
};
