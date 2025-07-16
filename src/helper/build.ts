import { exec } from 'child_process';
import path from 'path';
import webpack, { MultiStats } from 'webpack';
import fs from 'fs';
import rimraf from 'rimraf';
import Theme from '../lib/Theme';
import Spinner from './spinner';
import createBaseWebpackConfig from './theme.react.config';
import Logger from '../lib/Logger';

export const THEME_ENTRY_FILE = path.join('theme', 'index.js');
export const VUE_THEME_ENTRY_FILE = path.join('..', 'theme', 'index.js');
export const DEV_VUE_THEME_ENTRY_FILE = path.join('theme', 'index.js');

export const CDN_ENTRY_FILE = path.join('.fdk', 'cdn_index.js');

export const dynamicCDNScript = ({ assetNormalizedBasePath, vueJs }) => {
  const cdnBasePath = vueJs ? `${assetNormalizedBasePath}/` : assetNormalizedBasePath;
  const functionSnippet = `
        function getCDNurl() {
            let cdnUrl = '${cdnBasePath}';
            try {
                if (fynd_platform_cdn) {
                    cdnUrl = fynd_platform_cdn
                } else {
                 console.warn('Dynamic CDN path not found!');
                }
            } catch (error) {
                console.warn('Could not set dynamic CDN path');
            }

            return cdnUrl;
        }

        __webpack_public_path__ =  getCDNurl();
    `;

  const vueSpecificBundleImport = vueJs ? `
    import bundle from "../theme/index.js";
    export default bundle;
    ` : '';

  return `
    ${functionSnippet}

    ${vueSpecificBundleImport}`;
};
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
  fs.stat(CDN_ENTRY_FILE, (err, stat) => {
    if (err == null) {
      // deleting file if exist
      fs.unlink(CDN_ENTRY_FILE, (err) => {
        if (err) return console.log(err);
        Logger.debug(' \n Existing file deleted successfully');
      });
    }
    fs.appendFileSync(CDN_ENTRY_FILE, dynamicCDNScript({ assetNormalizedBasePath: (imageCdnUrl || assetCdnUrl), vueJs: true }));
  });
  const spinner = new Spinner('Building assets using vue-cli-service');
  return new Promise((resolve, reject) => {
    spinner.start();
    const isNodeVersionIsGreaterThan18 = +process.version.split('.')[0].slice(1) >= 18;
    const b = exec(
      `node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle --filename ${assetHash}_themeBundle ${CDN_ENTRY_FILE}`,
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
    b.on('exit', (code) => {
      fs.unlink(CDN_ENTRY_FILE, (err) => {
        if (err) return console.log(err);
        Logger.debug(' \n Existing file deleted successfully');
      });
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
}

interface DevReactBuild {
    buildFolder: string;
    runOnLocal?: boolean;
    assetBasePath?: string;
    imageCdnUrl?: string;
    localThemePort?: string;
    isHMREnabled: boolean;
    targetDirectory?:string
}

export function devBuild({ buildFolder, imageCdnUrl, isProd }: DevBuild) {
  const VUE_CLI_PATH = path.join(
    '.',
    'node_modules',
    '@vue',
    'cli-service',
    'bin',
    'vue-cli-service.js',
  );
  const isNodeVersionIsGreaterThan18 = +process.version.split('.')[0].slice(1) >= 18;

  return new Promise((resolve, reject) => {
    const b = exec(
      `node ${VUE_CLI_PATH} build --target lib --dest ${buildFolder} --name themeBundle ${DEV_VUE_THEME_ENTRY_FILE}`,
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

    b.stdout.pipe(process.stdout);
    b.stderr.pipe(process.stderr);

    b.on('exit', (code) => {
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
  assetBasePath = '',
  localThemePort,
  imageCdnUrl,
  isHMREnabled,
  targetDirectory,
}: DevReactBuild): Promise<MultiStats> {
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
      buildPath,
      NODE_ENV: (!runOnLocal && 'production') || 'development',
      assetBasePath,
      imageCdnUrl,
      localThemePort,
      context: process.cwd(),
      isHMREnabled,
      targetDirectory,
    };
    const baseWebpackConfig = createBaseWebpackConfig(
      ctx,
      webpackConfigFromTheme,
    );
    const assetNormalizedBasePath = assetBasePath[assetBasePath.length - 1] === '/'
      ? assetBasePath
      : `${assetBasePath}/`;
    return new Promise((resolve, reject) => {
      if (!runOnLocal) {
        fs.stat(path.resolve((targetDirectory || process.cwd()), CDN_ENTRY_FILE), (err, stat) => {
          if (err == null) {
            // deleting file if exist
            fs.unlink(path.resolve((targetDirectory || process.cwd()), CDN_ENTRY_FILE), (err) => {
              if (err) return console.log(err);
              Logger.debug(' \n Existing file deleted successfully');
            });
          }
          fs.appendFileSync(path.resolve((targetDirectory || process.cwd()), CDN_ENTRY_FILE), dynamicCDNScript({ assetNormalizedBasePath, vueJs: false }));
        });
      }
      webpack(baseWebpackConfig, (err, stats) => {
        console.log(stats.toString());
        if (!runOnLocal) {
          fs.unlink(path.resolve((targetDirectory || process.cwd()), CDN_ENTRY_FILE), (err) => {
            if (err) return console.log(err);
            Logger.debug(' \n file deleted successfully');
          });
        }
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
      buildPath,
      NODE_ENV: (!runOnLocal && 'production') || 'development',
      assetBasePath,
      imageCdnUrl,
      localThemePort,
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
