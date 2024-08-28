const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
    const isLocalBuild = env.isLocal;
    const context = env.context;

    const baseConfig = {
        mode: isLocalBuild ? 'development' : 'production',
        entry: path.resolve(context, "src/index.jsx"),
        resolve: {
            extensions: ['', '.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.(jsx|js)$/,
                    include: path.resolve(context, "src"),
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
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    localIdentName: isLocalBuild
                                        ? "[path][name]__[local]--[hash:base64:5]"
                                        : "[hash:base64:5]",
                                },
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
                            localIdentName: isLocalBuild
                              ? "[path][name]__[local]--[hash:base64:5]"
                              : "[hash:base64:5]",
                          },
                        },
                      },
                      "less-loader",
                    ],
                    exclude: /\.global\.less$/,
                  },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `${env.bundleName}.umd.min.css`,
            }),
        ]
    };
    return  baseConfig;
}