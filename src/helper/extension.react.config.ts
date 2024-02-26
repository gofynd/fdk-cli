const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
import webpack, { Configuration } from 'webpack';

type ExtensionBuildContext = {
    isLocal: Boolean;
    sectionName: string;
}

export function extensionWebpackConfig(env: ExtensionBuildContext): Configuration[] {
    const isLocalBuild = env.isLocal;
    return [
        {
            mode: 'production',
            entry: path.resolve(process.cwd(), "src/index.jsx"),
            resolve: {
                extensions: ['', '.js', '.jsx'],
            },
            module: {
                rules: [
                    {
                        test: /\.(jsx|js)$/,
                        include: path.resolve(process.cwd(), "src"),
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
                                },
                            },
                        ],
                    },
                    {
                        test: /\.css$/i,
                        use: [MiniCssExtractPlugin.loader, {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    localIdentName: isLocalBuild ? "[path][name]__[local]--[hash:base64:5]" : "[hash:base64:5]"
                                },

                            }
                        }],
                    },
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
                filename: `${env.sectionName}.umd.min.js`,
                library: {
                    name: 'extension',
                    type: 'umd',
                    umdNamedDefine: true,
                },
                globalObject: 'typeof self !=="undefined" ? self : this',
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: `${env.sectionName}.css`,
                }),
                new webpack.ProvidePlugin({
                    // you must `npm install buffer` to use this.
                    Buffer: ['buffer', 'Buffer']
                })
            ]
        },
        {
            mode: 'production',
            target: 'node',
            entry: path.resolve(process.cwd(), "src/index.jsx"),
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
                react: 'fs',
                'fdk-core/components': 'fs',
                'react-router-dom': 'fs',
                'fdk-core/utils': 'fs',
                'react-helmet-async': 'fs',
                'styled-components': 'fs',
            },
            output: {
                filename: 'sections.commonjs.js',
                // path: path.resolve(process.cwd(), ""),
                library: {
                    name: 'sections',
                    type: 'commonjs',
                },
                globalObject: 'typeof self !== "undefined" ? self : this',
            },
            plugins: [],
        },
    ]
}
