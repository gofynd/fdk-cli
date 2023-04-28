
export const themeReactWebpackTemplate = 
`const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const fs = require('fs');
const { mergeWithRules, merge } = require('webpack-merge');

const context = process.cwd();
const themeConfigPath = path.join(context, 'webpack.config.js');
const isWebpackExtendedInTheme = fs.existsSync(themeConfigPath);

const extendedWebpackConfig = isWebpackExtendedInTheme ? require(themeConfigPath) : {};

// Return Array of Configurations
const { buildPath, NODE_ENV, assetBasePath = '', imageCdnUrl = '', localThemePort = 5500 } = process.env;
const baseConfig = () => {
	const assetNormalizedBasePath = assetBasePath[assetBasePath.length - 1] === '/' ? assetBasePath : assetBasePath + '/';
	const imageCDNNormalizedBasePath = imageCdnUrl[imageCdnUrl.length - 1] === '/' ? imageCdnUrl : imageCdnUrl + '/';
	const isLocal = NODE_ENV === 'development';
    const localBasePath = \`https://127.0.0.1:\${localThemePort}/\`
    const localImageBasePath = \`https://127.0.0.1:\${localThemePort}/assets/images/\`
	return {
			mode: 'production',
			entry: { themeBundle: path.resolve(context, 'theme/index.js') },
			module: {
				rules: [
					{
						test: /\.(jsx|js)$/,
						include: path.resolve(context, 'theme'),
						exclude: /node_modules/,
						use: [
							{
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												targets: 'defaults',
											},
										],
										'@babel/preset-react',
									],
								},
							},
						],
					},
					{
						test: /\.css$/i,
						use: [MiniCssExtractPlugin.loader, {
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: isLocal ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:5]',
								},

							},
						}],
					},
					{
						test: /\.less$/i,
						use: [
						  // compiles Less to CSS
						  MiniCssExtractPlugin.loader,
						  {
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: isLocal ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:5]',
									},
								},
							},
						],
					  },
					  {
						test: /\.scss$/i,
						use: [
						  // compiles Less to CSS
						  MiniCssExtractPlugin.loader,
						  {
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: isLocal ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:5]',
									},
								},
							},
						],
					  },
					{
						test: /\.(png|jpg|jpeg)$/i,
						type: 'asset/resource',
						generator: {
							publicPath: isLocal ? localImageBasePath : imageCDNNormalizedBasePath,
							outputPath: 'assets/images/'
						  }
					}
				],
			},
			externals: {
				react: 'React',
				'react-router-dom': 'ReactRouterDOM',
				'fdk-core/components': 'sharedComponentLibrary',
				'fdk-core/utils': 'sharedUtilsLibrary',
				'react-helmet-async': 'helmetModule',
			},
			output: {
				path: buildPath,
				filename: isLocal ? 'themeBundle.[contenthash].umd.js' : 'themeBundle.[contenthash].umd.js',
				publicPath: isLocal ? localBasePath : assetNormalizedBasePath,
				chunkFilename: isLocal ? '[name].themeBundle.[contenthash].umd.js' : '[name].themeBundle.[contenthash].umd.js',
				library: {
					name: 'themeBundle',
					type: 'umd',
					umdNamedDefine: true,
				},
				globalObject: 'typeof self !=="undefined" ? self : this',
				// [ext] has "." as prefix
				assetModuleFilename: 'images.[contenthash][ext]'
			},
			plugins: [
				new MiniCssExtractPlugin({
					filename: isLocal ? '[name].css' : '[name].[contenthash].css',
				}),
				new webpack.ProvidePlugin({
					// you must "npm install buffer" to use this.
					Buffer: ['buffer', 'Buffer'],
				}),
			],
		}
};

module.exports = () => {
	const baseWebpackConfig = baseConfig();
	// const mergedConfig = mergeWithRules({
	// 	module: {
	// 	  rules: {
	// 		test: "match",
	// 		use: {
	// 		  loader: "match",
	// 		  options: "append",
	// 		},
	// 	  },
	// 	},
	//   })(baseWebpackConfig, extendedWebpackConfig);
	const mergedConfig = merge(baseWebpackConfig, extendedWebpackConfig);

	return [
		mergedConfig,
	  {
		mode: 'production',
		entry: path.resolve(context, 'theme/sections/index.js'),
		module: {
			rules: [
				{
					test: /\.section.(jsx|js)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									[
										'@babel/preset-env',
										{
											targets: 'defaults',
										},
									],
									'@babel/preset-react',
								],
							},
						},
					],
				},
			],
		},
		externals: {
			react: 'React',
			'react-router-dom': 'globalThis',
		},
		output: {
			filename: 'sections.commonjs.js',
			path: path.resolve(buildPath, 'sections'),
			library: {
				name: 'sections',
				type: 'commonjs',
			},
			globalObject: 'typeof self !== "undefined" ? self : this',
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
		],
	}
	]
}
`;