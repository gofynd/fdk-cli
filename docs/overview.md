# fdk-cli Overview

## What is fdk-cli?

`fdk-cli` (Fynd Development Kit CLI) is the official command-line tool for building themes and extensions on the Fynd Commerce platform. It provides a local development environment with live preview, hot module replacement, and seamless integration with the Fynd platform APIs.

**Package:** `@gofynd/fdk-cli` (v8.0.6+)
**Node requirement:** >= 18
**Repository:** https://github.com/gofynd/fdk-cli

### Key Capabilities

- **Theme development** -- Create, serve, sync, and package React and Vue2 themes
- **Extension development** -- Scaffold, preview, and manage extensions with Cloudflare tunneling
- **Extension bindings** -- Build and publish extension sections that inject into themes
- **Authentication** -- OAuth-based login through the Fynd Partners Panel
- **Environment management** -- Switch between Fynd platform environments (production, staging)

---

## Installation

```bash
npm install -g @gofynd/fdk-cli
```

Verify the installation:

```bash
fdk --version
```

---

## Authentication Flow

fdk-cli uses an OAuth-based flow through the Fynd Partners Panel. There is no username/password prompt -- authentication happens in the browser.

### How It Works

1. Run `fdk login` (or `fdk auth`)
2. The CLI starts a local Express server on a random free port
3. The CLI opens `https://partners.fynd.com/organizations/?fdk-cli=true&callback=http://127.0.0.1:<port>` in your browser
4. You log in and select an organization on the Partners Panel
5. The Partners Panel sends an OAuth token back to the local server via a POST to `/token`
6. The CLI stores the token (with expiry) in the global configstore
7. The local server shuts down (auto-times out after 2 minutes if no token is received)

### Login Commands

```bash
# Default login (api.fynd.com)
fdk login

# Login to a specific environment
fdk login --host api.fyndx1.de

# Login with a specific region
fdk login --region asia-south1

# View current user info
fdk user

# Logout
fdk logout
```

### Token Management

When you log in, the CLI stores:
- `auth_token` -- OAuth access token with expiry timestamp
- `organization` -- Selected organization ID
- `organization_detail` -- Organization metadata

If you are already logged in and run `fdk login` again, you are prompted to confirm whether you want to switch organizations. Switching clears the existing token and extension context.

---

## Configuration Management

### Global Config (configstore)

fdk-cli uses the `configstore` npm package for global configuration. The config file lives at:

```
~/.config/configstore/@gofynd/fdk-cli.json
```

**Stored keys:**

| Key | Description |
|-----|-------------|
| `current_env.value` | Active Fynd API domain (e.g., `api.fynd.com`) |
| `current_env.auth_token` | OAuth token with access_token, expiry_time, current_user |
| `current_env.organization` | Selected organization ID |
| `current_env.organization_detail` | Organization metadata |
| `current_env.partner_access_token` | Partner access token (for extension launch URL updates) |
| `extras.strict_ssl` | SSL verification setting |
| `extras.ca_file` | Custom CA certificate file path |

### Project-Level Config (.fdk/ directory)

Each theme project contains a `.fdk/` directory with:

| File | Description |
|------|-------------|
| `.fdk/context.json` | Theme contexts -- maps context names to company/app/theme IDs |
| `.fdk/dist/` | Build output directory (for sync) |
| `.fdk/distServed/` | Build output directory (for local serve) |
| `.fdk/temp-theme/` | Temporary source copy for zipping |
| `.fdk/archive/` | Source code ZIP archive |
| `.fdk/vue.config.js` | Generated Vue CLI config (Vue2 themes only) |
| `.fdk/setting-loader.js` | Custom webpack loader for settings (Vue2 themes only) |
| `.fdk/sectionsSettings.json` | Extracted section settings (React themes with section chunking) |

### Extension-Level Config

Extensions use a file in the project root:

| File | Description |
|------|-------------|
| `extension.context.json` | Extension API key, secret, base URL, launch type, dev company |
| `fdk.ext.config.json` or `fdk.ext.config.yml` | Project config declaring roles, dev commands, ports, install commands |

---

## Source Code Architecture

