# Troubleshooting

This guide covers common errors, their causes, and solutions when working with fdk-cli.

---

## Debug Mode

### Enabling Debug Output

Use `--debug` or `--verbose` flag with any command:

```bash
fdk theme serve --debug
fdk extension preview-url --verbose
```

Both flags are equivalent. They:

1. Set `process.env.DEBUG = 'fdk'`
2. Create a `debug.log` file in your current directory
3. Output detailed information including curl commands, response bodies, and stack traces

```typescript
// src/fdk.ts
if (parent._optionValues.verbose || parent._optionValues.debug) {
    parent._optionValues.verbose = true;
    parent._optionValues.debug = true;
}

if (parent._optionValues.verbose) {
    process.env.DEBUG = 'fdk';
    const log_file_path = process.cwd() + '/debug.log';
    if (fs.existsSync(log_file_path)) fs.removeSync(log_file_path);
}
```

### Log File Location

When debug mode is enabled, a `debug.log` file is created in your **current working directory** (not in `.fdk/`). This file is overwritten on each run.

The log file uses JSON format with extra fields:

```json
{
    "level": "debug",
    "message": "Response status: 200",
    "OS": "darwin",
    "cli": "v8.0.6",
    "Node": "v20.10.0",
    "Env": "api.fynd.com",
    "Command": "theme serve",
    "timestamp": "2024-01-15 10:30:45"
}
```

### Curl Command Logging

In debug mode, every API request is logged as a reproducible curl command:

```
************** CURL **************
METHOD: GET | PATH: https://api.fynd.com/service/partner/theme/v1.0/organization/org_123/...
curl -X GET 'https://api.fynd.com/...' -H 'Authorization: Bearer ...' -H 'x-fp-signature: ...'
************** END OF CURL **************
```

You can copy these curl commands and run them directly to debug API issues.

---

## Common Errors and Solutions

### FDK-0001: Current directory is not a theme directory

**Cause:** You are running a theme command outside of a theme directory (no `.fdk` folder found).

**Solutions:**
- Navigate to your theme project directory.
- If this is a new project, the CLI will prompt: "This folder doesn't seem to be set up as a theme yet. Want to turn it into one?" -- select Yes.
- Run `fdk theme init` to initialize the directory as a theme project.

### FDK-0002: Context not set

**Cause:** No active theme context exists in `.fdk/context.json`.

**Solutions:**
- Run `fdk theme context -n <name>` to create a context.
- Run `fdk theme context-list` to select an existing context.

### FDK-0003: API server error

**Cause:** The Fynd platform API returned an error response.

**Solutions:**
- Run with `--debug` flag to see the full API response.
- Check if the resource (theme, application, company) still exists on the platform.
- Verify your auth token is not expired: run `fdk user`.

### FDK-0005: Invalid options passed

**Cause:** An invalid host domain or input was provided.

**Solutions:**
- For `fdk login --host`, provide a valid Fynd Platform API domain (e.g., `api.fynd.com`).
- The domain must start with `api.` or `api-`.
- Do not include `https://` -- it will be stripped automatically.

### FDK-0006: Invalid API Key/API Secret passed

**Cause:** The extension API key or secret in `extension.context.json` is incorrect.

**Solutions:**
- Run `fdk extension pull-env` to fetch fresh credentials.
- Check the extension on the Partners Panel to verify the API key.
- Run `fdk extension preview-url --reset` to start fresh.

### FDK-0009: Connection is reset by the client / No company found

**Cause:** Network connection was reset, or the selected company type was not found.

**Solutions for connection reset:**
- Check your network connection.
- If behind a VPN, see the SSL section below.

**Solutions for no company found:**
- For development companies: Create one from the Partners Panel under your organization.
- For live companies: Request access from the Partners Panel.
- The error message includes a link to the relevant documentation.

### FDK-00010: No sales channel found

**Cause:** No application (sales channel) exists under the selected company.

**Solution:** Create a sales channel in the Fynd Platform under the selected company.

### FDK-00011: No themes are created

**Cause:** No themes exist under the selected sales channel.

**Solution:** Create or add a theme under the sales channel on the Partners Panel.

### FDK-0013: VPN/Firewall issue

