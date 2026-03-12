# Tunneling

fdk-cli uses Cloudflare tunnels to expose your local development server to the internet. This is primarily used for extension development, where the Fynd platform needs to reach your local extension server.

The implementation is in `src/lib/Tunnel.ts`.

---

## Overview

When developing Fynd extensions, the platform needs to load your extension's frontend from a publicly accessible URL. Since your development server runs on `localhost`, a tunnel creates a public URL (e.g., `https://random-words.trycloudflare.com`) that forwards traffic to your local port.

fdk-cli uses the `cloudflared` npm package, which wraps Cloudflare's `cloudflared` binary for quick tunnels (no Cloudflare account required).

---

## How Tunneling Works

### Starting a Tunnel

You can start a tunnel in two ways:

**Standalone tunnel command:**

```bash
fdk tunnel --port 3000
```

**As part of extension preview:**

```bash
fdk extension preview-url --port 3000
```

Both ultimately use the `Tunnel` class:

```typescript
export default class Tunnel {
    options: {
        port: string | number;
    };
    publicTunnelURL: string;
    tunnelProcess: ChildProcess;
    stopTunnel: (signal?: NodeJS.Signals | number) => boolean;

    async startTunnel() {
        let spinner = new Spinner(`Starting Cloudflare tunnel on port ${this.options.port}`);
        spinner.start();
        const { url, child: tunnelProcess, stop } = await this.startCloudflareTunnel();
        this.publicTunnelURL = url;
        this.tunnelProcess = tunnelProcess;
        this.stopTunnel = stop;
        spinner.succeed();
        return this.publicTunnelURL;
    }
}
```

The output displays the tunnel URL in a success box:

```
TUNNEL URL: https://random-words.trycloudflare.com
```

### Cloudflare Tunnel Internals

The tunnel is started with specific configuration:

```typescript
async startCloudflareTunnel() {
    // Pin to a specific version
    process.env.CLOUDFLARED_VERSION = '2024.6.1';
    // Prevent auto-updates
    process.env.NO_AUTOUPDATE = 'true';
    // Force HTTP/2 protocol
    process.env.TUNNEL_TRANSPORT_PROTOCOL = 'http2';

    if (!fs.existsSync(bin)) {
        await install(bin);
    }

    const { url: urlPromise, connections, child, stop } = startTunnel({
        '--url': `http://localhost:${this.options.port}`,
    });

    const url = await urlPromise;
    return { url, child, stop };
}
```

Key configuration:

| Setting | Value | Purpose |
|---------|-------|---------|
| `CLOUDFLARED_VERSION` | `2024.6.1` | Pin to a tested, stable version |
| `NO_AUTOUPDATE` | `true` | Prevent the binary from auto-updating |
| `TUNNEL_TRANSPORT_PROTOCOL` | `http2` | Use HTTP/2 for better performance |

### Binary Installation

The `cloudflared` binary is downloaded automatically on first use:

```typescript
if (!fs.existsSync(bin)) {
    Debug(`Cloudflare tunnel binary is not found in bin dir: ${bin}\nDownloading cloudflare...`);
    try {
        await install(bin);
    } catch (error) {
        Logger.error(`Failed to download cloudflare package to start tunnel: ${error}`);
    }
}
```

The binary is stored within the `cloudflared` npm package's directory. On subsequent runs, it is reused without re-downloading.

---

## Version Locking

The tunnel binary is locked to version `2024.6.1`:

```typescript
process.env.CLOUDFLARED_VERSION = '2024.6.1';
```

This ensures consistent behavior across all users and prevents issues from untested `cloudflared` updates. The version is set as an environment variable that the `cloudflared` npm package reads during installation.

Auto-updates are also disabled:

```typescript
process.env.NO_AUTOUPDATE = 'true';
```

---

## Signal Handling and Cleanup

The tunnel process is properly cleaned up on exit signals:

```typescript
const cleanup = async () => {
    stop();
};

