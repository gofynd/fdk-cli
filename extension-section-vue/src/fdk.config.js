const path = require('path');

module.exports = {
  chainWebpack: config => {
    //vue-svg-loader
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

      // Remove default images and fonts rules
    config.module.rules.delete('images');
    config.module.rules.delete('fonts');

    // Define a custom rule for images and fonts
    config.module
      .rule('assets')
      .test(/\.(png|jpe?g|gif|webp|woff2?|ttf|eot|otf)$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[contenthash].[ext]',
        esModule: false,
        publicPath: process.env.ASSET_CDN_URL,
        outputPath: 'assets/',
      });
  }
}