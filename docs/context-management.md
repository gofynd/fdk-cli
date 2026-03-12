# Context Management

fdk-cli uses context files to track which company, application, and theme (or extension) you are currently working with. This document covers the context system for both themes and extensions.

---

## Theme Context

### Overview

Theme context connects your local theme directory to a specific company, application (sales channel), and theme on the Fynd platform. Without context, theme commands like `serve`, `sync`, and `pull` cannot determine where to send or fetch data.

The context system is implemented in `src/lib/ThemeContext.ts`.

### File Location

Theme context is stored at:

```
<project-root>/.fdk/context.json
```

The path is computed dynamically:

```typescript
const FDK_PATH = () => path.join(process.cwd(), '.fdk');
const CONTEXT_PATH = () => path.join(FDK_PATH(), 'context.json');
```

### File Structure

```json
{
    "theme": {
        "active_context": "my-context",
        "contexts": {
            "my-context": {
                "name": "my-context",
                "application_id": "app_abc123",
                "domain": "my-store.fynd.com",
                "company_id": 42,
                "theme_id": "theme_xyz789",
                "application_token": "token_def456",
                "theme_type": "react"
            },
            "staging-context": {
                "name": "staging-context",
                "application_id": "app_staging",
                "domain": "my-store.fyndx1.de",
                "company_id": 99,
                "theme_id": "theme_staging",
                "application_token": "token_staging",
                "theme_type": "react"
            }
        }
    },
    "partners": {}
}
```

### Default Context Structure

When no context file exists, the initial structure is:

```typescript
export const DEFAULT_CONTEXT = {
    theme: { active_context: '', contexts: {} },
    partners: {},
};
```

---

## Creating a Theme Context

### Via `fdk theme context`

```bash
fdk theme context -n my-context
```

This command:

1. Checks if a `.fdk` directory exists. If not, creates one.
2. Checks if `context.json` exists. If not, creates it with the default structure.
3. Validates that the context name is unique (no duplicates).
4. Prompts you to select a company and store (sales channel).
5. Prompts you to select a theme within that store.
6. Fetches application details and theme metadata from the API.
7. Creates the context entry and sets it as the active context.

```typescript
public static async addThemeContext(options) {
    if (!isAThemeDirectory()) createDirectory(FDK_PATH());
    if (!hasContext()) {
        await fs.writeJSON(CONTEXT_PATH(), DEFAULT_CONTEXT);
    }

    let contextsData = await fs.readJSON(CONTEXT_PATH());
    if (contextsData.theme.contexts[options.name])
        throw new CommandError('Context with the same name already exists');

    let configObj = await Theme.selectCompanyAndStore();
    configObj = await Theme.selectTheme(configObj);

    const { data: appConfig } = await ConfigurationService.getApplicationDetails(configObj);
    const { data: themeData } = await ThemeService.getThemeById(configObj);

    let context = {
        name: options.name,
        application_id: appConfig._id,
        domain: appConfig.domain.name,
        company_id: appConfig.company_id,
        theme_id: themeData._id,
        application_token: appConfig.token,
        theme_type: themeData.theme_type,
    };

    await createContext(context);
}
```

### Via `fdk theme init`

Running `fdk theme init` also creates a context entry. This is used when connecting to an existing theme on the platform without creating a new one.

### Via `fdk theme new`

When creating a new theme with `fdk theme new -n <name>`, a context is automatically created pointing to the newly created theme.

---

## Context Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable context name |
| `application_id` | string | Fynd application (sales channel) ID |
| `domain` | string | Application domain (e.g., `my-store.fynd.com`) |
| `company_id` | number | Fynd company ID |
| `theme_id` | string | Theme ID on the platform |
| `application_token` | string | Application authentication token |
| `theme_type` | string | `react` or `vue2` |

The `domain` field is used by the dev server to proxy requests and by the build system to determine the target platform.

---

## Multi-Context Support

A single theme project can have multiple contexts, each pointing to a different company, application, or theme. This is useful for:

- **Multi-environment development**: One context for staging (`fyndx1.de`), another for production (`fynd.com`).
- **Multi-store themes**: Same theme deployed to different sales channels.
- **A/B testing**: Different theme configurations on different stores.

### Adding Multiple Contexts

