import { exec } from 'child_process'
import { promisify } from 'util';
import path from 'path'
import rimraf from 'rimraf';
import Theme from '../lib/Theme';
import Spinner from './spinner';
import webpack from 'webpack';

const promisifiedWebpack = promisify(webpack);

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

export async function devReactBuild({ buildFolder, runOnLocal, assetBasePath, localThemePort, imageCdnUrl } : DevReactBuild) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
        // Clean the build directory
        rimraf.sync(buildPath);

        const webpackConfigFromTheme = await import(path.join(process.cwd(), Theme.REACT_CLI_CONFIG_PATH));
        const ctx = {
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && "production") || "development",
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
        }
        const config = webpackConfigFromTheme.default(ctx);
        
        await promisifiedWebpack(config);
    } catch (error) {
        console.log('Error while building : ', error)
    }
}

export async function devReactWatch({ buildFolder, runOnLocal, assetBasePath, localThemePort, imageCdnUrl } : DevReactBuild, callback: Function) {
    const buildPath = path.join(process.cwd(), buildFolder);
    try {
        const webpackConfigFromTheme = await import(path.join(process.cwd(), Theme.REACT_CLI_CONFIG_PATH));
        const ctx = {
            buildPath: buildPath,
            NODE_ENV: (!runOnLocal && "production") || "development",
            assetBasePath: assetBasePath,
            imageCdnUrl: imageCdnUrl,
            localThemePort: localThemePort,
        }
        const config = webpackConfigFromTheme.default(ctx);
        
        const compiler = webpack(config);
        compiler.watch(
            {
              aggregateTimeout: 1500,
              ignored: /node_modules/,
              poll: undefined,
            },
            (err, stats) => {
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