**Cause:** SSL certificate verification failed due to a VPN, proxy, or firewall that intercepts HTTPS traffic.

**Solutions:**
- See the SSL/Certificate Issues section below.
- The error code `SELF_SIGNED_CERT_IN_CHAIN` triggers this message.

### FDK-0015: Cloudflare tunnel issue

**Cause:** The Cloudflare tunnel failed to start or connect.

**Solutions:**
- Run with `--debug` to see Cloudflare's raw output.
- Check your internet connection.
- If the `cloudflared` binary is corrupted, delete it and let fdk-cli re-download it.
- See the [Tunneling](./tunneling.md) guide for more details.

### FDK-0016: Extension not found

**Cause:** The extension API key does not match any extension in the current organization.

**Solutions:**
- Verify the API key in `extension.context.json`.
- Ensure you are logged into the correct organization.
- Run `fdk extension preview-url --reset` to re-select the extension.

### FDK-0017: fdk.ext.config.json or fdk.ext.config.yml file not found

**Cause:** The extension project is missing its configuration file.

**Solution:** Create `fdk.ext.config.json` or `fdk.ext.config.yml` in your extension project root.

### FDK-0019: Port option required / Invalid extension launch type

**Cause:** When providing a custom tunnel URL, the `--port` option is required.

**Solution:**

```bash
fdk extension preview-url --tunnel-url https://my-tunnel.example.com --port 3000
```

### FDK-0020: Invalid tunnel URL

**Cause:** The provided tunnel URL is not a valid URL.

**Solution:** Provide a full URL including the protocol: `https://my-tunnel.trycloudflare.com`

### FDK-0010: File is too large to upload

**Cause:** The theme bundle or asset exceeds the maximum upload size.

**Solutions:**
- Optimize your theme bundle (reduce dependencies, use code splitting).
- Check if large assets (images, fonts) are accidentally included in the bundle.
- Review your webpack configuration for unnecessary includes.

---

## SSL/Certificate Issues

### Self-Signed Certificate in Chain

**Symptom:** `SELF_SIGNED_CERT_IN_CHAIN` error or `FDK-0013 - This can be caused due to VPN or Firewall`

This commonly happens when a corporate VPN or proxy intercepts HTTPS traffic with its own certificate.

**Solution 1: Provide the CA certificate**

```bash
# Set via environment variable (per-command)
FDK_EXTRA_CA_CERTS=/path/to/corporate-ca.pem fdk theme serve

# Set permanently via config
fdk config set cafile /path/to/corporate-ca.pem
```

The CA file path is validated to exist:

```typescript
if (sharedInlineCert && !fs.existsSync(sharedInlineCert)) {
    throw new CommandError('Provided file path does not exist.');
}
```

**Solution 2: Disable SSL verification (development only)**

```bash
# Set via environment variable (per-command)
FDK_SSL_NO_VERIFY=true fdk theme serve

# Set permanently via config
fdk config set strict-ssl false
```

**Important:** Disabling SSL verification is a security risk. Only use this for development purposes.

**Priority:** Inline environment variables take priority over config settings:

```typescript
// Inline CA takes priority
if (!sharedInlineCert && CA_FILE) {
    process.env.FDK_EXTRA_CA_CERTS = CA_FILE;
}
// Inline SSL takes priority
if (sharedInlineNoSSL == 'true') {
    disableSSL();
}
if (!sharedInlineNoSSL && STRICT_SSL == 'false') {
    disableSSL();
}
```

### How to Get Your Corporate CA Certificate

1. **macOS**: Open Keychain Access, find your corporate root CA, export as .pem.
2. **Linux**: Check `/etc/ssl/certs/` or ask your IT department.
3. **Windows**: Export from Certificate Manager (`certmgr.msc`).

---

## Network/Proxy Issues

### ENOTFOUND

**Symptom:** `ENOTFOUND api.fynd.com` or similar DNS resolution failure.

**Solutions:**
- Check your internet connection.
- Check DNS resolution: `nslookup api.fynd.com`
- If behind a proxy, set `HTTP_PROXY` and `HTTPS_PROXY` environment variables.

### Network Retry Exhaustion

**Symptom:** `Please retry, possibly some network issue!!`

This appears after 5 failed retry attempts (with 2-second delays).

