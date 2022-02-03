export const themeVueConfigTemplate = 
`const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const { chalk, error, loadModule } = require('@vue/cli-shared-utils')

const FDK_CONFIG_PATH = "./fdk.config.js";
let fdkConfig = {};
let fileConfigPath = null;
const context = process.cwd();

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

try {
  fileConfigPath = path.resolve(context, FDK_CONFIG_PATH);
  if (fileConfigPath && fs.existsSync(fileConfigPath)) {
    fdkConfig = loadModule(fileConfigPath, context);
    if (typeof fdkConfig === 'function') {
      fdkConfig = fdkConfig()
    }
  }
} catch (err) {
  console.error(err)
  error(\`Error loading \${chalk.bold(fileConfigPath)}:\`)
  throw err;
}

fdkConfig = mergeDeep(fdkConfig, {
  publicPath: process.env.ASSET_CDN_URL,
  css: {
    extract: {
      chunkFilename: process.env.ASSET_HASH && \`\${process.env.ASSET_HASH}_[name].[contenthash].css\` ||
        \`[name].[contenthash].css\`,
    },
  }
});
const fdkChainWebpack = fdkConfig.chainWebpack;
const fdkConfigureWebpack = fdkConfig.configureWebpack;

const configureWebpack = (config) => {
  const isCommonJs = config.output.libraryTarget === "commonjs2";
  let customConfig = {
    plugins: isCommonJs
      ? [
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        })
      ]
      : [],
  };
  if (typeof fdkConfigureWebpack == "function") {
    customConfig = mergeDeep(fdkConfigureWebpack(config), customConfig);
  }
  if (typeof fdkConfigureWebpack == "object") {
    customConfig = mergeDeep(fdkConfigureWebpack, customConfig);
  }
  return customConfig
}

const chainWebpack = (config) => {
  if (typeof fdkChainWebpack == "function") {
    fdkChainWebpack(config)
  }
  config
    .optimization.splitChunks({
      cacheGroups: {
        vendors: {
          test: /[\/]node_modules[\/]/,
          name(module, chunks, cacheGroupKey) {
            const allChunksNames = chunks.map((item) => item.name).join('_');
            return \`\${cacheGroupKey}-\${allChunksNames}\`;
          },
          chunks: 'all'
        }
      }
    })
}

fdkConfig.chainWebpack = chainWebpack;
fdkConfig.configureWebpack = configureWebpack;

module.exports = fdkConfig;`