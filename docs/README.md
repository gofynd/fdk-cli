# fdk-cli Documentation

This directory contains comprehensive documentation for `@gofynd/fdk-cli`, the Fynd Development Kit command-line interface.

## Documentation Index

### Existing Guides

| Document | Description |
|----------|-------------|
| [Overview](./overview.md) | Architecture overview, configuration layout, and source structure |
| [Theme Commands](./theme-commands.md) | Reference for all `fdk theme *` commands |
| [Extension Commands](./extension-commands.md) | Reference for all `fdk extension *` commands |
| [Dependencies](./dependencies.md) | Third-party dependency inventory |

### In-Depth Guides

| Document | Description |
|----------|-------------|
| [Getting Started](./01-getting-started.md) | Installation, first-time setup, login walkthrough, and quick command reference |
| [Authentication](./authentication.md) | OAuth flow internals, token storage, session management, and logout behavior |
| [Local Dev Server](./local-dev-server.md) | Express dev server architecture, proxy configuration, HMR, SSR mode, Socket.io reload |
| [Build System](./build-system.md) | Webpack and Vue CLI build pipelines, output directories, code splitting, CSS handling |
| [Context Management](./context-management.md) | Theme and extension context files, multi-context support, active context switching |
| [Tunneling](./tunneling.md) | Cloudflare tunnel setup, extension preview tunneling, troubleshooting |
| [API Layer](./api-layer.md) | ApiClient architecture, request signing, interceptors, retry logic, service endpoints |
| [Troubleshooting](./troubleshooting.md) | Common errors, SSL issues, network problems, debug mode, log locations |

## Quick Start

```bash
# Install
npm install -g @gofynd/fdk-cli

# Login
fdk login

# Create a React theme
fdk theme new -n my-theme

# Start local dev server
fdk theme serve

# Create an extension
fdk extension init
```

## Version

This documentation covers `@gofynd/fdk-cli` v8.0.6 and later. The CLI requires Node.js >= 18.

## Repository

- **npm:** https://www.npmjs.com/package/@gofynd/fdk-cli
- **GitHub:** https://github.com/gofynd/fdk-cli
