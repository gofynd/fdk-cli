import { tunnel as startTunnel, bin, install } from 'cloudflared';
import Spinner from '../helper/spinner';
import CommandError, { ErrorCodes } from './CommandError';
import Debug from './Debug';
import Logger from './Logger';
import { OutputFormatter, successBox } from '../helper/formatter';
import type { ChildProcess } from 'node:child_process';
import fs from 'fs-extra';

export default class Tunnel {
    options: {
        port: string | number;
    };
    publicTunnelURL: string;
    tunnelProcess: ChildProcess;
    stopTunnel: (signal?: NodeJS.Signals | number) => boolean;

    constructor(options: typeof this.options){
        this.options = options;
    }

    public static async tunnelHandler(options){
        const tunnel = new Tunnel(options);

        await tunnel.startTunnel();

        Logger.info(
            successBox({
                text: `TUNNEL URL: ${OutputFormatter.link(tunnel.publicTunnelURL)}`
            })
        )
    }

    async startTunnel(){
        let spinner = new Spinner(`Starting Cloudflare tunnel on port ${this.options.port}`);
        try {
            spinner.start();
            const { url, child: tunnelProcess, stop } = await this.startCloudflareTunnel();
            this.publicTunnelURL = url;
            this.tunnelProcess = tunnelProcess;
            this.stopTunnel = stop;
            spinner.succeed();
            return this.publicTunnelURL;
        } catch (error) {
            Debug(error);
            spinner.fail();
            throw new CommandError(
                ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.message,
                ErrorCodes.ClOUDFLARE_CONNECTION_ISSUE.code,
            );
        }
    }

    async startCloudflareTunnel() {
        Debug(`Starting tunnel on port ${this.options.port}`);
        // INSTALL CURRENT LATEST VERSION
        process.env.CLOUDFLARED_VERSION = '2024.6.1';
        // THIS WILL STOP CLOUDFLARED TO AUTO UPDATE
        process.env.NO_AUTOUPDATE = 'true';
        // ALWAYS USE HTTP2 PROTOCOL
        process.env.TUNNEL_TRANSPORT_PROTOCOL = 'http2';

        if (!fs.existsSync(bin)) {
            Debug(`Cloudflare tunnel binary is not found in bin dir: ${bin}\nDownloading cloudflare...`);
            try{
                await install(bin);
            }
            catch(error){
                Logger.error(`Failed to download cloudflare package to start tunnel: ${error}`)
            }
        }

        const { url: urlPromise, connections, child, stop } = startTunnel({
            '--url': `http://localhost:${this.options.port}`,
        });

        const cleanup = async () => {
            stop();
        };

        for (const signal of ['SIGINT', 'SIGUSR1', 'SIGUSR2'] as const) {
            process.once(signal, cleanup);
        }

        child.stdout.on('data', this.cloudflareTunnelLogParser);
        child.stderr.on('data', this.cloudflareTunnelLogParser);

        if (process.env.DEBUG) {
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }

        const url = await urlPromise;

        return {url, child, stop};
    }

    isCloudflareTunnelShutdown = false;
    cloudflareTunnelLogParser(data) {
        const str = data.toString();
        const connected_regex = /Registered tunnel connection/;
        const disconnect_regex = /Unregistered tunnel connection/;
        const retry_connection_regex = /Retrying connection in up to/;
        const shutdown_regex =
            /Initiating graceful shutdown due to signal interrupt/;

        if (this.isCloudflareTunnelShutdown) {
            return;
        }

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
}