const path = require('path');

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
    //vue-svg-loader
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    // disable eslint
    config.module.rules.delete('eslint');

    const imagesRule = config.module.rule('images');
    imagesRule.uses.clear();
    imagesRule
      .test(/\.(jpe?g|png|gif|webp)$/)
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