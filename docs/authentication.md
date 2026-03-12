# Authentication

This document covers the OAuth authentication flow used by fdk-cli, including how tokens are obtained, stored, refreshed, and used in API calls.

---

## Overview

fdk-cli authenticates users through the Fynd Partners Panel using a browser-based OAuth flow. There is no username/password prompt in the terminal. The flow involves:

1. A temporary local Express server started by the CLI.
2. A browser redirect to the Partners Panel.
3. A callback POST from the Partners Panel to the local server with the OAuth token.

The relevant source file is `src/lib/Auth.ts`.

---

## OAuth Flow in Detail

### Step 1: Start Local Express Server

When you run `fdk login`, the CLI finds a random free port and starts an Express server:

```typescript
// src/lib/Auth.ts
public static async login(options) {
    const port = await getRandomFreePort([]);
    // ...
    await startServer(port);
}
```

The Express server has a single endpoint:

```typescript
app.post('/token', async (req, res) => {
    // Receives the OAuth token from Partners Panel
    const expiryTimestamp = Math.floor(Date.now() / 1000) + req.body.auth_token.expires_in;
    req.body.auth_token.expiry_time = expiryTimestamp;
    ConfigStore.set(CONFIG_KEYS.AUTH_TOKEN, req.body.auth_token);
    ConfigStore.set(CONFIG_KEYS.ORGANIZATION, req.body.organization);
    // ...
});
```

The server uses CORS middleware to accept cross-origin requests from the Partners Panel.

### Step 2: Open Partners Panel in Browser

The CLI constructs an authentication URL and opens it in the default browser:

```typescript
const partnerDomain = env.replace('api', 'partners');
const domain = `https://${partnerDomain}`;
const callbackUrl = `${getLocalBaseUrl()}:${port}`;
const queryParams = new URLSearchParams({ 'fdk-cli': 'true', callback: callbackUrl });
if (region) queryParams.set('region', region);
const authUrl = `${domain}/organizations/?${queryParams.toString()}`;
await open(authUrl);
```

For the default environment, this opens:

```
https://partners.fynd.com/organizations/?fdk-cli=true&callback=http://127.0.0.1:<port>
```

If the browser cannot be opened (e.g., in a headless environment), the URL is printed to the terminal so you can copy and paste it.

### Step 3: User Authenticates and Selects Organization

On the Partners Panel, the user:

1. Logs in with their Fynd account credentials.
2. Selects an organization to work with.
3. The Partners Panel generates an OAuth access token.

### Step 4: Token Callback

The Partners Panel sends a POST request to `http://127.0.0.1:<port>/token` with a JSON body containing:

```json
{
    "auth_token": {
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "expires_in": 86400,
        "current_user": {
            "first_name": "John",
            "last_name": "Doe",
            "emails": [
                { "email": "john@example.com", "active": true, "primary": true }
            ],
            "_id": "user_id_123"
        }
    },
    "organization": "org_id_456"
}
```

The CLI calculates the absolute expiry time and stores the token:

```typescript
const expiryTimestamp = Math.floor(Date.now() / 1000) + req.body.auth_token.expires_in;
req.body.auth_token.expiry_time = expiryTimestamp;
```

### Step 5: Fetch Organization Details

After storing the token, the CLI fetches additional organization metadata:

```typescript
const organization_detail = await OrganizationService.getOrganizationDetails();
ConfigStore.set(CONFIG_KEYS.ORGANIZATION_DETAIL, organization_detail.data);
```

### Step 6: Server Shutdown

The local server shuts down after receiving the token:

```typescript
Auth.stopSever();
```

### Server Timeout

If no token is received within 2 minutes (120,000 ms), the server times out:

```typescript
const SERVER_TIMER = 1000 * 60 * 2; // 2 min

function startTimer() {
    Auth.timer_id = setTimeout(() => {
        Auth.stopSever(() => {
            console.log(chalk.red(`Timeout: Please run ${chalk.blue('fdk login')} command again.`));
        })
    }, SERVER_TIMER);
}
```

