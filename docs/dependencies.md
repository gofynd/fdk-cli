# Dependencies and Service Architecture

fdk-cli is part of a larger Fynd Commerce ecosystem. This document explains how fdk-cli integrates with each service and what happens under the hood.

---

## System Architecture Overview

```
Developer's Machine                          Fynd Cloud
+---------------------------+        +---------------------------+
|                           |        |                           |
|  fdk-cli                  |        |  superion (GraphQL API)   |
|    |                      |        |  blitzkrieg (Theme APIs)  |
|    +-- Express dev server -------->|  skyfire (Rendering SSR)  |
|    |     (proxy + HMR)    |        |  convex (Content mgmt)   |
|    |                      |        |  loki (Theme editor UI)   |
|    +-- Webpack/Vue CLI    |        |  theme-ai (AI endpoints)  |
|    |     (build system)   |        |                           |
|    +-- Cloudflare tunnel  |        +---------------------------+
|         (extension dev)   |
|                           |        +---------------------------+
|  Theme code               |        |  CDN (assets.fynd.com)    |
|    (react-starter based)  |        |    - Theme bundles        |
|    +-- firestone (UI lib) |        |    - Source ZIPs           |
|    +-- shadowfire-graphql |        |    - Images / Fonts        |
|         (fdk-store)       |        +---------------------------+
|                           |
+---------------------------+
```

---

## skyfire (Rendering Engine)

**What it is:** An Express + React SSR rendering engine that serves the storefront HTML.

**How fdk-cli uses it:**

When you run `fdk theme serve`, the local Express server does NOT render themes itself. Instead, it proxies to the live skyfire instance running on the application's domain:

1. Browser requests `http://localhost:5001/products`
2. The local Express server constructs a URL: `https://mystore.fynd.io/products?themeId=<theme_id>`
3. For SSR mode:
   - The local common.js bundle is uploaded to a temporary CDN location
   - A POST request is sent to skyfire with `{ theme_url: "<cdn-url>", domain: "http://127.0.0.1:5001" }`
   - Skyfire renders the page server-side using the uploaded bundle
4. For CSR mode:
   - A `__csr=true` query parameter is added
   - Skyfire returns a shell HTML without server rendering
5. The returned HTML is modified:
   - Remote bundle `<script>` and `<link>` tags are replaced with local URLs
   - Socket.io client script is injected for live reload
   - Sentry DSN is cleared to avoid sending dev errors to production

**Key insight:** Theme rendering always happens on skyfire. fdk-cli's serve mode is essentially a proxy that swaps remote assets with local builds.

### API Proxy Details

The local server proxies these route patterns to the live domain:

| Route Pattern | Signature | Purpose |
|---------------|-----------|---------|
| `/service/*` | Yes (fp-signature) | Platform API calls (catalog, cart, etc.) |
| `/ext/*` | Yes (fp-signature) | Extension API calls |
| `/cdn/*` | No | CDN asset fetching |

The proxy rewrites `/service` to `/api/service` on the target, sets the proper `Host` header, and handles cookie domain rewriting from the live domain to `127.0.0.1`.

---

## blitzkrieg (Theme Config Backend)

**What it is:** The backend service that manages theme CRUD operations, theme configuration, sections, pages, and assets.

**How fdk-cli uses it:**

All theme API calls go through the partner API routes, which internally reach blitzkrieg:

| Operation | API Endpoint | fdk-cli Command |
|-----------|-------------|----------------|
| Create theme | `POST /service/partner/theme/v1.0/organization/<org>/company/<co>/application/<app>` | `fdk theme new` |
| Get theme by ID | `GET .../application/<app>/<theme_id>` | `fdk theme pull`, `fdk theme serve`, `fdk theme sync` |
| Update theme | `PUT .../application/<app>/<theme_id>` | `fdk theme sync` |
| List all themes | `GET .../application/<app>/themes` | `fdk theme init`, `fdk theme context` |
| Get applied theme | `GET .../application/<app>/applied-theme` | `fdk binding preview` |
| Get default theme | `GET .../application/<app>/default_theme` | Internal |
| Manage pages | `GET/PUT .../application/<app>/<theme_id>/page` | `fdk theme sync` |

### Theme Data Model (what sync uploads)

When `fdk theme sync` runs, it updates the theme with:

