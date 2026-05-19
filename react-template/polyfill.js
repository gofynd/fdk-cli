// Shipped by fdk-cli alongside the default webpack.config.js (see header there).
// Read at build time and inlined into every emitted .js chunk by the NodeJSPolyfill
// plugin (./plugin.js). Provides Node-compatible globals (queueMicrotask, Response)
// for SSR contexts where the theme bundle may evaluate before Node's own globals
// are present. Overwritten if the theme archive ships its own version.

// Function to check if the code is running in a browser environment
function isRunningOnClient() {
  // Checks if 'window' is defined, which indicates a browser environment
  if (typeof window !== "undefined") {
    return globalThis === window; // Validates that the global object is 'window'
  }

  return false; // Returns false if not running in a browser
}

// Only apply polyfills if running in a server environment
if (!isRunningOnClient()) {
  // Polyfill for queueMicrotask if it doesn't exist
  if (!globalThis.queueMicrotask) {
    globalThis.queueMicrotask = function queueMicrotaskPolyfil(callback) {
      // Uses Promise.resolve().then() to simulate queueMicrotask behavior
      Promise.resolve().then(callback);
    };
  }

  // Polyfill for Response object if it doesn't exist
  if (!globalThis.Response) {
    globalThis.Response = class Response {
      constructor() {}

      // Static method to simulate Response.error()
      static error() {
        return {};
      }

      // Static method to simulate Response.json()
      static json() {
        return "{}";
      }

      // Static method to simulate Response.redirect()
      static redirect() {
        return {};
      }
    };
  }
}
