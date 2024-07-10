import Debug from '../lib/Debug';

async function startTunnel(opts) {
    const {
        startCloudflaredTunnel,
    } = await import('./cloudflared');
    const url = opts.url || `${opts.protocol || "http"}://${opts.hostname ?? "localhost"}:${opts.port ?? 3e3}`;
    Debug(`Starting cloudflared tunnel to ${url}`);
    const args = [
        ["--url", url],
        ["--no-autoupdate", true],
        opts.verifyTLS ? void 0 : ["--no-tls-verify", ""]
    ].filter(Boolean);
    const tunnel = await startCloudflaredTunnel(Object.fromEntries(args));
    const cleanup = async () => {
        await tunnel.stop();
    };
    for (const signal of ["SIGINT", "SIGUSR1", "SIGUSR2"]) {
        process.once(signal, cleanup);
    }
    return {
        getURL: async () => await tunnel.url,
        close: async () => {
            await cleanup();
        }
    };
}

export { startTunnel };