for (const signal of ['SIGINT', 'SIGUSR1', 'SIGUSR2'] as const) {
    process.once(signal, cleanup);
}
```

This ensures that when you press Ctrl+C or the process receives a termination signal, the Cloudflare tunnel process is stopped and the tunnel is closed.

---

## Tunnel Log Parsing

The tunnel's stdout and stderr output is parsed for status updates:

```typescript
cloudflareTunnelLogParser(data) {
    const str = data.toString();
    const connected_regex = /Registered tunnel connection/;
    const disconnect_regex = /Unregistered tunnel connection/;
    const retry_connection_regex = /Retrying connection in up to/;
    const shutdown_regex = /Initiating graceful shutdown due to signal interrupt/;

    if (this.isCloudflareTunnelShutdown) return;

    if (str.match(connected_regex)) {
        Logger.info('Tunnel connection established');
    } else if (str.match(disconnect_regex)) {
        Logger.error('Tunnel disconnected');
    } else if (str.match(retry_connection_regex)) {
        Logger.warn(`Retrying to connect tunnel...`);
    } else if (str.match(shutdown_regex)) {
        this.isCloudflareTunnelShutdown = true;
    }
}
```

This translates Cloudflare's verbose log output into user-friendly status messages:

| Cloudflare Log | fdk-cli Message |
|----------------|-----------------|
| `Registered tunnel connection` | `Tunnel connection established` |
| `Unregistered tunnel connection` | `Tunnel disconnected` |
| `Retrying connection in up to...` | `Retrying to connect tunnel...` |
| `Initiating graceful shutdown...` | (silent -- stops log parsing) |

### Debug Mode

In debug mode, the raw Cloudflare output is piped to stdout/stderr:

```typescript
if (process.env.DEBUG) {
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}
```

---

## Custom Tunnel URL

When using `fdk extension preview-url`, you can provide your own tunnel URL instead of using the auto-generated Cloudflare tunnel:

```bash
fdk extension preview-url --custom-tunnel --tunnel-url https://my-ngrok-tunnel.ngrok.io --port 3000
```

Options:

| Flag | Description |
|------|-------------|
| `--custom-tunnel` | Signal that you are providing your own tunnel |
| `--tunnel-url <url>` | Your custom tunnel URL |
| `--port <port>` | The local port your extension runs on |

When `--custom-tunnel` is used, the CLI skips starting a Cloudflare tunnel and uses the provided URL directly.

The tunnel URL is validated:

```typescript
// From ErrorCodes in CommandError.ts
INVALID_TUNNEL_URL: {
    message: 'Invalid tunnel url',
    code: 'FDK-0020',
},
MISSING_PORT_OPTION: {
    message: 'The port option is required when tunnel URL is specified.',
    code: 'FDK-0019',
},
```

If you provide `--tunnel-url` without `--port`, you will get an error: `The port option is required when tunnel URL is specified.`

---

## How Tunneling Works for Extension Preview

The extension preview flow integrates tunneling with the Fynd platform:

1. **Start tunnel**: A Cloudflare tunnel is created pointing to your local extension server port.
2. **Get tunnel URL**: The public URL (e.g., `https://random-words.trycloudflare.com`) is obtained.
3. **Update launch URL**: The extension's launch URL on the Partners Panel is updated to the tunnel URL.
4. **Generate preview URL**: A URL is generated that lets you test the extension in a live store.

```typescript
// Simplified flow from src/helper/serve.utils.ts
async function startTunnel(port: number) {
    const tunnelInstance = new Tunnel({ port });
    const tunnelUrl = await tunnelInstance.startTunnel();

    Logger.info(`Started cloudflare tunnel at ${port}: ${tunnelUrl}`);
    return { url: tunnelUrl, port };
}
```

The tunnel URL is also stored in the extension context (`extension.context.json`) as `EXTENSION_BASE_URL` so subsequent commands can reference it.

---

## Troubleshooting Tunnel Issues

### Tunnel Binary Download Failure

**Symptom:** `Failed to download cloudflare package to start tunnel`

**Solutions:**
- Check your internet connection.
- If behind a proxy, ensure `HTTP_PROXY`/`HTTPS_PROXY` environment variables are set.
- Try manually installing: `npm install cloudflared@0.5.3`
- If SSL issues, try: `FDK_SSL_NO_VERIFY=true fdk tunnel --port 3000`

### Tunnel Connection Issues

**Symptom:** `Something wrong with cloudflare tunnel, please pass --debug flag to get more details` (Error code: FDK-0015)

**Solutions:**
- Run with debug flag to see raw Cloudflare logs: `fdk tunnel --port 3000 --debug`
- Check if the specified port has a running service: `curl http://localhost:<port>`
- Check if your network/firewall allows outbound connections to Cloudflare.
- Try a different port.

### Tunnel Disconnections

**Symptom:** `Tunnel disconnected` followed by `Retrying to connect tunnel...`

Cloudflare tunnels may occasionally disconnect. The tunnel automatically retries the connection. If disconnections persist:

- Check your network stability.
- Restart the tunnel: Ctrl+C and re-run the command.
- Use a custom tunnel (e.g., ngrok) if Cloudflare tunnels are unreliable on your network.

### Port Already in Use

**Symptom:** Tunnel starts but the extension does not load.

Ensure the port you specify actually has a service running on it. The tunnel forwards all traffic to `http://localhost:<port>`, so your extension server must be listening there.

```bash
# Verify your extension is running
curl http://localhost:3000

# Then start the tunnel
fdk tunnel --port 3000
```

### Firewall/VPN Issues

Corporate VPNs or firewalls may block Cloudflare tunnel connections. In this case:

1. Use a custom tunnel that works with your network (e.g., ngrok, localtunnel).
2. Set up the custom tunnel manually and use `--custom-tunnel`:

```bash
# Start your own tunnel (e.g., with ngrok)
ngrok http 3000

# Use the ngrok URL with fdk
fdk extension preview-url --custom-tunnel --tunnel-url https://abc123.ngrok.io --port 3000
```

---

## Tunnel Architecture Diagram

```
Browser (on internet)
    |
    v
Cloudflare Edge Network
    |
    v (via cloudflared tunnel)
localhost:<port>
    |
    v
Your Extension Server (Express, etc.)
```

The `cloudflared` binary maintains a persistent connection to Cloudflare's edge network. Incoming requests to the public URL are forwarded through this connection to your local server. All traffic is encrypted end-to-end.
