# Getting Started with fdk-cli

This guide walks you through installing fdk-cli, logging in for the first time, and creating your first theme or extension.

---

## Prerequisites

### Node.js Version

fdk-cli requires **Node.js >= 18**. The CLI checks the Node version at startup in `bin/fdk.js`:

```javascript
const major = Number(semver[0]);
const minCompatibleVersion = 18;

if (major < minCompatibleVersion) {
    console.error(
        chalk.red(
            `It looks like you're using an older version of Node.js ${currentNodeVersion}. Please upgrade to version ${minCompatibleVersion}.X.X or higher to use this tool.`,
        ),
    );
    process.exit(1);
}
```

If you are running Node.js < 18, you will see an error and the process will exit immediately.

### npm

npm comes bundled with Node.js. Any recent version of npm (v8+) works.

### Internet Access

fdk-cli communicates with the Fynd Platform APIs (e.g., `api.fynd.com`). Make sure your network allows outbound HTTPS connections to `*.fynd.com`. If you are behind a VPN or corporate proxy, see the [Troubleshooting](./troubleshooting.md) guide for SSL configuration.

---

## Installation

Install fdk-cli globally from npm:

```bash
npm install -g @gofynd/fdk-cli
```

Verify the installation:

```bash
fdk --version
# Output: Current version: 8.0.6
```

The `fdk` binary is registered in `package.json`:

```json
{
  "bin": {
    "fdk": "bin/fdk.js"
  }
}
```

### Updating

The CLI automatically checks for new versions on every invocation. If a newer version is available, you will see a notification box:

```
A new version X.Y.Z is available!
You have version 8.0.6.
Run the following command to upgrade:
`npm install -g @gofynd/fdk-cli`
```

If a **major** version update is available, the CLI will block execution until you upgrade.

To update manually:

```bash
npm install -g @gofynd/fdk-cli@latest
```

---

## First-Time Setup

### Step 1: Login

fdk-cli uses an OAuth flow through the Fynd Partners Panel. There is no username/password prompt -- authentication happens entirely in your browser.

```bash
fdk login
```

What happens:

1. The CLI starts a temporary local Express server on a random free port.
2. Your default browser opens the Partners Panel login page.
3. You log in and select an organization.
4. The Partners Panel sends your OAuth token back to the local server.
5. The token is stored in your global config at `~/.config/configstore/@gofynd/fdk-cli.json`.
6. The local server shuts down automatically.

If the browser does not open automatically, a URL is printed in the terminal. Copy and paste it into your browser.

The local server has a 2-minute timeout. If no token is received within 2 minutes, you will see:

```
Timeout: Please run `fdk login` command again.
```

### Step 2: Verify Login

```bash
fdk user
```

This prints your name, email, and organization:

```
Name: John Doe
Email: john@example.com
Organization: My Organization (org_abc123)
```

### Step 3: Choose Your Environment (Optional)

By default, fdk-cli targets the production environment (`api.fynd.com`). To use a different environment:

```bash
fdk login --host api.fyndx1.de
```

You can also specify a region:

```bash
fdk login --region asia-south1
```

---

## Creating Your First Theme

### Create a New React Theme

```bash
# Create a directory for your theme work
mkdir my-themes && cd my-themes

# Create a new React theme
fdk theme new -n my-first-theme
```

The `new` command:

1. Prompts you to select a company and sales channel (application).
2. Prompts you to select a base theme or create from scratch.
3. Scaffolds the theme directory structure.
4. Sets up the `.fdk/context.json` file with your theme context.

The default theme type is `react`. To create a Vue2 theme:

```bash
fdk theme new -n my-vue-theme -t vue2
```

### Initialize an Existing Theme

If you already have a theme on the platform and want to work on it locally:

```bash
# Navigate to your theme directory (must have a .fdk folder or will prompt to create one)
fdk theme init
```

This prompts you to select the company, application, and theme, then writes the context.

### Start the Dev Server

```bash
fdk theme serve
```

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `--ssr` | `true` | Enable server-side rendering |
| `--hmr` | `true` | Enable hot module replacement (React themes only) |
| `--port` | `5001` | Custom port for the dev server |

The dev server starts at `http://127.0.0.1:5001` (or your custom port) and proxies API calls to the live Fynd platform.

### Pull Remote Theme Changes

```bash
# Pull entire theme (source + config)
fdk theme pull

# Pull only configuration
fdk theme pull-config
```

### Sync Local Changes to Platform

```bash
fdk theme sync
```

This builds your theme and uploads it to the platform.

### Preview the Theme

```bash
fdk theme open
```

Opens the theme preview URL in your browser.

### Package the Theme

```bash
fdk theme package
```

Generates a ZIP file of the theme for distribution.

---

## Creating Your First Extension

### Initialize an Extension

```bash
fdk extension init
```

This prompts you to either:

