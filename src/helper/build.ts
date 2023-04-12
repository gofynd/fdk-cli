import { exec } from 'child_process'
import path from 'path'
import rimraf from 'rimraf';
import Theme from '../lib/Theme';
import Spinner from './spinner';

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

export function devReactBuild({ buildFolder, runOnLocal, assetBasePath, localThemePort } : DevReactBuild) {
    const WEBPACK_CLI_PATH = path.join('.', 'node_modules', '.bin', 'webpack');
    const buildPath = path.join(process.cwd(), buildFolder);

    // Clean the build directory
    rimraf.sync(buildPath);

    return new Promise((resolve, reject) => {
        let b = exec(`node ${WEBPACK_CLI_PATH} --config ${Theme.REACT_CLI_CONFIG_PATH}`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    buildPath,
                    NODE_ENV: (!runOnLocal && "production") || "development",
                    assetBasePath,
                    localThemePort
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
