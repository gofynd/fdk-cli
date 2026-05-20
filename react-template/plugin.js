// Shipped by fdk-cli alongside the default webpack.config.js (see header there).
// Webpack plugin that prepends a snippet (typically polyfill.js content) to every
// emitted .js asset, so the runtime polyfills are guaranteed to evaluate before
// any chunk's first line. Required by the default webpack.config.js's `new
// NodeJSPolyfill({ snippet: <polyfill.js contents> })`. Overwritten if the theme
// archive ships its own version.
const { sources } = require("webpack");

class NodeJSPolyfill {
  // Constructor accepts options, where snippet is optional
  constructor(options) {
    this.snippet = options.snippet || ""; // Store the snippet to be prepended to each JavaScript file
  }

  // Apply method to register the plugin with the webpack compiler
  apply(compiler) {
    // Hook into the webpack compilation process
    compiler.hooks.compilation.tap("NodeJSPolyfill", (compilation) => {
      // Register a hook for processing assets after they've been added to the compilation
      compilation.hooks.processAssets.tap(
        {
          name: "NodeJSPolyfill", // Name of the plugin for identification
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS, // Stage to process assets when they've been added
        },
        (assets) => {
          // Iterate over each asset in the compilation
          for (const assetName in assets) {
            // Check if the asset is a JavaScript file
            if (assetName.endsWith(".js")) {
              // Get the original source of the asset
              const originalSource = assets[assetName].source();

              // Prepend the snippet to the original source
              const modifiedSource = `${this.snippet}\n${originalSource}`;

              // Replace the asset's source with the modified source
              assets[assetName] = new sources.RawSource(modifiedSource);
            }
          }
        }
      );
    });
  }
}

// Export the plugin class
module.exports = NodeJSPolyfill;
