// Default webpack config shipped by fdk-cli for React themes.
//
// Why this file exists in the CLI: the CLI's built-in baseConfig
// (helper/theme.react.config.ts) only defines output/optimization/externals/plugins
// — it deliberately does NOT define `entry` or `module.rules`. Those have always
// been the theme's responsibility, sourced from a root-level `webpack.config.js`.
//
// Previously, if a theme archive on the platform was uploaded without one, `fdk
// theme sync` would crash on the first build attempt with
// `TypeError: extendedWebpackConfig is not a function`, because the missing
// config defaulted to `{}` which then got called as a function. By copying this
// file into the theme directory during `fdk theme init` (before the theme archive
// is extracted on top), themes always start with a known-good config. If the
// archive ships its own webpack.config.js / plugin.js / polyfill.js, extract-zip
// overwrites these defaults — so themes that customize webpack keep their config.
//
// Sibling files `plugin.js` and `polyfill.js` are referenced by relative require
// below and must ship together for the defaults to load.
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const NodeJSPolyfill = require("./plugin");
const { readFileSync } = require("node:fs");
const { Overlay } = require("react-hydration-overlay");

const polyfillCodePath = path.join(__dirname, "./polyfill.js");
const polyfillCode = readFileSync(polyfillCodePath, { encoding: "utf-8" });

module.exports = (configOptions) => {
  const {
    isLocal,
    isHMREnabled,
    context,
    assetNormalizedBasePath,
    localBasePath,
    imageCDNNormalizedBasePath,
    buildPath,
    localImageBasePath,
    localFontsBasePath,
  } = configOptions;
  return {
    entry: {
      themeBundle: [path.resolve(context, "theme/index.jsx")],
    },
    resolve: {
      extensions: ["", ".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: "defaults",
                    },
                  ],
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                  "@loadable/babel-plugin",
                ],
                plugins: [
                  ...(isLocal && isHMREnabled
                    ? [require.resolve("react-refresh/babel")]
                    : []),
                ],
              },
            },
          ],
        },
        {
          test: /\.(jsx|js)$/,
          include: path.resolve(context, "theme"),
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: "defaults",
                    },
                  ],
                  "@babel/preset-react",
                ],
                plugins: [
                  ...(isLocal && isHMREnabled
                    ? [require.resolve("react-refresh/babel")]
                    : []),
                ],
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: false,
              },
            },
          ],
          exclude: /\.global\.css$/,
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: false,
              },
            },
          ],
          include: /\.global\.css$/,
        },
        {
          test: /\.less$/i,
          use: [
            // compiles Less to CSS
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: false,
              },
            },
            "less-loader",
          ],
          include: /\.global\.less$/,
        },
        {
          test: /\.less$/i,
          use: [
            // compiles Less to CSS
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: isLocal
                    ? "[path][name]__[local]--[hash:base64:5]"
                    : "[hash:base64:5]",
                },
              },
            },
            "less-loader",
          ],
          exclude: /\.global\.less$/,
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: "asset/resource",
          generator: {
            publicPath: isLocal
              ? localImageBasePath
              : imageCDNNormalizedBasePath,
            outputPath: "assets/images/",
          },
        },
        {
          test: /\.(ttf|otf|woff|woff2)$/i,
          type: "asset/resource",
          generator: {
            publicPath: isLocal ? localFontsBasePath : assetNormalizedBasePath,
            outputPath: "assets/fonts/",
          },
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isLocal ? "[name].css" : "[name].[contenthash].css",
      }),
      new NodeJSPolyfill({
        snippet: polyfillCode,
      }),
      ...(isLocal
        ? [
            new Overlay({
              querySelector: "div#app",
            }),
          ]
        : []),
    ],
    optimization: {
      minimizer: [`...`, new CssMinimizerPlugin()],
    },
    externals: {
      "react-i18next": "i18nReact",
      i18next: "i18next",
    },
  };
};