**Solutions:**
- Check your network stability.
- Try again later -- the Fynd platform may be experiencing issues.
- Run with `--debug` to see which endpoint is failing.

### Timeout

**Symptom:** Request hangs for 60 seconds then fails.

The default timeout is 60 seconds per request:

```typescript
axios.defaults.timeout = 60000; // 1 minute
```

**Solutions:**
- Check if you are on a slow network.
- If uploading large files, this may be expected -- wait for retries.
- Check if the Fynd platform is responsive: `curl https://api.fynd.com/service/application/content/_healthz`

---

## Build Failures

### Vue.js Build Failed

**Symptom:** `Vue.js Build Failed` error during `fdk theme sync` or `fdk theme serve` for Vue2 themes.

**Solutions:**
- Check if `@vue/cli-service` is installed: `ls node_modules/@vue/cli-service`
- Run `npm install` to ensure all dependencies are installed.
- Check for syntax errors in your theme code.
- For Node 18+, the CLI automatically adds `--openssl-legacy-provider`. If this causes issues, try Node 18.x specifically.

### React Build Failed

**Symptom:** Webpack build errors during `fdk theme serve` or `fdk theme sync`.

**Solutions:**
- Check the build output for specific error messages.
- Verify your theme's webpack config exports a valid function.
- Ensure all dependencies referenced in your theme code are installed.
- Run with `--debug` to see full webpack error output.

### HMR Not Working

**Symptom:** Changes are not reflected in the browser, or HMR updates fail.

**Solutions:**
- Verify HMR is enabled: `fdk theme serve --hmr true` (default).
- Check the browser console for HMR-related errors.
- Try a full page reload (Ctrl+Shift+R).
- If persistent, restart the dev server.
- Check if `webpack-hot-middleware` is receiving connections.

---

## Auth Problems

### Token Expired

**Symptom:** `Please login to use this command.` or `401` errors.

**Solutions:**
- Run `fdk login` to get a fresh token.
- Check the token expiry in `~/.config/configstore/@gofynd/fdk-cli.json` -- the `expiry_time` field is a Unix timestamp.

### Organization Mismatch

**Symptom:** `Active Environment and Active Context Environment doesn't match.`

**Cause:** Your theme context was created while logged into a different environment than the currently active one.

**Solutions:**
- Switch to the correct context: `fdk theme context-list`
- Or re-login to the correct environment: `fdk login --host <platform-host>`

### Cannot Switch Organizations

**Symptom:** Login succeeds but operations fail because the wrong organization is active.

**Solution:**
- Run `fdk login` and choose "Yes" when prompted to change the organization.
- This clears the existing token and extension context.

---

## Sentry Error Reporting

fdk-cli reports unexpected errors to Sentry for debugging. The following information is included:

- Command that was run
- Current environment
- User name and email (from the auth token)
- Organization details

Errors with status 401 or 403 (auth errors) are **not** reported to Sentry.

```typescript
if (err.code == 403 || err.code == 401) {
    // if user is not authenticated, we won't send sentry
} else {
    Sentry?.captureException?.(err, {
        extra: extraSentryDetails()
    });
}
```

---

## Quick Diagnostic Commands

```bash
# Check fdk-cli version
fdk --version

# Check current user and organization
fdk user

# Check Node.js version (must be >= 18)
node --version

# Check if the platform is reachable
curl https://api.fynd.com/service/application/content/_healthz

# Check SSL config
fdk config get cafile
fdk config get strict-ssl

# Run any command with debug output
fdk theme serve --debug

# Check the debug log after a failure
cat debug.log | head -50

# Check global config store
cat ~/.config/configstore/@gofynd/fdk-cli.json

# Check theme context
cat .fdk/context.json

# Check extension context
cat extension.context.json
```

---

## Getting Help

If none of the above solutions work:

1. Run the failing command with `--debug` and review the `debug.log` file.
2. Copy the curl command from the debug output and test it manually.
3. Check the [fdk-cli GitHub issues](https://github.com/gofynd/fdk-cli/issues) for similar problems.
4. Open a new issue with:
   - fdk-cli version (`fdk --version`)
   - Node.js version (`node --version`)
   - Operating system
   - The full error output
   - The debug.log file (redact any tokens/secrets)