```javascript
{
    // Bundle URLs (uploaded to CDN)
    information: {
        features: [...],
        css: { links: ["https://cdn/.../themeBundle.css"] },
        commonJs: { link: "https://cdn/.../themeBundle.common.js" },
        umdJs: { links: ["https://cdn/.../themeBundle.umd.js", ...] }
    },
    // Source code ZIP (for theme init/pull)
    src: "https://cdn/.../archive.zip",
    // Section definitions
    available_sections: [...],
    // Theme configuration
    config: {
        list: [...],
        current: "default",
        preset: {...},
        global_schema: {...}
    }
}
```

---

## react-starter (Theme Starter Template)

**What it is:** The template repository that developers clone when creating a new React theme.

**How fdk-cli uses it:**

- `fdk theme new -t react` copies files from fdk-cli's bundled `react-template/` directory (which mirrors the react-starter structure)
- `fdk theme new -t vue2` copies from the bundled `template/` directory
- `fdk theme init` for existing themes downloads the source ZIP and overlays it on the template structure

The template provides:
- Section component examples
- Configuration files (`settings_data.json`, `settings_schema.json`)
- Asset directories for images and fonts
- Package.json with theme dependencies (firestone, shadowfire-graphql, etc.)

---

## firestone (fdk-react-templates / UI Component Library)

**What it is:** A library of pre-built UI components used by themes.

**How fdk-cli relates to it:**

- firestone is a dependency listed in the theme's `package.json`, not in fdk-cli itself
- When `fdk theme new` runs and installs dependencies, firestone gets pulled in
- During builds, firestone components are bundled into the theme's output
- fdk-cli has no direct code dependency on firestone

---

## shadowfire-graphql (fdk-store / GraphQL Client)

**What it is:** A GraphQL client library that themes use to fetch data from the Fynd platform.

**How fdk-cli relates to it:**

- Like firestone, shadowfire-graphql is a theme dependency, not a direct fdk-cli dependency
- Themes import it to make GraphQL queries to superion (the API gateway)
- During `fdk theme serve`, the local proxy ensures GraphQL requests reach the production superion endpoints
- fdk-cli treats the theme's node_modules as opaque -- it builds whatever the theme imports

---

## superion (GraphQL API Gateway)

**What it is:** The GraphQL API gateway that themes query for storefront data (products, collections, navigation, etc.).

**How fdk-cli relates to it:**

- fdk-cli's dev server proxies `/service` requests to the live domain, which routes to superion
- The proxy adds `fp-signature` headers so that API calls are authenticated
- Developers don't interact with superion directly through fdk-cli; it's accessed via the proxied storefront APIs

---

## convex (Content Management)

**What it is:** The content management service for pages, blogs, FAQs, navigation, and other CMS content.

**How fdk-cli relates to it:**

- Content data is fetched through the proxied API calls during `fdk theme serve`
- `fdk theme pull-config` may pull settings that reference content managed by convex
- fdk-cli's locale sync feature uses the content partner API (`/service/partner/content/v1.0`) to manage UI label translations

---

## loki (Theme Editor UI)

**What it is:** The visual theme editor in the Fynd Platform admin panel.

**How fdk-cli relates to it:**

- `fdk theme open` generates a URL that opens the theme in loki's editor
- `fdk binding preview` generates a URL with a `section_preview_hash` that tells loki to load extension sections from a development tunnel instead of production
- Configuration changes made in loki can be pulled locally with `fdk theme pull-config`
- After `fdk theme sync`, the sync output includes a link to edit the theme in loki

---

## theme-ai (AI Endpoints)

**What it is:** AI-powered endpoints for theme customization and generation.

**How fdk-cli relates to it:**

- fdk-cli does not directly interact with theme-ai
- theme-ai endpoints are accessed through the platform UI and loki
- No CLI commands currently invoke theme-ai

---

## @gofynd/fp-signature (API Request Signing)

**What it is:** A library for signing HTTP requests to Fynd platform APIs.

**How fdk-cli uses it:**

Every API call from fdk-cli to the Fynd platform goes through Axios interceptors that:

1. Extract the URL path and query parameters
2. Generate a signature using the `sign()` function from `@gofynd/fp-signature`
3. Add `x-fp-signature` and `x-fp-date` headers to the request
4. Add the `Authorization: Bearer <access_token>` header for partner API routes