### Concurrent Request Protection

The `/token` endpoint has a loading guard to prevent multiple simultaneous token exchanges:

```typescript
if (isLoading) {
    return res.status(429).json({ message: 'Another request is in progress. Please try again later.' });
}
isLoading = true;
```

---

## Token Storage Location and Format

Tokens are stored using the `configstore` npm package. The configuration file is located at:

```
~/.config/configstore/@gofynd/fdk-cli.json
```

The storage key structure is defined in `src/lib/Config.ts`:

```typescript
export const CONFIG_KEYS = {
    CURRENT_ENV: 'current_env',
    CURRENT_ENV_VALUE: 'current_env.value',
    AUTH_TOKEN: 'current_env.auth_token',
    ORGANIZATION: 'current_env.organization',
    ORGANIZATION_DETAIL: 'current_env.organization_detail',
    COOKIE: 'current_env.cookie',
    // ...
};
```

A stored config file looks like:

```json
{
    "current_env": {
        "value": "api.fynd.com",
        "auth_token": {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "expires_in": 86400,
            "expiry_time": 1700000000,
            "current_user": {
                "first_name": "John",
                "last_name": "Doe",
                "_id": "user_id_123",
                "emails": [
                    { "email": "john@example.com", "active": true, "primary": true }
                ]
            }
        },
        "organization": "org_id_456",
        "organization_detail": { "name": "My Organization" }
    },
    "api_version": "1.0"
}
```

---

## Token Expiration and Refresh

### Expiry Check

Before executing theme commands, the CLI checks whether the token has expired:

```typescript
async function checkTokenExpired(auth_token) {
    const { expiry_time } = auth_token;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > expiry_time) {
        return true;
    } else {
        return false;
    }
}
```

This check runs in `src/fdk.ts` for every theme command:

```typescript
if (ALL_THEME_COMMANDS.findIndex((c) => themeCommand.includes(c)) !== -1 ||
    THEME_COMMANDS.findIndex((c) => themeCommand.includes(c)) !== -1) {
    const isTokenExpired = await checkTokenExpired(
        configStore.get(CONFIG_KEYS.AUTH_TOKEN),
    );
    if (isTokenExpired)
        throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth);
}
```

### No Automatic Refresh

fdk-cli does **not** automatically refresh expired tokens. When a token expires, the user must run `fdk login` again. If an API call returns 401 or 403, the token is automatically cleared from the config:

```typescript
// src/lib/api/helper/interceptors.ts
if (error.response &&
    (error.response.status === 401 || error.response.status === 403)) {
    ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth, error.response.status);
}
```

---

## Session Management

### Re-Login Behavior

If you run `fdk login` while already logged in, the CLI prompts you:

```
You are already logged In. Do you wish to change the organization?
> Yes
  No
```

If you choose **Yes**:

1. The existing auth token is cleared.
2. The extension context (`extension.context.json`) is cleared.
3. A new local server starts for the OAuth flow.

```typescript
if (Auth.wantToChangeOrganization) {
    ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
    clearExtensionContext();
}
```

### Environment Switching

When logging in to a different host (e.g., switching from `api.fynd.com` to `api.fyndx1.de`), the CLI:

1. Detects that the environment has changed.
2. Clears the existing token and config for the old environment.
3. After the token callback, sets the new environment.

```typescript
if (current_env !== env) {
    Auth.newDomainToUpdate = env;
    Auth.updateConfigStoreForLogout();
}
```

The logout process preserves the `current_env.value` and `extras` settings (like SSL config):

```typescript
private static updateConfigStoreForLogout() {
    const currentEnv = ConfigStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    const extras = ConfigStore.get(CONFIG_KEYS.EXTRAS);
    ConfigStore.clear();
    ConfigStore.set(CONFIG_KEYS.CURRENT_ENV_VALUE, currentEnv);
    ConfigStore.set(CONFIG_KEYS.EXTRAS, extras);
}
```

