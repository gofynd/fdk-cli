# Extension and Binding Commands

Extensions add functionality to the Fynd Commerce platform. Bindings allow extensions to inject UI sections into themes. This document covers all extension and binding commands.

---

## Extension Commands

All extension commands are invoked under `fdk extension <subcommand>` (alias: `fdk ext`).

### fdk extension init

Scaffolds a new extension project or sets up a boilerplate for an existing extension.

```bash
fdk extension init                                  # Interactive prompts
fdk extension init --template node-react            # Skip template selection
fdk extension init --target-dir ./my-extension      # Custom output directory
```

**Aliases:** `fdk ext i`

#### Interactive Flow

1. **Create or select** -- If you already have extensions in your organization, you are asked whether to create a new one or select an existing extension.
2. **Extension name** -- Enter a name for the new extension (skipped if selecting existing).
3. **Extension type** -- Choose `Private` or `Public` (skipped if selecting existing).
4. **Launch type** -- Choose `Company`, `Application`, or `Payment`.
5. **Payment mode slug** -- If launch type is `Payment`, enter the payment mode slug.
6. **Template** -- Select a project template (filtered by launch type).
7. **Scaffold** -- Clones the template repository, installs dependencies, and optionally registers the extension on the platform.

#### Available Templates

| Template Key | Name | Launch Types | Repository |
|-------------|------|-------------|------------|
| `node-vue` | Node + Vue 3 + SQLite | Company, Application | [example-extension-javascript](https://github.com/gofynd/example-extension-javascript) |
| `node-react` | Node + React.js + SQLite | Company, Application | [example-extension-javascript-react](https://github.com/gofynd/example-extension-javascript-react) |
| `payment-node-react` | Node + React.js + SQLite (Payment) | Payment | [payment-extension-boilerplate](https://github.com/gofynd/payment-extension-boilerplate) |

#### What Gets Created

```
my-extension/
  extension.context.json       # Extension API key, secret, launch type
  fdk.ext.config.json          # (or .yml) -- Roles, dev/install commands, port
  frontend/                    # Frontend code (React or Vue)
    fdk.ext.config.json        # Frontend-specific config
  package.json                 # Root package
  README.md
```

The `extension.context.json` file:
```json
{
    "EXTENSION_API_KEY": "<generated-api-key>",
    "EXTENSION_API_SECRET": "<generated-secret>",
    "LAUNCH_TYPE": "company"
}
```

#### Registration

When creating a new extension, the CLI registers it on the platform with:
- A temporary `base_url` of `http://localdev.fynd.com`
- Callback URLs for setup, install, auth, uninstall, and auto_install
- The developer's name and email from the logged-in user
- Payment mode slug config if applicable

---

### fdk extension preview-url

Starts the extension's dev servers and creates a Cloudflare tunnel for remote access. This is the primary command for local extension development.

```bash
fdk extension preview-url                           # Interactive
fdk extension preview                               # Alias
fdk ext p                                           # Short alias
fdk extension preview --api-key <key>               # Skip extension selection
fdk extension preview --company-id <id>             # Skip company selection
fdk extension preview --port 8080                   # Custom frontend port
fdk extension preview --tunnel-url https://...      # Use existing tunnel
fdk extension preview --custom-tunnel               # Prompt for custom tunnel URL
fdk extension preview --no-auto-update              # Don't update launch URL
fdk extension preview --reset                       # Clear extension context
```

#### How It Works

1. **Read config files** -- Reads `fdk.ext.config.json` (or `.yml`) files from the project. These define frontend and backend roles, dev commands, install commands, and ports.
2. **Resolve extension** -- Uses `extension.context.json` or prompts you to select an extension from your organization.
3. **Select development company** -- Picks a development company to run the extension against.
4. **Install dependencies** -- Runs the `install` command from each config file.
5. **Start Cloudflare tunnel** -- Creates a tunnel on the frontend port (unless `--tunnel-url` or `--custom-tunnel` is provided).
6. **Update launch URL** -- Automatically updates the extension's launch URL on the Partners Panel to the tunnel URL (unless `--no-auto-update`).
7. **Start dev servers** -- Runs the `dev` command from each config file with environment variables injected.
8. **Display preview URL** -- Once all ports are running, displays the extension preview URL.

#### Environment Variables Injected to Dev Servers

| Variable | Description |
|----------|-------------|
| `FRONTEND_PORT` | Port for the frontend server |
| `BACKEND_PORT` | Port for the backend server |
| `EXTENSION_API_KEY` | Extension API key |
| `EXTENSION_API_SECRET` | Extension API secret |
| `EXTENSION_BASE_URL` | Cloudflare tunnel URL |
| `FP_API_DOMAIN` | Fynd Platform API domain (e.g., `https://api.fynd.com`) |

#### fdk.ext.config.json Format

```json
{
    "roles": ["frontend"],
    "dev": "npm run dev",
    "install": "npm install",
    "port": 8080
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roles` | string[] | Yes | Must include `frontend` and/or `backend` |
| `dev` | string | Yes | Command to start the dev server |
| `install` | string | No | Command to install dependencies |
| `port` | number | No | Port the server listens on |

Both `frontend` and `backend` roles must be defined across all config files (can be in separate files or one file with both roles).

#### Preview URL Format

- **Company extensions**: `https://platform.fynd.com/company/<id>/extensions/<api-key>`
- **Payment extensions**: `https://platform.fynd.com/company/<id>/application/<app-id>/extensions/<api-key>`

---

### fdk extension launch-url

Manage the extension's launch URL on the Partners Panel.

#### Get Launch URL

```bash
fdk extension launch-url get                    # Interactive extension selection
fdk ext lu g                                    # Short form
fdk extension launch-url get --api-key <key>    # Specify extension
```

Fetches and displays the current launch URL for the extension.

#### Set Launch URL

```bash
fdk extension launch-url set                                    # Interactive
fdk ext lu s                                                    # Short form
fdk extension launch-url set --api-key <key> --url https://...  # Non-interactive
```

Updates the extension's `base_url` on the platform. This is the URL that the platform uses to reach the extension.

---

### fdk extension pull-env

Fetches the extension's environment variables (API key, secret, base URL) from the Partners Panel and saves them to `extension.context.json`.

```bash
fdk extension pull-env
fdk ext pe
```

#### What It Does

1. Prompts you to select an extension from your organization
2. Fetches the extension details from the Partners Panel API
3. Validates launch type compatibility (e.g., a payment boilerplate cannot be used with a non-payment extension)
4. Writes to `extension.context.json`:
   - `EXTENSION_API_KEY`
   - `EXTENSION_API_SECRET`
   - `EXTENSION_BASE_URL`
   - `LAUNCH_TYPE`

---

## Binding Commands

Bindings let extensions inject UI sections into storefront themes. All binding commands are under `fdk binding <subcommand>`.

### fdk binding init

Creates a new extension binding (section) boilerplate.

```bash
fdk binding init                                    # Interactive prompts
fdk binding init -n "my-section"                    # Specify binding name
fdk binding init -f react                           # Specify framework
fdk binding init -i "Web Theme"                     # Specify interface
```

#### Options

| Flag | Description | Choices |
|------|-------------|---------|
| `-n, --name` | Bundle/binding name | Any string |
| `-f, --framework` | UI framework | `react`, `vue2` |
| `-i, --interface` | Target interface | `Web Theme`, `Platform`, `Store OS` |

#### What It Does

1. Collects context data (extension ID, organization ID, name, framework, interface)
2. For "Web Theme" interface:
   - Creates the binding directory structure (`bindings/theme/react/<name>` or `bindings/theme/vue/<name>`)
   - Copies the template from `extension-section/` (React) or `extension-section-vue/` (Vue2)
   - Installs npm packages in the binding directory

#### Binding Directory Structure

```
my-extension/
  bindings/
    theme/
      react/
        my-section/
          src/
            sections/         # Section components
            index.js          # Entry point
          webpack.config.js   # Optional custom webpack overrides
          package.json
      vue/
        my-section/
          src/
            sections/         # Vue SFC section components
            index.js
          package.json
```

---

### fdk binding draft

Builds and registers a binding as a draft. Drafts are visible only to development companies.

```bash
fdk binding draft                                       # Interactive
fdk binding draft -n "my-section" -f react              # With options
fdk binding draft -id <extensionId> -org <orgId>        # With IDs
```

#### What Happens

1. Collects context data (extension ID, org ID, name, framework, interface)
2. Builds the extension section code:
   - **React**: Uses webpack to produce a UMD bundle + CSS
   - **Vue2**: Uses Vue CLI Service to produce a UMD bundle + CSS
3. Uploads the built JS and CSS files to CDN
4. Extracts section settings/metadata from the built bundle
5. Calls the draft API with the section data, asset URLs, and framework type

---

### fdk binding publish

Builds and publishes a binding to production. Published bindings are available to all themes.

```bash
fdk binding publish                                     # Interactive
fdk binding publish -n "my-section" -f react            # With options
```

Same flow as `draft`, but sets `status: "published"` and calls the publish API endpoint.

---

### fdk binding preview

Starts a local preview server for a binding with a Cloudflare tunnel, allowing you to test the binding in the theme editor.

```bash
fdk binding preview                                     # Interactive
fdk binding preview -n "my-section" -f react            # With options
```

#### What Happens

1. Collects context data including the applied theme (company, application, theme ID)
2. Starts a Cloudflare tunnel on a local port (default 5500)
3. Builds the extension section code
4. Starts a local Express server serving the built assets from `dist/`
5. Starts a file watcher for rebuild-on-change:
   - **React**: Uses webpack watch mode with 1500ms aggregation
   - **Vue2**: Uses chokidar to watch `src/` and re-runs Vue CLI build
6. Generates a preview hash (UUID) and registers it with the platform API
7. Outputs a preview URL for the theme editor:
   ```
   https://platform.fynd.com/company/<id>/application/<id>/themes/<id>/edit?section_preview_hash=<hash>
   ```
8. On SIGINT (Ctrl+C), cleans up the preview session on the platform

#### Applied Theme Selection

The preview command requires an "applied theme" context -- the theme where the binding sections will be rendered. During setup:

1. Select development or live account type
2. Select a company
3. Select a sales channel (application)
4. The CLI fetches the currently applied theme for that application

---

### fdk binding clear-context

Clears the stored extension sections context from the configstore.

```bash
fdk binding clear-context
```

---

### fdk binding show-context

Displays the current extension sections context.

```bash
fdk binding show-context
```

---

## Extension Context Management

### extension.context.json

Located in the extension project root. Stores per-project extension credentials and state.

```json
{
    "EXTENSION_API_KEY": "abc123def456",
    "EXTENSION_API_SECRET": "secret_xyz",
    "EXTENSION_BASE_URL": "https://your-tunnel.trycloudflare.com",
    "DEVELOPMENT_COMPANY": 42,
    "CURRENT_ENV": "api.fynd.com",
    "LAUNCH_TYPE": "company"
}
```

| Key | Description |
|-----|-------------|
| `EXTENSION_API_KEY` | Extension client ID / API key |
| `EXTENSION_API_SECRET` | Extension client secret |
| `EXTENSION_BASE_URL` | Current tunnel URL (set during preview, cleared on exit) |
| `DEVELOPMENT_COMPANY` | Last-used development company ID |
| `CURRENT_ENV` | Fynd API domain when the context was created |
| `LAUNCH_TYPE` | Extension launch type (`company`, `application`, `payment`) |

The CLI reads from this file to avoid re-prompting on subsequent runs. Use `--reset` with `fdk extension preview` to clear and start fresh. If the logged-in environment changes (e.g., switching from `api.fynd.com` to `api.fyndx1.de`), the context is automatically cleared.

### Global Extension Sections Context

Binding commands store context in the global configstore under `extensionSections`:

```json
{
    "extensionId": "ext_abc123",
    "organisationId": "org_xyz",
    "name": "my-section",
    "framework": "react",
    "interface": "Web Theme",
    "appliedTheme": {
        "applicationId": "app_123",
        "companyId": 42,
        "themeId": "theme_456",
        "companyType": "development"
    }
}
```

This persists across runs so you don't have to re-enter context data each time. Use `fdk binding clear-context` to reset it.
