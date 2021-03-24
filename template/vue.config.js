const path = require('path');
const urlJoin = require('url-join');

function addStyleResource(rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './theme/global/variables.less')
      ],
      injector: 'prepend'
    })
}

module.exports = {
  chainWebpack: config => {
    config.mode(process.env.NODE_ENV)
    if (!process.env.NODE_ENV === 'production') {
      config.plugins.delete("uglify")
      config.optimization.minimize(false)
      config.optimization.minimizer([
        new TerserPlugin({
          parallel: true,
          sourceMap: false, // Must be set to true if using source-maps in production
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          },
        }),
      ])
    }
    // disable eslint
    config.module.rules.delete('eslint');
    config.module.rules.delete('svg');

    const imagesRule = config.module.rule('images');
    imagesRule.uses.clear();
    imagesRule
      .test(/\.(jpe?g|png|gif|svg|webp)$/)
      .use('file-loader')
      .loader('file-loader')
      .tap(options => {
        return {
          name: '[name].[contenthash].[ext]',
          publicPath: process.env.IMAGE_CDN_URL,
          outputPath: 'assets/images'
        };
      });

    // append variables.less before every style
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))
  }
}