The signature is also regenerated for proxied requests during `fdk theme serve` -- the local proxy intercepts each request, strips the old signature, generates a new one for the target domain, and forwards the request.

```
src/lib/api/helper/interceptors.ts
  --> interceptorFn()       # Request interceptor for API calls
  --> addSignatureFn()      # Signature-only interceptor for proxy
```

---

## Cloudflare Tunneling

**What it is:** Cloudflare's `cloudflared` binary that creates secure tunnels from the internet to your local machine.

**How fdk-cli uses it:**

The `Tunnel` class (`src/lib/Tunnel.ts`) wraps the `cloudflared` npm package:

1. Installs the `cloudflared` binary if not present (version `2024.6.1`)
2. Sets environment variables to disable auto-update and force HTTP/2
3. Starts the tunnel on the specified port
4. Returns the public URL (e.g., `https://<random>.trycloudflare.com`)
5. Monitors tunnel status via log parsing (connected, disconnected, retrying)
6. Cleans up on process exit (SIGINT, SIGUSR1, SIGUSR2)

**Used by:**
- `fdk extension preview-url` -- Creates a tunnel for the extension's frontend port
- `fdk binding preview` -- Creates a tunnel for the binding's dev server (port 5500 by default)
- `fdk tunnel --port <port>` -- Standalone tunnel command

**Custom tunnel support:** The `--custom-tunnel` flag on `fdk extension preview` lets you provide your own tunnel URL instead of using Cloudflare. The `--tunnel-url` flag lets you pass the URL directly.

---

## How Local Dev Connects to Production Services

### Theme Development (fdk theme serve)

```
Browser (localhost:5001)
  |
  +--[HTML request]-------> Local Express Server
  |                              |
  |                              +--[POST with local bundle URL]---> skyfire (production)
  |                              |                                       |
  |                              |                                  [Renders HTML with
  |                              |                                   local bundle reference]
  |                              |                                       |
  |                              +<--[HTML response]--------------------+
  |                              |
  |                              +--[Replace remote assets with local URLs]
  |                              +--[Inject Socket.io reload script]
  |                              |
  +<--[Modified HTML]-----------+
  |
  +--[API call /service/...]---> Local Express Server
  |                              |
  |                              +--[Re-sign with fp-signature]---> Production API (superion/convex/etc)
  |                              |
  +<--[API response]<-----------+
  |
  +--[JS/CSS bundles]---------> Local Express Server
                                 |
                                 +--[Serve from .fdk/distServed/]
```

### Extension Development (fdk extension preview)

```
Fynd Platform (browser)
  |
  +--[Loads extension iframe]---> Cloudflare Tunnel
  |                                    |
  |                                    +---> Local Extension Server (frontend port)
  |
  +--[Extension API calls]------> Cloudflare Tunnel
  |                                    |
  |                                    +---> Local Extension Server (backend port)
  |
  +--[Platform API calls]-------> Fynd API (direct, no proxy)
```

### Extension Binding Preview (fdk binding preview)

```
Theme Editor (loki in browser)
  |
  +--[section_preview_hash in URL]
  |
  +--[Loads binding JS/CSS]-------> Cloudflare Tunnel
  |                                      |
  |                                      +---> Local Binding Server (port ~5500)
  |                                              |
  |                                              +--[Serves from bindings/theme/react/<name>/dist/]
  |
  +--[File change detected]-------> Webpack rebuild
  |                                      |
  |                                      +---> Socket.io reload event
  |
  +--[Browser reloads binding]
```

---

## CDN and Asset Upload Flow

When syncing a theme (`fdk theme sync`), assets are uploaded using a two-step flow:

1. **Start upload** -- `POST /service/partner/assets/v2.0/organization/<org>/namespaces/<ns>/upload/start` -- Returns a pre-signed upload URL
2. **Upload file** -- `PUT <pre-signed-url>` -- Uploads the file content directly to storage
3. **Complete upload** -- `POST .../upload/complete` -- Finalizes the upload and returns the CDN URL

**Namespaces used:**
- `fdk-cli-dev-files` -- Temporary dev files (SSR bundles during serve)
- Theme-specific namespaces for production assets

**What gets uploaded during sync:**
- Theme source code ZIP archive
- CSS bundle files
- JavaScript UMD bundle files
- Theme images from `theme/assets/images/`
- Theme fonts from `theme/assets/fonts/`
