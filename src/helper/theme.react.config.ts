import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from "terser-webpack-plugin";
import webpack, { Configuration } from 'webpack';
import fs from 'fs';
import { mergeWithRules, merge } from 'webpack-merge';
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const context = process.cwd();
// const themeConfigPath = path.join(context, 'webpack.config.js');
// const isWebpackExtendedInTheme = fs.existsSync(themeConfigPath);

// const extendedWebpackConfig = isWebpackExtendedInTheme ? require(themeConfigPath) : {};

// Return Array of Configurations

const baseConfig = (ctx) => {
	const { buildPath, NODE_ENV, assetBasePath = '', imageCdnUrl = '', context, localThemePort = 5500, isHMREnabled = true } = ctx;

	const assetNormalizedBasePath = assetBasePath[assetBasePath.length - 1] === '/' ? assetBasePath : assetBasePath + '/';
	const imageCDNNormalizedBasePath = imageCdnUrl[imageCdnUrl.length - 1] === '/' ? imageCdnUrl : imageCdnUrl + '/';
	const isLocal = NODE_ENV === 'development';
	const localBasePath = `https://localhost:${localThemePort}/`
	const localImageBasePath = `https://localhost:${localThemePort}/assets/images/`
	const localFontsBasePath = `https://localhost:${localThemePort}/assets/fonts/`
	return {
		mode: isLocal ? 'development' : 'production',
		entry: {
			themeBundle: (isLocal && isHMREnabled) ?
				[require.resolve('webpack-hot-middleware/client'), path.resolve(context, 'theme/index.jsx')] :
				[path.resolve(context, 'theme/index.jsx')]
		},
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
			splitChunks: {
				chunks() {
					return false;
				},
			},
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
								plugins: [
									...((isLocal && isHMREnabled) ? [require.resolve('react-refresh/babel')] : []),
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
								modules: false,
							},
						},
					],
					include: /\.global\.less$/,
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
					exclude: /\.global\.less$/,
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
				},
				{
					test: /\.(ttf|otf|woff|woff2)$/i,
					type: 'asset/resource',
					generator: {
						publicPath: isLocal ? localFontsBasePath : assetNormalizedBasePath,
						outputPath: 'assets/fonts/'
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
			filename: isLocal ? 'themeBundle.umd.js' : 'themeBundle.[contenthash].umd.js',
			publicPath: isLocal ? localBasePath : assetNormalizedBasePath,
			chunkFilename: isLocal ? '[name].themeBundle.umd.js' : '[name].themeBundle.[contenthash].umd.js',
			library: {
				name: 'themeBundle',
				type: 'umd',
				umdNamedDefine: true,
			},
			globalObject: 'typeof self !=="undefined" ? self : this',
			// [ext] has "." as prefix
			assetModuleFilename: '[contenthash][ext]'
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: isLocal ? '[name].css' : '[name].[contenthash].css',
			}),
			...((isLocal && isHMREnabled) ? [new webpack.HotModuleReplacementPlugin()] : []),
			...((isLocal && isHMREnabled) ? [new ReactRefreshWebpackPlugin({
				overlay: false,
			})] : []),
			new webpack.ProvidePlugin({
				// you must "npm install buffer" to use this.
				Buffer: ['buffer', 'Buffer'],
			}),
		],
	}
};

const baseSectionConfig = ({ buildPath, context }) => {
	return {
		mode: 'production',
		entry: path.resolve(context, 'theme/sections/index.js'),
		module: {
			rules: [
				{
					test: /\.(jsx|js)$/,
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
					use: ['css-loader'],
				},
				{
					test: /\.less$/i,
					use: ['css-loader'],
				},
			],
		},
		resolve: {
			extensions: ['', '.js', '.jsx'],
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
		plugins: [],
	}
}
const baseCustomTemplateConfig = ({ buildPath, context }) => {
	return {
		mode: 'production',
		entry: path.resolve(context, 'theme/custom-templates/index.jsx'),
		module: {
			rules: [
				{
					test: /\.(jsx|js)$/,
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
					use: ['css-loader'],
				},
				{
					test: /\.less$/i,
					use: ['css-loader'],
				},
			],
		},
		resolve: {
			extensions: ['', '.js', '.jsx'],
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
			filename: 'custom-templates.commonjs.js',
			path: path.resolve(buildPath, 'custom-templates'),
			library: {
				name: 'customTemplates',
				type: 'commonjs',
			},
			globalObject: 'typeof self !== "undefined" ? self : this',
		},
		plugins: [],
	}
}

export default (ctx, extendedWebpackConfig): Configuration[] => {
	const baseWebpackConfig = baseConfig(ctx);
	const sectionBaseConfig = baseSectionConfig(ctx);
	const customTemplateConfig = baseCustomTemplateConfig(ctx);

	const mergedSectionConfig = mergeWithRules({
		module: {
			rules: {
				test: "match",
				use: "append",
			},
		},
	})(sectionBaseConfig, extendedWebpackConfig);

	const mergedBaseConfig = mergeWithRules({
		module: {
			rules: {
				test: "match",
				use: "append",
			},
		},
	})(baseWebpackConfig, extendedWebpackConfig);

	const mergedCustomTemplateConfig = mergeWithRules({
		module: {
			rules: {
				test: "match",
				use: "append",
			},
		},
	})(customTemplateConfig, extendedWebpackConfig);

	return [
		mergedBaseConfig,
		mergedSectionConfig,
		mergedCustomTemplateConfig
	]
}