```bash
# Add a production context
fdk theme context -n production
# Select company, store, theme...

# Add a staging context
fdk theme context -n staging
# Select a different company/store/theme...
```

### Listing and Switching Contexts

```bash
fdk theme context-list
```

This command:

1. Displays the currently active context name.
2. Shows a list of all available contexts.
3. Prompts you to select one to make active.

```typescript
public static async listThemeContext() {
    if (!hasContext()) {
        Logger.warn('No theme contexts available');
        Logger.info('Add a theme context using fdk theme context -n [context-name]');
        return;
    }

    let contextJSON = await fs.readJSON(contextPath);
    let contextObj = contextJSON.theme;

    Logger.info(`Active context: ${contextObj.active_context}`);

    const questions = [{
        type: 'list',
        name: 'listContext',
        message: 'Available Context. Select one to set active context',
        choices: Object.keys(contextObj.contexts),
    }];

    await inquirer.prompt(questions).then(async (answers) => {
        contextObj.active_context = answers.listContext;
        contextJSON.theme = contextObj;
        await fs.writeJson(contextPath, contextJSON, { spaces: 2 });
    });
}
```

### Viewing the Active Context

```bash
fdk theme active-context
```

Prints the name of the currently active context:

```typescript
public static activeContext() {
    let context = getActiveContext();
    Logger.info(`Active context: ${context.name}`);
}
```

---

## How Context Is Validated

### Theme Directory Check

Before executing theme commands, the CLI checks whether the current directory is a theme directory by looking for the `.fdk` folder:

```typescript
if (parent.args.includes('theme')) {
    if (!isAThemeDirectory()) {
        const answer = await promptForFDKFolder();
        if (!answer) {
            throw new CommandError(
                ErrorCodes.INVALID_THEME_DIRECTORY.message,
                ErrorCodes.INVALID_THEME_DIRECTORY.code,
            );
        }
    }
}
```

If the `.fdk` directory is missing, the CLI prompts:

```
This folder doesn't seem to be set up as a theme yet. Want to turn it into one?
> Yes
  No
```

Selecting "Yes" creates the `.fdk` directory.

### Environment-Context Mismatch

The CLI validates that the active context's environment matches the CLI's current environment:

```typescript
if (parent.args.includes('theme') && THEME_COMMANDS.includes(themeCommand)) {
    const activeContextEnv = getActiveContext().env;
    if (activeContextEnv !== Env.getEnvValue() &&
        !Env.getEnvValue().includes(activeContextEnv)) {
        throw new CommandError(COMMON_LOG_MESSAGES.contextMismatch);
    }
}
```

For example, if your context was created while logged into `api.fynd.com` but you later switched to `api.fyndx1.de`, theme commands will fail with:

```
Active Environment and Active Context Environment doesn't match.
Use `fdk theme context-list` to switch context OR `fdk login --host <platform-host>` to login with different active environment.
```

---

## Extension Context

### Overview

Extension context tracks which extension you are working with, along with its API credentials and development company. Unlike theme context (which supports multiple contexts), extension context is a flat key-value store.

The implementation is in `src/lib/ExtensionContext.ts`.

### File Location

```
<project-root>/extension.context.json
```

This file is in the project root (not in `.fdk/`):

```typescript
const EXTENSION_CONTEXT_FILE_NAME = 'extension.context.json';
this.extensionContextFilePath = path.join(process.cwd(), EXTENSION_CONTEXT_FILE_NAME);
```

### File Structure

```json
{
    "EXTENSION_API_KEY": "abc123def456",
    "EXTENSION_API_SECRET": "secret_xyz",
    "EXTENSION_BASE_URL": "https://my-extension.trycloudflare.com",
    "DEVELOPMENT_COMPANY": 42,
    "CURRENT_ENV": "api.fynd.com",
    "LAUNCH_TYPE": "Company"
}
```

### Context Keys

Defined in `src/helper/constants.ts`:

```typescript
export const EXTENSION_CONTEXT = {
    EXTENSION_API_KEY: 'EXTENSION_API_KEY',
    EXTENSION_API_SECRET: 'EXTENSION_API_SECRET',
    EXTENSION_BASE_URL: 'EXTENSION_BASE_URL',
    DEVELOPMENT_COMPANY: 'DEVELOPMENT_COMPANY',
    CURRENT_ENV: 'CURRENT_ENV',
    LAUNCH_TYPE: 'LAUNCH_TYPE',
};
```

