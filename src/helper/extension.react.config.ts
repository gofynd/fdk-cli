const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
import webpack, { Configuration } from 'webpack';

class CustomSnippetPlugin {
    constructor(private options) { }
  
    apply(compiler) {
      compiler.hooks.emit.tapAsync('CustomSnippetPlugin', (compilation, callback) => {
        // Get the snippet code from options or use a default one
        const snippetCode = this.options.snippetCode;
  
        // Iterate through each asset in the compilation
        for (const filename in compilation.assets) {
          if (filename.endsWith('.js')) { // Only apply to JavaScript files
            // Get the asset source
            let source = compilation.assets[filename].source();
  
            // Append the custom snippet code
            source += `\n\n// Custom Snippet Start\n${snippetCode}\n// Custom Snippet End\n`;
  
            // Update the asset with the modified source
            compilation.assets[filename] = {
              source: () => source,
              size: () => source.length
            };
          }
        }
  
        callback();
      });
    }
  }
  
type ExtensionBuildContext = {
    isLocal: Boolean;
    bundleName: string;
    port: number
    context: string;
}

const snippet = (port) => `
function isRunningOnClient() {
	if (typeof window !== 'undefined') {
		return globalThis === window;
	}

	return false;
}

if (isRunningOnClient()) {
    const _script = document.createElement('script');
_script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
_script.onload = function () {
    var socket = io('http://127.0.0.1:${port}');
    socket.on('reload', function(){
        window.location.reload();
    });
};
document.head.appendChild(_script);
}
`;

export function extensionWebpackConfig(env: ExtensionBuildContext): Configuration[] {
    const isLocalBuild = env.isLocal;
    const context = env.context;

    const baseConfig: Configuration = {
        mode: 'production',
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
        },
        output: {
            filename: `${env.bundleName}.umd.min.js`,
            library: {
                name: 'extension',
                type: 'umd',
                umdNamedDefine: true,
            },
            globalObject: 'typeof self !=="undefined" ? self : this',
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `${env.bundleName}.umd.min.css`,
            }),
            new webpack.ProvidePlugin({
                // you must `npm install buffer` to use this.
                Buffer: ['buffer', 'Buffer']
            }),
           ...(isLocalBuild ? [
            new CustomSnippetPlugin({
                snippetCode: snippet(env.port)
            }),
           ] : []),
        ]
    };

    const sectionConfig: Configuration = {
        mode: 'production',
        target: 'node',
        entry: path.resolve(context, "src/index.jsx"),
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
        },
        output: {
            filename: 'sections.commonjs.js',
            // path: path.resolve(context, ""),
            library: {
                name: 'sections',
                type: 'commonjs',
            },
            globalObject: 'typeof self !== "undefined" ? self : this',
        },
        plugins: [],
    };

    if (isLocalBuild) {
        return [baseConfig];
    }

    return [
        baseConfig,
        sectionConfig,
    ]
}
