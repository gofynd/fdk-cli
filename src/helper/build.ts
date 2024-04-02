import { exec } from 'child_process';
import path from 'path';
import Theme from '../lib/Theme';
import Spinner from './spinner';
import webpack from 'webpack';
import createBaseWebpackConfig from '../helper/theme.react.config';
import fs from 'fs';
import rimraf from 'rimraf';
import open from 'open';

export const THEME_ENTRY_FILE = path.join('theme', 'index.js');

export function build({
    buildFolder,
    imageCdnUrl,
    assetCdnUrl,
    assetHash = '',
}) {
    const VUE_CLI_PATH = path.join(
        '.',
        'node_modules',
        '@vue',
        'cli-service',
        'bin',
        'vue-cli-service.js',
    );
    const spinner = new Spinner('Building assets using vue-cli-service');
    return new Promise((resolve, reject) => {
        spinner.start();
        const isNodeVersionIsGreaterThan18 =
            +process.version.split('.')[0].slice(1) >= 18;
        let b = exec(
            `node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle --filename ${assetHash}_themeBundle ${THEME_ENTRY_FILE}`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    ASSET_CDN_URL: assetCdnUrl,
                    ASSET_HASH: assetHash,
                    NODE_ENV: 'production',
                    VUE_CLI_SERVICE_CONFIG_PATH: path.join(
                        process.cwd(),
                        Theme.VUE_CLI_CONFIG_PATH,
                    ),
                    BUILD_TYPE: 'sync',
                    ...(isNodeVersionIsGreaterThan18 && {
                        NODE_OPTIONS: '--openssl-legacy-provider',
                    }),
                },
            },
        );

        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);
        b.on('exit', function (code) {
            if (!code) {
                spinner.succeed();
                return resolve(true);
            }
            spinner.fail();
            reject({ message: 'Vue.js Build Failed' });
        });
    });
}
interface DevBuild {
    buildFolder: string;
    imageCdnUrl: string;
    isProd: boolean;
    browserLink?: string
}

interface DevReactBuild {
    buildFolder: string;
    runOnLocal?: boolean;
    assetBasePath?: string;
    imageCdnUrl?: string;
    localThemePort?: string;
    isHMREnabled: boolean;
}

export function devBuild({ buildFolder, imageCdnUrl, isProd, browserLink }: DevBuild) {
    const VUE_CLI_PATH = path.join(
        '.',
        'node_modules',
        '@vue',
        'cli-service',
        'bin',
        'vue-cli-service.js',
    );
    const isNodeVersionIsGreaterThan18 =
        +process.version.split('.')[0].slice(1) >= 18;

    return new Promise((resolve, reject) => {
        let b = exec(
            `node ${VUE_CLI_PATH} build --watch --target lib --dest ${buildFolder} --name themeBundle ${THEME_ENTRY_FILE}`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    NODE_ENV: (isProd && 'production') || 'development',
                    VUE_CLI_SERVICE_CONFIG_PATH: path.join(
                        process.cwd(),
                        Theme.VUE_CLI_CONFIG_PATH,
                    ),
                    BUILD_TYPE: 'serve',
                    ...(isNodeVersionIsGreaterThan18 && {
                        NODE_OPTIONS: '--openssl-legacy-provider',
                    }),
                },
            },
        );

        let isFirstBuild = true;
        const spinner = new Spinner('Building theme');

        // b.stdout.pipe(process.stdout);
        // b.stderr.pipe(process.stderr);
        b.stdout.on('data', async (data) => {
            if (!data.includes("Images and other types of assets omitted.")) { 
                spinner.start()
            }
            if (data.includes("Images and other types of assets omitted.")) {
                if (isFirstBuild) {
                    try {
                        await open(browserLink);
                    } catch (err) {
                        console.log(`Open in browser: ${browserLink}`);
                    }
                    isFirstBuild = false;
                }
                spinner.succeed()
            }
        })

        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}

export async function devReactBuild({
    buildFolder,
    runOnLocal,
    assetBasePath,
    localThemePort,
    imageCdnUrl,
    isHMREnabled,
}: DevReactBuild) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
        // Clean the build directory
        rimraf.sync(buildPath);
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
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && 'production') || 'development',
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
            context: process.cwd(),
            isHMREnabled,
        };
        const baseWebpackConfig = createBaseWebpackConfig(
            ctx,
            webpackConfigFromTheme,
        );
        return new Promise((resolve, reject) => {
            webpack(baseWebpackConfig, (err, stats) => {
                console.log(err);
                console.log(stats.toString());
                if (err || stats.hasErrors()) {
                    reject();
                }
                resolve(stats);
            });
        });
    } catch (error) {
        console.log('Error while building : ', error);
    }
}

export async function devReactWatch(
    {
        buildFolder,
        runOnLocal,
        assetBasePath,
        localThemePort,
        imageCdnUrl,
        isHMREnabled,
    }: DevReactBuild,
    callback: Function,
) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
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
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && 'production') || 'development',
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
            context: process.cwd(),
            isHMREnabled,
        };

        const baseWebpackConfig = createBaseWebpackConfig(
            ctx,
            webpackConfigFromTheme,
        );

        const compiler = webpack(baseWebpackConfig);
        compiler.watch(
            {
                aggregateTimeout: 1500,
                ignored: /node_modules/,
                poll: undefined,
            },
            (err, stats) => {
                console.log(err);
                if (err) {
                    throw err;
                }
                callback(stats);
            },
        );
    } catch (error) {
        console.log('Error while building : ', error);
    }
}