---

## How Auth Token Is Used in API Calls

All API requests to the Fynd platform go through Axios interceptors defined in `src/lib/api/helper/interceptors.ts`.

### Bearer Authorization

For requests to `/service/partner` endpoints, the access token is added as a Bearer token:

```typescript
if (pathname.startsWith('/service/partner')) {
    const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
    if (auth_token && auth_token.access_token) {
        config.headers['Authorization'] = 'Bearer ' + auth_token.access_token;
    }
}
```

### Request Signing

All requests to `/service` and `/ext` paths are signed using `@gofynd/fp-signature`:

```typescript
const signingOptions = {
    method: method && method.toUpperCase(),
    host: host,
    path: pathname + search + queryParam,
    body: transformedData,
    headers: headersToSign,
};
const signature = sign(signingOptions);
config.headers['x-fp-date'] = signature['x-fp-date'];
config.headers['x-fp-signature'] = signature['x-fp-signature'];
```

### Cookie Handling

If a cookie is stored in the config, it is attached to every request:

```typescript
const cookie = ConfigStore.get(CONFIG_KEYS.COOKIE);
config.headers['Cookie'] = cookie || '';
```

---

## Logout Behavior

Running `fdk logout` prompts for confirmation:

```
Are you sure you want to logout
> Yes
  No
```

If confirmed, the CLI clears all stored state **except** the current environment and SSL extras:

```typescript
public static async logout() {
    await inquirer.prompt(questions).then((answers) => {
        if (answers.confirmLogout === 'Yes') {
            Auth.updateConfigStoreForLogout();
            Logger.info(`User logged out successfully`);
        }
    });
}
```

After logout:
- The `auth_token` is removed.
- The `organization` and `organization_detail` are removed.
- The `current_env.value` is preserved (so you don't need to re-set the environment).
- The `extras` key is preserved (CA file, strict SSL settings).

---

## Viewing Current User Info

The `fdk user` command reads from the stored auth token:

```typescript
public static getUserInfo() {
    const { current_user: user } = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
    const activeEmail =
        user.emails.find((e) => e.active && e.primary)?.email ||
        'Primary email missing';
    const text = `Name: ${user.first_name} ${user.last_name}\nEmail: ${activeEmail}\nOrganization: ${getOrganizationDisplayName()}`;
    Logger.info(successBox({ text }));
}
```

This command will fail with an error if you are not logged in.

---

## Command-Level Auth Requirements

The `asyncAction` wrapper in `src/fdk.ts` enforces authentication requirements based on command type:

| Command Category | Requires Auth Token? | Requires Valid (Non-Expired) Token? |
|-----------------|---------------------|--------------------------------------|
| `env` commands | No | No |
| `auth`, `login`, `logout` | No | No |
| Extension `init`, `get`, `set`, `pull-env` | No | No |
| Theme commands (`pull`, `serve`, `sync`, etc.) | Yes | Yes |
| All other commands | Yes | No |

Additionally, theme commands verify that the active context's environment matches the current CLI environment to prevent cross-environment operations:

```typescript
if (parent.args.includes('theme') && THEME_COMMANDS.findIndex((c) => themeCommand.includes(c)) !== -1) {
    const activeContextEnv = getActiveContext().env;
    if (activeContextEnv !== Env.getEnvValue() && !Env.getEnvValue().includes(activeContextEnv)) {
        throw new CommandError(COMMON_LOG_MESSAGES.contextMismatch);
    }
}
```

---

## Security Considerations

- OAuth tokens are stored in plaintext JSON at `~/.config/configstore/@gofynd/fdk-cli.json`. Ensure this file is not readable by other users on shared systems.
- The local Express server for the OAuth callback only listens on `127.0.0.1`, not on all interfaces, limiting exposure.
- The server auto-shuts down after token receipt or after a 2-minute timeout.
- On 401/403 API responses, the token is automatically purged to prevent stale credential usage.
