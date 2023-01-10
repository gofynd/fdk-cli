export const themeVueConfigTemplate = 
`const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const { chalk, error, loadModule } = require('@vue/cli-shared-utils')
const set = require.resolve("./setting-loader.js");
const FDK_CONFIG_PATH = "./fdk.config.js";

let vueConfig = {};
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
    vueConfig = loadModule(fileConfigPath, context);
    if (typeof vueConfig === 'function') {
      vueConfig = vueConfig()
    }
  }
} catch (err) {
  console.error(err)
  error(\`Error loading \${chalk.bold(fileConfigPath)}:\`)
  throw err;
}

vueConfig = mergeDeep(vueConfig, {
  publicPath: process.env.ASSET_CDN_URL,
  css: {
    extract: {
      chunkFilename: process.env.ASSET_HASH && \`\${process.env.ASSET_HASH}_[name].[contenthash].css\` ||
        \`[name].[contenthash].css\`,
    },
  }
});
const vueChainWebpack = vueConfig.chainWebpack;
const vueConfigureWebpack = vueConfig.configureWebpack;
const configureWebpack = (config) => {
  config.module.rules.push({
    resourceQuery: /blockType=settings/,
    loader:set
  }) 
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
  if (typeof vueConfigureWebpack == "function") {
    customConfig = mergeDeep(vueConfigureWebpack(config), customConfig);
  }
  if (typeof vueConfigureWebpack == "object") {
    customConfig = mergeDeep(vueConfigureWebpack, customConfig);
  }
  return customConfig
}

const chainWebpack = (config) => {
  config.module.rule('vue').uses.delete('cache-loader');

  if (typeof vueChainWebpack == "function") {
    vueChainWebpack(config)
  } 
  config
    .optimization.splitChunks({
      automaticNameDelimiter: "_"
    })
}

vueConfig.chainWebpack = chainWebpack;
vueConfig.configureWebpack = configureWebpack;

module.exports = vueConfig;`

export const settingLoader=`
module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.__settings = ' +
  JSON.parse(JSON.stringify(source))  +
    '}', map)
}
`