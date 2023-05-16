
export const themeReactWebpackTemplate = 
`const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');
const fs = require('fs');
const { mergeWithRules, merge } = require('webpack-merge');

const context = process.cwd();
const themeConfigPath = path.join(context, 'webpack.config.js');
const isWebpackExtendedInTheme = fs.existsSync(themeConfigPath);

const extendedWebpackConfig = isWebpackExtendedInTheme ? require(themeConfigPath) : {};

// Return Array of Configurations

const baseConfig = (ctx) => {
	const { buildPath, NODE_ENV, assetBasePath = '', imageCdnUrl = '', localThemePort = 5500 } = ctx;
	const assetNormalizedBasePath = assetBasePath[assetBasePath.length - 1] === '/' ? assetBasePath : assetBasePath + '/';
	const imageCDNNormalizedBasePath = imageCdnUrl[imageCdnUrl.length - 1] === '/' ? imageCdnUrl : imageCdnUrl + '/';
	const isLocal = NODE_ENV === 'development';
    const localBasePath = \`https://127.0.0.1:\${localThemePort}/\`
    const localImageBasePath = \`https://127.0.0.1:\${localThemePort}/assets/images/\`
	return {
			mode: isLocal ? 'development' : 'production',
			entry: { themeBundle: path.resolve(context, 'theme/index.jsx') },
			devtool: isLocal ? 'source-map' : false,
			optimization: {
				minimizer: [
				  new TerserPlugin({
					terserOptions: {
					  keep_fnames: true,
					  keep_classnames: true,
					},
				  }),
				],
			  },
			resolve: {
				extensions: ['', '.js', '.jsx'],
			},
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
						  // compiles scss to CSS
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
				'styled-components': 'styledComponents',
			},
			output: {
				path: buildPath,
				filename: 'themeBundle.[contenthash].umd.js',
				publicPath: isLocal ? localBasePath : assetNormalizedBasePath,
				chunkFilename: '[name].themeBundle.[contenthash].umd.js',
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
					filename: '[name].[contenthash].css',
				}),
				new webpack.ProvidePlugin({
					// you must "npm install buffer" to use this.
					Buffer: ['buffer', 'Buffer'],
				}),
			],
		}
};

const baseSectionConfig = () => {
	return {
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
				{
					test: /\.css$/i,
					use: [MiniCssExtractPlugin.loader, {
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[hash:base64:5]',
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
								localIdentName: '[hash:base64:5]',
								},
							},
						},
					],
				  },
			],
		},
		externals: {
			react: 'React',
			'react-router-dom': 'globalThis',
			'fdk-core/components': 'globalThis',
			'fdk-core/utils': 'globalThis',
			'react-helmet-async': 'globalThis',
			'styled-components': 'globalThis',
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
}

module.exports = (ctx) => {
	const { buildPath } = ctx;
	const baseWebpackConfig = baseConfig(ctx);
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

	const mergedBaseConfig = merge(baseWebpackConfig, extendedWebpackConfig);
	const mergedSectionConfig = merge(baseSectionConfig, extendedWebpackConfig);

	return [
		mergedBaseConfig,
		mergedSectionConfig,
	]
}
`;