# Theme Commands

All theme commands are invoked under `fdk theme <subcommand>`. They manage the full lifecycle of Fynd Commerce storefront themes.

---

## fdk theme new

Creates a brand new theme from a template, registers it on the platform, and syncs the initial build.

```bash
fdk theme new -n "My Theme"              # Creates a React theme (default)
fdk theme new -n "My Theme" -t vue2      # Creates a Vue2 theme
fdk theme new -n "My Theme" -t react     # Explicitly React
```

### What Happens

1. **Select company and sales channel** -- You pick development/live account type, then a company, then a sales channel (application).
2. **Clone template** -- React themes clone from `react-template/`; Vue2 themes clone from `template/` (both bundled in the fdk-cli package).
3. **Install dependencies** -- Runs `npm install` in the new theme directory.
4. **Build** -- Runs an initial webpack (React) or Vue CLI (Vue2) build.
5. **Extract sections** -- Parses the built bundle to discover available sections and their settings schemas.
6. **Register theme** -- Calls the Blitzkrieg theme API to create the theme on the platform with the extracted sections, pages, settings schema, and settings data.
7. **Save context** -- Creates `.fdk/context.json` with the theme's application ID, company ID, theme ID, domain, and theme type.
8. **Initial sync** -- Uploads the built bundle and source ZIP to CDN.

### Theme Types

| Type | Build System | Template Source | Entry File |
|------|-------------|----------------|------------|
| `react` | Webpack 5 (custom config in `theme.react.config.ts`) | `react-template/` | Sections index auto-generated in `.fdk/` |
| `vue2` | Vue CLI Service | `template/` | `theme/sections/index.js` |

---

## fdk theme init

Initializes a local project from an existing theme on the platform. Use this when a theme already exists and you want to start developing it locally.

```bash
fdk theme init
```

### What Happens

