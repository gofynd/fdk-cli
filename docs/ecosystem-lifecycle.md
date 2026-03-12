# Fynd Ecosystem Cross-Service Lifecycle — fdk-cli Perspective

> This document describes the complete end-to-end lifecycle flows across the Fynd storefront ecosystem,
> with emphasis on where **fdk-cli** (the CLI tool for theme and extension development) participates.
> Bold markers (>>>) indicate steps where fdk-cli is directly involved.

---

## Table of Contents

1. [Storefront Page Rendering](#1-storefront-page-rendering)
2. [Theme Editing in Loki](#2-theme-editing-in-loki)
3. [Theme Development with fdk-cli](#3-theme-development-with-fdk-cli)
4. [AI-Powered Section Creation](#4-ai-powered-section-creation)
5. [Content Management Flow](#5-content-management-flow)
6. [Extension Section Lifecycle](#6-extension-section-lifecycle)
7. [Color Theme Generation](#7-color-theme-generation)
8. [Translation / i18n Flow](#8-translation--i18n-flow)

---

## 1. Storefront Page Rendering

fdk-cli does not participate directly in production page rendering, but it is responsible for building and uploading the theme code that skyfire renders.

### Flow

1. User browser sends HTTP request (e.g., `GET /products/shoe-123`).
2. Skyfire receives the request via Express router.
3. Skyfire calls blitzkrieg to fetch theme metadata — including the CDN URL for the UMD bundle.
4. Blitzkrieg returns theme config JSON. **The UMD bundle at this CDN URL was uploaded by `fdk theme sync` or `fdk theme publish` from fdk-cli.**
5. Skyfire loads the UMD bundle from CDN.
6. react-starter theme code initializes — registers pages, sections, components.
7. Sections use firestone UI components.
8. Skyfire initializes the FPI client (shadowfire-graphql/fdk-store).
9. shadowfire-graphql sends GraphQL queries to superion.
10. superion resolves data from blitzkrieg and convex.
11. shadowfire-graphql populates Redux store.
12. react-starter renders with data.
13. Skyfire calls `renderToString()`, produces HTML, caches in Redis, sends to browser.
14. Browser hydrates.

### fdk-cli's Indirect Role

- The theme bundle running in production was **built and uploaded by fdk-cli** (`fdk theme sync` / `fdk theme publish`).
- The theme structure (pages, sections, component mappings) was **scaffolded by fdk-cli** (`fdk theme new`).

### When fdk-cli Is Down

- **No impact on production rendering.** The bundle is already on CDN. fdk-cli is a development-time tool.

---

## 2. Theme Editing in Loki

fdk-cli does not participate in the Loki editing flow. Loki is a browser-based editor.

### Flow

1. Merchant opens Loki theme editor.
2. Loki loads theme data from blitzkrieg via RTK Query.
3. Loki renders editor UI (sidebar, canvas).
4. Loki loads skyfire in an iframe for preview.
5. Skyfire renders the theme preview.
6. Merchant drags/edits a section.
7. Loki sends PostMessage to skyfire iframe.
8. Skyfire re-renders preview in real time.
9. Merchant publishes.
10. Loki saves config to blitzkrieg.
11. Blitzkrieg produces Kafka event; skyfire cache is invalidated.

### fdk-cli's Indirect Role

- The theme that Loki is editing was originally **created and uploaded using fdk-cli**.
- Section schemas that appear in Loki's sidebar were **defined by the developer in react-starter** and uploaded via fdk-cli.

### When fdk-cli Is Down

- **No impact on Loki.** Loki works entirely through browser APIs to blitzkrieg and skyfire.

---

## 3. Theme Development with fdk-cli

This is fdk-cli's primary lifecycle. It owns the entire local development workflow.

### Flow

1. **>>> Developer runs `fdk login`** — opens a browser window for OAuth authentication with the Fynd Partners Panel. On success, stores the auth token locally in `~/.fdk/auth.json`.
2. **>>> `fdk theme new`** — prompts for theme name and scaffolds a new project from the react-starter template. Installs firestone and shadowfire-graphql as npm dependencies.
3. **>>> `fdk theme context`** — prompts the developer to select a company and application. Binds the local project to a specific theme record in blitzkrieg. Stores context in `.fdk/context.json`.
4. **>>> `fdk theme serve`** — starts a local Express development server on port 5001. Launches Webpack in watch mode with HMR enabled.
5. Webpack builds the react-starter theme code into a development UMD bundle.
6. Developer opens `http://localhost:5001` in browser.
7. **>>> fdk-cli's local server proxies the request** to the live skyfire domain for the bound application.
8. Skyfire receives the proxied request. fdk-cli injects headers telling skyfire to use the local bundle URL instead of the CDN bundle.
9. Skyfire renders the page using the local theme code with real production data.
10. Developer edits a section file in react-starter.
11. **>>> Webpack detects the file change. HMR sends an update** to the browser — the changed module is hot-swapped without a full reload.
12. **>>> `fdk theme sync`** — builds a production bundle and uploads it to blitzkrieg's CDN storage. The live theme now uses this bundle.
13. **>>> `fdk theme publish`** — marks the theme as the active theme for the application in blitzkrieg.

### Data Format Examples

**`.fdk/context.json` (created by `fdk theme context`):**
```json
{
  "theme": {
    "company_id": 1234,
    "application_id": "app_5678abcd",
    "theme_id": "theme_9012efgh",
    "domain": "mystore.fynd.io"
  }
}
```

**`~/.fdk/auth.json` (created by `fdk login`):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "rt_abc123...",
  "expires_at": 1742500000
}
```

**Proxy request headers injected by fdk-cli:**
```
X-FDK-Dev-Mode: true
X-FDK-Bundle-URL: http://localhost:5001/bundle/theme.umd.js
X-FDK-CSS-URL: http://localhost:5001/bundle/theme.css
```

**Webpack config highlights (generated by fdk-cli):**
```javascript
{
  entry: './src/index.js',
  output: {
    library: 'theme',
    libraryTarget: 'umd',
    filename: 'theme.umd.js'
  },
  devServer: {
    hot: true,
    port: 5001
  }
}
```

### fdk-cli's Role in Detail

- **Authentication**: Manages OAuth flow and token storage/refresh
- **Scaffolding**: Creates new theme projects from templates with correct dependencies
- **Context binding**: Links local code to a specific blitzkrieg theme record
- **Dev server**: Express server with Webpack HMR for rapid development
- **Proxy**: Routes local requests through live skyfire for real data rendering
- **Build + upload**: Produces optimized UMD bundle and uploads to CDN via blitzkrieg API
- **Publishing**: Marks themes as active in blitzkrieg

### When fdk-cli Is Down

- **Impact**: Developers cannot create, serve, sync, or publish themes.
- **Existing themes unaffected**: Already-published themes continue rendering in skyfire.
- **Workaround**: Developers could manually build and upload bundles, but this is impractical.

---

## 4. AI-Powered Section Creation

fdk-cli does not participate directly in the AI section creation flow.

### Flow

1. Merchant opens Loki editor.
2. Merchant clicks "Add AI Section".
3. Loki sends prompt to theme-ai (`POST /api/content-generate`).
4. theme-ai introspects superion GraphQL schema.
5. theme-ai calls LLM with schema context.
6. LLM generates data source config, variables, and HTML template.
7. theme-ai validates GraphQL queries.
8. theme-ai returns section definition to Loki.
9. Loki injects section into page config.
10. Loki sends PostMessage to skyfire iframe.
11. Skyfire renders the AI-generated section.
12. Merchant adjusts and publishes.
13. Loki saves to blitzkrieg.

### fdk-cli's Indirect Role

- Developers can inspect AI-generated sections locally by running `fdk theme serve` after they have been saved to a theme.
- Future: fdk-cli may support local AI section generation.

### When fdk-cli Is Down

- **No impact.** AI section creation is entirely within Loki and theme-ai.

---

## 5. Content Management Flow

fdk-cli does not participate in the content management flow.

### Flow

1. Content creator creates blog/page/FAQ in convex via Platform.
2. Convex stores in MongoDB, produces Kafka event.
3. Skyfire cache invalidated.
4. User visits storefront.
5. Skyfire renders page; react-starter component calls `fpi.executeGQL()`.
6. shadowfire-graphql queries superion; superion queries convex.
7. Data returns through chain.
8. react-starter renders content using firestone UI components.

### fdk-cli's Indirect Role

- The blog/FAQ/page **components** that render content were developed using fdk-cli's dev server.
- Developers use `fdk theme serve` to test content rendering locally.

### When fdk-cli Is Down

- **No impact on content rendering.** Content flows through convex -> superion -> skyfire.

---

## 6. Extension Section Lifecycle

fdk-cli is the primary tool for building and publishing extension sections.

### Flow

1. **>>> Developer runs `fdk binding init`** — scaffolds an extension section project from template. Creates section schema, component files, and build config.
2. **>>> Developer builds the section UI** using the scaffolded structure, firestone components, and shadowfire-graphql for data.
3. **>>> `fdk binding draft`** — builds the extension section bundle and uploads it to blitzkrieg with status `draft`. The section is only visible in the developer's test company.
4. Developer tests the extension section in a dev company via Loki.
5. **>>> `fdk binding publish`** — updates the extension section status to `published` in blitzkrieg. The section becomes available to all merchants.
6. Merchant opens Loki editor.
7. Loki fetches available extension sections from blitzkrieg.
8. Merchant adds an extension section to a page.
9. Loki saves page config with `__source` reference.
10. User visits storefront.
11. Skyfire fetches page config from blitzkrieg.
12. Skyfire loads extension section bundle from CDN.
13. Skyfire renders extension section alongside theme sections.

### Data Format Examples

**Extension section schema (created by `fdk binding init`):**
```json
{
  "name": "Reviews Carousel",
  "slug": "ext-reviews-carousel",
  "props": [
    {
      "id": "title",
      "label": "Section Title",
      "type": "text",
      "default": "Customer Reviews"
    },
    {
      "id": "max_reviews",
      "label": "Max Reviews",
      "type": "number",
      "default": 10
    }
  ],
  "data_source": {
    "type": "graphql",
    "query": "query Reviews($first: Int) { reviews(first: $first) { edges { node { ... } } } }"
  }
}
```

**`fdk binding draft` API call:**
```
POST /api/v1/extensions/{extension_id}/sections
Content-Type: multipart/form-data

{
  "schema": "<section schema JSON>",
  "bundle": "<UMD bundle file>",
  "status": "draft"
}
```

### fdk-cli's Role in Detail

- **Scaffolding**: `fdk binding init` creates the extension section project structure
- **Local testing**: `fdk binding serve` (if available) or integration with `fdk theme serve`
- **Draft upload**: `fdk binding draft` builds and uploads with draft status
- **Publishing**: `fdk binding publish` makes the section publicly available
- **Versioning**: Manages bundle versions for extension sections

### When fdk-cli Is Down

- **Impact**: Developers cannot create, test, draft, or publish extension sections.
- **Existing extension sections unaffected**: Already-published extensions continue rendering.
- **Merchants unaffected**: Loki still shows published extension sections.

---

## 7. Color Theme Generation

fdk-cli does not participate in the color theme generation flow.

### Flow

1. Merchant opens Loki editor, clicks Color Palette.
2. Merchant uploads a logo.
3. Loki sends logo to theme-ai (`POST /api/color-theme-generate`).
4. theme-ai analyzes logo with vision model, generates palette.
5. theme-ai returns multiple variants.
6. Merchant selects a variant.
7. Loki updates global config, sends PostMessage to skyfire iframe.
8. Skyfire re-renders with new colors.
9. Merchant publishes; Loki saves to blitzkrieg; skyfire cache invalidated.

### fdk-cli's Indirect Role

- Developers can test color theme changes locally by modifying global config in `fdk theme serve`.
- The theme's CSS custom properties (which respond to color changes) were developed using fdk-cli.

### When fdk-cli Is Down

- **No impact.** Color generation is between Loki, theme-ai, and skyfire.

---

## 8. Translation / i18n Flow

fdk-cli does not participate directly in the translation flow.

### Flow

1. Admin configures languages in convex.
2. User visits storefront with locale cookie.
3. Skyfire reads locale from cookie.
4. Skyfire passes locale to shadowfire-graphql.
5. shadowfire-graphql includes `x-i18n-lang` header in GraphQL requests.
6. superion resolver calls blitzkrieg/convex REST APIs.
7. superion detects non-English locale, calls convex translation API.
8. convex returns translated content.
9. superion applies translations.
10. shadowfire-graphql populates Redux.
11. react-starter renders translated strings.
12. firestone displays localized text.

### fdk-cli's Indirect Role

- Developers use `fdk theme serve` to test i18n behavior locally by setting locale cookies.
- The components that handle translated strings were developed using fdk-cli.

### When fdk-cli Is Down

- **No impact on translation rendering.** Translations flow through convex -> superion -> skyfire.

---

## Summary: fdk-cli's Position in the Ecosystem

| Lifecycle | fdk-cli's Role |
|-----------|---------------|
| Page Rendering | **Indirect** — built and uploaded the theme bundle |
| Theme Editing (Loki) | **None** — Loki is browser-based |
| Theme Dev (fdk-cli) | **Primary owner** — login, scaffold, serve, sync, publish |
| AI Section Creation | **None** — Loki + theme-ai |
| Content Management | **Indirect** — developed the content components |
| Extension Sections | **Primary owner** — init, draft, publish extension sections |
| Color Theme Generation | **None** — Loki + theme-ai |
| Translation / i18n | **Indirect** — developed i18n-aware components |

fdk-cli is a **development-time tool**. It has zero impact on production runtime flows. Its value is in enabling developers to create, test, and publish the theme and extension code that all other services consume. When fdk-cli is unavailable, no new development or publishing can happen, but all existing themes and extensions continue functioning normally.

### Key CLI Commands Reference

| Command | Purpose | Interacts With |
|---------|---------|---------------|
| `fdk login` | OAuth authentication | Partners Panel |
| `fdk theme new` | Scaffold theme project | npm registry (templates) |
| `fdk theme context` | Bind to app/theme | blitzkrieg API |
| `fdk theme serve` | Local dev server | skyfire (proxy), Webpack |
| `fdk theme sync` | Upload bundle to CDN | blitzkrieg API |
| `fdk theme publish` | Activate theme | blitzkrieg API |
| `fdk binding init` | Scaffold extension section | Templates |
| `fdk binding draft` | Upload draft extension | blitzkrieg API |
| `fdk binding publish` | Publish extension | blitzkrieg API |

---

## Appendix: fdk-cli Internal Architecture

### Authentication Flow Detail

```
Developer runs `fdk login`
        |
        v
fdk-cli opens browser to Partners Panel OAuth URL
        |
        v
Developer logs in via browser
        |
        v
Partners Panel redirects to localhost callback
        |
        v
fdk-cli receives auth code at http://localhost:PORT/callback
        |
        v
fdk-cli exchanges code for access_token + refresh_token
        |
        v
Tokens stored in ~/.fdk/auth.json
        |
        v
Subsequent commands use access_token for API calls
        |
        v
If token expired, fdk-cli auto-refreshes using refresh_token
```

### Dev Server Architecture (`fdk theme serve`)

```
Browser (localhost:5001)
        |
        v
fdk-cli Express Server
   ├── Static files: Serves Webpack-built bundle locally
   ├── Proxy: Forwards page requests to live skyfire domain
   │         with X-FDK-Dev-Mode and X-FDK-Bundle-URL headers
   ├── HMR WebSocket: Webpack HMR for instant module replacement
   └── API Proxy: Forwards Platform API calls with auth tokens

Webpack (watch mode)
   ├── Entry: react-starter/src/index.js
   ├── Loaders: babel-loader (JSX), css-loader, file-loader
   ├── Plugins: HotModuleReplacementPlugin
   ├── Output: theme.umd.js (UMD library format)
   └── DevServer: HMR WebSocket on ws://localhost:5001/ws
```

### Bundle Upload Flow (`fdk theme sync`)

```
Developer runs `fdk theme sync`
        |
        v
fdk-cli reads .fdk/context.json for theme_id
        |
        v
Webpack builds production bundle (minified, tree-shaken)
   Output: dist/theme.umd.js, dist/theme.css
        |
        v
fdk-cli calls blitzkrieg API:
   POST /api/v1/themes/{theme_id}/assets
   Content-Type: multipart/form-data
   Authorization: Bearer {access_token}
   Body: [theme.umd.js, theme.css]
        |
        v
Blitzkrieg stores bundle on CDN
   Returns: { assets: { umd_js: { url: "https://cdn..." }, css: { url: "..." } } }
        |
        v
Blitzkrieg updates theme document with new asset URLs
        |
        v
Blitzkrieg produces Kafka event (THEME_ASSETS_UPDATED)
        |
        v
Skyfire invalidates cache for this theme
        |
        v
Next visitor gets the new bundle
```

### Error Handling

| Error | Cause | fdk-cli Behavior |
|-------|-------|-----------------|
| Auth token expired | Token TTL exceeded | Auto-refresh using refresh_token |
| Refresh token expired | Long inactivity | Prompt `fdk login` again |
| Context not set | Missing `.fdk/context.json` | Error: "Run `fdk theme context` first" |
| Build failure | Webpack compilation error | Display error in terminal, HMR shows overlay |
| Proxy timeout | Skyfire unreachable | Show connection error in browser |
| Upload failure | Blitzkrieg API error | Retry with exponential backoff (3 attempts) |
| Theme not found | Deleted theme in blitzkrieg | Error: "Theme {id} not found. Run `fdk theme context`" |

### Environment Variables

```bash
# Optional environment overrides
FDK_HOST=api.fynd.com         # Platform API host
FDK_PORT=5001                  # Dev server port
FDK_VERBOSE=true               # Enable debug logging
FDK_TUNNEL=true                # Use ngrok tunnel for remote testing
```