### ExtensionContext Class API

The `ExtensionContext` class provides CRUD operations:

```typescript
class ExtensionContext {
    // Read a single key
    get(key: string): string | number

    // Read all keys
    getAll(): Record<string, string | number>

    // Set a single key
    set(key: string, value: any): void

    // Merge multiple keys
    setAll(extensionContext: Record<string, string | number>): void

    // Replace entire context
    replace(newExtensionContext: Record<string, string | number>): void

    // Delete a single key
    delete(key: string): void

    // Clear all keys
    deleteAll(): void
}
```

### Auto-Creation and Error Recovery

The constructor creates the file if it does not exist and recovers from corrupted JSON:

```typescript
constructor() {
    this.extensionContextFilePath = path.join(process.cwd(), EXTENSION_CONTEXT_FILE_NAME);

    let fileExists = fs.existsSync(this.extensionContextFilePath);
    if (!fileExists) {
        fs.writeFileSync(this.extensionContextFilePath, '{}');
    }

    try {
        this.extensionContext = JSON.parse(
            fs.readFileSync(this.extensionContextFilePath, 'utf-8').toString()
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            Logger.info(`Invalid extension context file found, resetting extension context`);
            this.replace({});
        } else {
            throw error;
        }
    }
}
```

If the JSON is malformed, it is silently reset to an empty object.

### Context Cleared on Organization Change

When a user logs in and switches to a different organization, the extension context is cleared:

```typescript
// src/lib/Auth.ts
function clearExtensionContext() {
    const extensionContext = new ExtensionContext();
    extensionContext.deleteAll();
}
```

This prevents stale extension credentials from being used with a different organization.

---

## Context in CI/CD Pipelines

### Theme Context for CI/CD

To use fdk-cli in CI/CD without interactive prompts, pre-populate the `.fdk/context.json` file:

```json
{
    "theme": {
        "active_context": "ci",
        "contexts": {
            "ci": {
                "name": "ci",
                "application_id": "YOUR_APP_ID",
                "domain": "your-store.fynd.com",
                "company_id": 123,
                "theme_id": "YOUR_THEME_ID",
                "application_token": "YOUR_APP_TOKEN",
                "theme_type": "react"
            }
        }
    },
    "partners": {}
}
```

### Extension Context for CI/CD

Pre-populate `extension.context.json`:

```json
{
    "EXTENSION_API_KEY": "YOUR_API_KEY",
    "EXTENSION_API_SECRET": "YOUR_SECRET",
    "EXTENSION_BASE_URL": "https://your-extension.example.com",
    "DEVELOPMENT_COMPANY": 123,
    "CURRENT_ENV": "api.fynd.com",
    "LAUNCH_TYPE": "Company"
}
```

### Global Config for CI/CD

The global configstore also needs to be populated. Set the config file at `~/.config/configstore/@gofynd/fdk-cli.json`:

```json
{
    "current_env": {
        "value": "api.fynd.com",
        "auth_token": {
            "access_token": "YOUR_ACCESS_TOKEN",
            "expiry_time": 9999999999,
            "current_user": {
                "_id": "user_id",
                "first_name": "CI",
                "last_name": "Bot",
                "emails": [{ "email": "ci@example.com", "active": true, "primary": true }]
            }
        },
        "organization": "YOUR_ORG_ID"
    },
    "api_version": "1.0"
}
```

Set `expiry_time` to a far-future timestamp to avoid token expiry during CI runs. Ensure the access token is valid and has appropriate permissions.

---

## Gitignore Recommendations

The `.fdk/` directory contains both context (should be committed) and build artifacts (should be ignored). A recommended `.gitignore` configuration:

```gitignore
# Build output
.fdk/dist/
.fdk/distServed/
.fdk/temp-theme/
.fdk/archive/
.fdk/cdn_index.js

# Keep context.json committed (or ignore it and use CI/CD setup)
# .fdk/context.json

# Extension context (contains secrets -- do NOT commit)
extension.context.json
```

The `extension.context.json` file contains API keys and secrets and should **never** be committed to version control.