1. **Select company, sales channel, and theme** -- Interactive prompts to pick an existing theme.
2. **Copy template config files** -- Copies the base template structure (React or Vue2, depending on the theme's `theme_type`).
3. **Download source bundle** -- Downloads the theme's source ZIP from CDN and extracts it.
4. **Write configuration files** -- Writes `settings_data.json`, `settings_schema.json`, and `config.json` from the platform's stored configuration.
5. **Save context** -- Creates `.fdk/context.json` with the theme details.
6. **Restructure if needed** -- For Vue2 themes, may restructure the folder layout if the entry file is missing.
7. **Install dependencies** -- Runs `npm install`.

The context name is auto-generated as `<theme-name>-<env-domain>`.

---

## fdk theme context

Manages theme contexts. Contexts allow a single theme codebase to target multiple applications or environments.

```bash
# Add a new context (will prompt for company/app/theme selection)
fdk theme context -n "staging"

# List all contexts and switch active context
fdk theme context-list

# Show the active context name
fdk theme active-context
```

### Context Structure (.fdk/context.json)

```json
{
  "theme": {
    "active_context": "my-context",
    "contexts": {
      "my-context": {
        "name": "my-context",
        "application_id": "abc123",
        "domain": "mystore.fynd.io",
        "company_id": 42,
        "theme_id": "theme_xyz",
        "application_token": "token_abc",
        "theme_type": "react"
      },
      "staging": {
        "name": "staging",
        "application_id": "def456",
        "domain": "staging.mystore.fynd.io",
        "company_id": 42,
        "theme_id": "theme_uvw",
        "application_token": "token_def",
        "theme_type": "react"
      }
    }
  },
  "partners": {}
}
```

Key fields per context:

| Field | Description |
|-------|-------------|
| `application_id` | Sales channel (application) ID |
| `domain` | Application domain name (e.g., `mystore.fynd.io`) |
| `company_id` | Company ID on the platform |
| `theme_id` | Theme ID on the platform |
| `application_token` | Application authentication token |
| `theme_type` | `react` or `vue2` |

The active context determines which company/app/theme all other commands operate on.

---

## fdk theme serve

Starts a local development server with live reload for theme development.

```bash
fdk theme serve                     # Default: SSR=true, HMR=true, port=5001
fdk theme serve --port 3000         # Custom port
fdk theme serve --ssr false         # Disable server-side rendering
fdk theme serve --hmr false         # Disable hot module replacement (React only)
```

### Architecture

The local dev server is an Express application that:

1. **Builds the theme locally** -- Uses webpack (React) or Vue CLI (Vue2) to build into `.fdk/distServed/`.
2. **Serves static assets** -- The built JS/CSS bundles are served from the local Express server.
3. **Proxies API requests** -- All `/service` and `/ext` routes are proxied to the live platform domain (e.g., `https://mystore.fynd.io`) with request signing via `@gofynd/fp-signature`.
4. **Renders pages** -- For HTML requests, it fetches the page from the live domain (skyfire), injects the local bundle URLs in place of the remote ones, and serves the modified HTML.
5. **Socket.io live reload** -- Injects a Socket.io client that listens for `reload` events when files change.

### React Theme Serve Flow

```
Browser Request
     |
     v
Express Server (localhost:5001)
     |
     +--> Static assets (JS/CSS from .fdk/distServed/)
     |
     +--> /service/*, /ext/* --> Proxy to live domain with fp-signature
     |
     +--> /* (HTML) --> POST to live domain (skyfire) with local bundle URL
              |
              v
         Receive HTML, replace remote bundle links with local ones,
         inject Socket.io reload script, send to browser
```

- **HMR (Hot Module Replacement)**: For React themes, uses `webpack-dev-middleware` and `webpack-hot-middleware` with `@pmmmwh/react-refresh-webpack-plugin` for component-level hot reloading.
- **File watching**: Uses `chokidar` to watch the `theme/` directory. On change, rebuilds and emits a reload event.
- **Section chunking**: If the theme supports section chunking, sections are built as separate webpack chunks for faster loading.

### Vue2 Theme Serve Flow

- Builds using Vue CLI Service with a generated `vue.config.js` (written to `.fdk/vue.config.js`)
- Uses `chokidar` to watch `theme/` directory for changes
- On change, re-runs the Vue CLI build and triggers a full page reload via Socket.io
- SSR can be toggled: when enabled, the bundle is uploaded to CDN and skyfire renders it server-side; when disabled, `__csr=true` is added to the request for client-side rendering only

### Proxy and Request Signing

API requests from the local dev server to the platform are signed using `@gofynd/fp-signature`. The proxy:

- Rewrites `/service` to `/api/service` on the target
- Sets the correct `Host` header for the target domain
- Adds `x-fp-signature` and `x-fp-date` headers for authenticated routes (`/service`, `/ext`)
- Passes CDN requests (`/cdn`) without signature
- Rewrites cookie domains from the live domain to `127.0.0.1`

---

## fdk theme sync

Uploads the current theme code and built assets to the Fynd platform.

```bash
fdk theme sync
```

### What Happens (React)

1. Reads the active context to determine the target theme
2. Fetches the current theme from the platform for comparison
3. Clears previous builds
4. Generates section index files (bundle or chunked depending on config)
5. Creates a ZIP of the source code and uploads it to CDN
6. Runs a production webpack build with CDN-based asset paths
7. Uploads built image and font assets to CDN
8. Extracts available sections from the built bundle
9. Validates sections against the database (warns about missing sections)
10. Uploads JS and CSS bundle files to CDN
11. Updates available pages from custom templates
12. Calls the theme update API with all the new data (bundle URLs, sections, pages, settings, source ZIP URL)

### What Happens (Vue2)

Similar flow but uses Vue CLI for building and has an additional CommonJS bundle output. Also reads `config.json` for theme colors/styles/font.

### Validation

- **Section validation**: Compares local sections against what exists on the platform. If sections are missing locally, you are warned and asked to confirm before proceeding.
- **Available sections validation**: Ensures all section settings have required fields.

---

## fdk theme pull

Downloads the current theme's source code from the platform.

```bash
fdk theme pull
```

### What Happens

1. Fetches theme data from the platform API
2. Removes the local `theme/` directory
3. Downloads the theme's source ZIP from CDN
4. Extracts the ZIP into the current directory
5. Writes configuration files (`config.json`, `settings_data.json`, `settings_schema.json`)
6. For React themes, also syncs locale files if a `theme/locales` directory exists

---

## fdk theme pull-config

Fetches only the theme configuration (settings data) from the platform without pulling the full source code.

```bash
fdk theme pull-config
```

This updates `settings_data.json` with the latest values from the platform (list, current, preset). Useful when configuration changes were made in the theme editor and you want to sync them locally.

---

## fdk theme open

Opens the theme preview in your default browser.

```bash
fdk theme open
```

Constructs the preview URL from the active context:
```
https://<domain>/?themeId=<theme_id>&preview=true
```

---

## fdk theme package

Creates a ZIP archive of the theme suitable for marketplace submission.

```bash
fdk theme package
```

Archives the theme source code into a distributable ZIP file.

---

## Build System Details

### React Webpack Configuration

The React theme build uses a custom webpack configuration (`theme.react.config.ts`) with:

- **Entry points**: Auto-generated section index file + theme bundle entry
- **Output**: UMD library format (`themeBundle.umd.js`) + CommonJS for SSR (`themeBundle.common.js`)
- **Loaders**: Babel (with React preset + TypeScript support), CSS/SCSS with MiniCssExtractPlugin
- **HMR**: React Refresh plugin when running locally with HMR enabled
- **Section chunking**: When enabled, each section is a separate chunk for lazy loading
- **Externals**: React, ReactDOM, react-router-dom are treated as externals (provided by skyfire at runtime)

Key webpack output files:
```
.fdk/dist/
  themeBundle.umd.js        # Main UMD bundle
  themeBundle.common.js     # CommonJS bundle (for SSR)
  themeBundle.umd.*.js      # Section chunks (when chunking enabled)
  *.css                     # Extracted stylesheets
  sections.commonjs.js      # Section metadata (for section extraction)
```

### Vue2 Build Configuration

Vue2 themes use Vue CLI Service with a dynamically generated `vue.config.js`:

- Written to `.fdk/vue.config.js` before each build
- Configured with CDN paths for images and assets
- Uses a custom `setting-loader.js` for processing `<settings>` tags in Vue SFCs
- Builds to `.fdk/dist/` with UMD and CommonJS outputs
- For Node >= 18, automatically adds `--openssl-legacy-provider` flag

### Theme Directory Structure

**React theme:**
```
my-theme/
  .fdk/                    # Generated build files and context
  theme/
    sections/              # Section components (React)
    config/
      settings_data.json   # Theme settings values
      settings_schema.json # Theme settings schema
    assets/
      images/              # Theme images (uploaded to CDN on sync)
      fonts/               # Theme fonts (uploaded to CDN on sync)
    locales/               # i18n locale files
  config.json              # Theme colors, styles, font
  package.json             # Must include "theme_type": "react"
  webpack.config.js        # Optional custom webpack overrides
```

**Vue2 theme:**
```
my-theme/
  .fdk/
  theme/
    sections/              # Section components (Vue SFCs)
    templates/             # Page templates
    config/
      settings_data.json
      settings_schema.json
    assets/
      images/
      fonts/
  config.json
  package.json             # Must include "theme_type": "vue2"
```