- **Create a new extension** -- Registers a new extension on the Partners Panel, selects a template, and clones the boilerplate repository.
- **Select an existing extension** -- Connects to an existing extension on the platform.

### Available Templates

| Template | Stack | Launch Types |
|----------|-------|-------------|
| Node + Vue 3 + SQLite | JavaScript, Vue 3 | Company, Application |
| Node + React.js + SQLite | JavaScript, React | Company, Application |
| Node + React.js + SQLite (Payment) | JavaScript, React | Payment |

Templates are cloned from GitHub:

- `https://github.com/gofynd/example-extension-javascript`
- `https://github.com/gofynd/example-extension-javascript-react`
- `https://github.com/gofynd/payment-extension-boilerplate`

### Preview an Extension

```bash
fdk extension preview-url
```

This command:

1. Starts a Cloudflare tunnel to expose your local extension.
2. Updates the extension's launch URL on the Partners Panel.
3. Prints a preview URL you can use to test the extension in a live store.

Options:

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Extension API key |
| `--company-id <id>` | Company ID for testing |
| `--tunnel-url <url>` | Custom tunnel URL (instead of auto-generated) |
| `--port <port>` | Local port to tunnel |
| `--no-auto-update` | Do not auto-update launch URL on Partners Panel |
| `--reset` | Reset extension.context.json and start fresh |
| `--custom-tunnel` | Use a custom tunnel URL |

### Manage Launch URL

```bash
# Get current launch URL
fdk extension launch-url get --api-key <key>

# Set a custom launch URL
fdk extension launch-url set --api-key <key> --url https://my-tunnel.trycloudflare.com
```

### Pull Extension Environment Variables

```bash
fdk extension pull-env
```

Downloads the extension's environment variables from the Partners Panel into your local `extension.context.json`.

---

## Quick Reference: All Commands

### Authentication

| Command | Alias | Description |
|---------|-------|-------------|
| `fdk auth` | `fdk login` | Login via Partners Panel |
| `fdk logout` | -- | Logout current user |
| `fdk user` | -- | Display logged-in user info |

Options for `fdk login`:

- `--host <platform-host>` -- Fynd Platform API domain (default: `api.fynd.com`)
- `--region <region>` -- Authentication region

### Theme Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `fdk theme new -n <name>` | `fdk theme add` | Create a new theme |
| `fdk theme init` | -- | Initialize existing theme |
| `fdk theme serve` | -- | Start local dev server |
| `fdk theme sync` | -- | Sync theme to platform |
| `fdk theme pull` | -- | Pull theme from platform |
| `fdk theme pull-config` | -- | Pull theme configuration only |
| `fdk theme context -n <name>` | -- | Add a theme context |
| `fdk theme context-list` | -- | List and switch contexts |
| `fdk theme active-context` | -- | Show active context |
| `fdk theme open` | -- | Open theme preview in browser |
| `fdk theme package` | -- | Generate theme ZIP file |

Options for `fdk theme new`:

- `-n, --name <name>` -- Theme name (required)
- `-t, --type <type>` -- Theme type: `react` (default) or `vue2`

Options for `fdk theme serve`:

- `--ssr <boolean>` -- Enable SSR (default: true)
- `--hmr <boolean>` -- Enable HMR (default: true)
- `--port <number>` -- Custom port

### Extension Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `fdk extension init` | `fdk ext i` | Initialize extension |
| `fdk extension preview-url` | `fdk ext preview` | Get extension preview URL |
| `fdk extension launch-url get` | `fdk ext lu g` | Get current launch URL |
| `fdk extension launch-url set` | `fdk ext lu s` | Set launch URL |
| `fdk extension pull-env` | `fdk ext pe` | Pull env vars from platform |

### Tunnel

| Command | Description |
|---------|-------------|
| `fdk tunnel --port <port>` | Start a Cloudflare tunnel on specified port |

### Configuration

| Command | Description |
|---------|-------------|
| `fdk config set cafile <path>` | Set custom CA certificate file |
| `fdk config set strict-ssl <true/false>` | Enable/disable strict SSL |
| `fdk config get cafile` | Get current CA file path |
| `fdk config get strict-ssl` | Get strict SSL setting |
| `fdk config delete cafile` | Remove CA file setting |
| `fdk config delete strict-ssl` | Reset strict SSL setting |

### Global Flags

| Flag | Description |
|------|-------------|
| `-V, --version` | Display the current fdk version |
| `-v, --verbose` | Enable verbose/debug logging |
| `-d, --debug` | Enable debug logging (same as --verbose) |

---

## What's Next?

- [Authentication](./authentication.md) -- Deep dive into the OAuth flow
- [Local Dev Server](./local-dev-server.md) -- Understand the Express dev server
- [Build System](./build-system.md) -- Learn about webpack and Vue CLI builds
- [Context Management](./context-management.md) -- Manage multiple themes and extensions
- [Troubleshooting](./troubleshooting.md) -- Fix common issues
