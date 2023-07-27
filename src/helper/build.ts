import { exec } from 'child_process'
import path from 'path'
import Theme from '../lib/Theme';
import Spinner from './spinner';
import webpack from 'webpack';
import createBaseWebpackConfig from '../helper/theme.react.config';
import fs from 'fs';
import rimraf from 'rimraf';

export function build({ buildFolder, imageCdnUrl, assetCdnUrl, assetHash = '' }) {
    const VUE_CLI_PATH = path.join('.', 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');
    const THEME_ENTRY_FILE = path.join('theme', 'index.js');
    const spinner = new Spinner('Building assets using vue-cli-service');
    return new Promise((resolve, reject) => {
        spinner.start();
        let b = exec(`node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle --filename ${assetHash}_themeBundle ${THEME_ENTRY_FILE}`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    ASSET_CDN_URL: assetCdnUrl,
                    ASSET_HASH: assetHash,
                    NODE_ENV: "production",
                    VUE_CLI_SERVICE_CONFIG_PATH: path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH)
                }
            });

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
    buildFolder: string,
    imageCdnUrl: string,
    isProd: boolean
}

interface DevReactBuild {
    buildFolder: string,
    runOnLocal?: boolean,
    assetBasePath?: string,
    imageCdnUrl?: string,
    localThemePort?: string,
    isHMREnabled: boolean,
}

export function devBuild({ buildFolder, imageCdnUrl, isProd } : DevBuild) {
    const VUE_CLI_PATH = path.join('.', 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');
    const THEME_ENTRY_FILE = path.join('theme', 'index.js');

    return new Promise((resolve, reject) => {
        let b = exec(`node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle ${THEME_ENTRY_FILE}`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    NODE_ENV: (isProd && "production") || "development",
                    VUE_CLI_SERVICE_CONFIG_PATH: path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH)
                }
            });

        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);

        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}

export async function devReactBuild({ buildFolder, runOnLocal, assetBasePath, localThemePort, imageCdnUrl, isHMREnabled } : DevReactBuild) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
        // Clean the build directory
        rimraf.sync(buildPath);
        let webpackConfigFromTheme = {};
        const themeWebpackConfigPath = path.join(process.cwd(), Theme.REACT_CLI_CONFIG_PATH);

        if (fs.existsSync(themeWebpackConfigPath)) {
             ({ default: webpackConfigFromTheme }  = await import(themeWebpackConfigPath));
        }

        const ctx = {
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && "production") || "development",
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
            context: process.cwd(),
            isHMREnabled,
        }
        const baseWebpackConfig = createBaseWebpackConfig(ctx, webpackConfigFromTheme);
        return new Promise((resolve, reject) => {
            webpack(baseWebpackConfig, (err, stats) => {
                console.log(err)
                console.log(stats.toString());
                if (err || stats.hasErrors()) {
                    reject();
                }
                resolve(stats);
            })
        });
    } catch (error) {
        console.log('Error while building : ', error)
    }
}

export async function devReactWatch({ buildFolder, runOnLocal, assetBasePath, localThemePort, imageCdnUrl, isHMREnabled } : DevReactBuild, callback: Function) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
        let webpackConfigFromTheme = {};
        const themeWebpackConfigPath = path.join(process.cwd(), Theme.REACT_CLI_CONFIG_PATH);

        if (fs.existsSync(themeWebpackConfigPath)) {
             ({ default: webpackConfigFromTheme }  = await import(themeWebpackConfigPath));
        }
        const ctx = {
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && "production") || "development",
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
            context: process.cwd(),
            isHMREnabled
        }

        const baseWebpackConfig = createBaseWebpackConfig(ctx, webpackConfigFromTheme);

        const compiler = webpack(baseWebpackConfig);
        compiler.watch(
            {
              aggregateTimeout: 1500,
              ignored: /node_modules/,
              poll: undefined,
            },
            (err, stats) => {
                console.log(err)
              if(err) {
                throw err;
              }
              callback(stats);
            }
          );
    } catch (error) {
        console.log('Error while building : ', error)
    }
}