```
src/
  fdk.ts                  # CLI entry point (Commander.js setup)
  commands/               # Command registration modules
    auth.ts               # fdk login / logout / user
    theme/
      index.ts
      theme-builder.ts    # All theme subcommand definitions
    extension/
      index.ts
      extension-builder.ts  # All extension subcommand definitions
    binding/
      index.ts
      binding-builder.ts  # All binding subcommand definitions
    config/               # Config management commands
    context/              # Context commands
    tunnel.ts             # Standalone tunnel command
    populate.ts           # Data population command
  lib/                    # Core business logic
    Auth.ts               # OAuth login flow (local Express server)
    Theme.ts              # Theme CRUD, build, serve, sync, pull logic
    ThemeContext.ts        # Theme context management
    Extension.ts          # Extension initialization and scaffolding
    ExtensionPreviewURL.ts  # Extension preview with tunnel
    ExtensionLaunchURL.ts # Launch URL get/set
    ExtensionEnv.ts       # Pull extension environment variables
    ExtensionSection.ts   # Extension binding init/draft/publish/preview
    ExtensionContext.ts   # Extension context file I/O
    Config.ts             # Configstore singleton + CONFIG_KEYS
    Env.ts                # Environment domain management
    Tunnel.ts             # Cloudflare tunnel wrapper
    CommandError.ts       # Error types and error codes
    Logger.ts             # Winston-based logging
    Debug.ts              # Debug mode logging
    CompanySetup.ts       # Company setup helper
    api/
      services/           # API service classes
        url.ts            # URL builders for all API endpoints
        theme.service.ts  # Theme CRUD API calls
        extension.service.ts  # Extension API calls
        configuration.service.ts  # Application/company config APIs
        upload.service.ts # File upload (start/complete flow)
        organization.service.ts  # Organization details
        locales.service.ts  # Locale/i18n API calls
        auth.service.ts   # Authentication API calls
      helper/
        interceptors.ts   # Axios interceptors (fp-signature, auth headers)
  helper/                 # Utility modules
    build.ts              # Webpack/Vue CLI build orchestration
    serve.utils.ts        # Express dev server, proxy, HMR setup
    theme.react.config.ts # React webpack configuration
    theme.vue.config.ts   # Vue CLI configuration generator
    extension.react.config.ts  # Extension section webpack config
    utils.ts              # General utilities (context, section parsing, etc.)
    extension_utils.ts    # Extension-specific utilities
    constants.ts          # Templates, launch types, context keys
    file.utils.ts         # File read/write helpers
    archive.ts            # ZIP archiving (archiver)
    download.ts           # File download helper
    spinner.ts            # CLI spinner (ora)
    formatter.ts          # Output formatting (boxen, links)
    clone_git_repository.ts  # Git clone helper
    locales.ts            # Locale sync logic
```

### Key Design Patterns

- **Commander.js** -- All commands are registered via `commander`. Each command module exports a function that receives the `program` instance.
- **Static class methods** -- Most business logic lives in static methods on classes like `Theme`, `Extension`, `ExtensionSection`.
- **configstore singleton** -- A single `Configstore` instance (`Config.ts`) is imported throughout the codebase for global state.
- **asyncAction** -- Custom Commander extension that wraps async handlers with error handling.

---

## Environment Management

fdk-cli can target different Fynd platform environments. The environment is the API domain.

```bash
# Login sets the environment implicitly
fdk login                          # Uses api.fynd.com (production)
fdk login --host api.fyndx1.de     # Uses fyndx1 staging environment
```

### How Environments Work

The `current_env.value` in configstore holds the active API domain (e.g., `api.fynd.com`). All other URLs are derived from it:

| Service | URL Pattern |
|---------|-------------|
| API | `https://api.fynd.com` |
| Platform | `https://platform.fynd.com` |
| Partners | `https://partners.fynd.com` |
| Themes/Marketplace | `https://themes.fynd.com` |

The domain is validated on login by hitting `/service/application/content/_healthz` to confirm the platform is reachable.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `FDK_EXTRA_CA_CERTS` | Path to a CA certificate file (for VPN/proxy environments) |
| `FDK_SSL_NO_VERIFY` | Set to `true` to disable SSL verification |
| `DEBUG` | Enable debug output from Cloudflare tunnel |
