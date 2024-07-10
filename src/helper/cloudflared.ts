import { tmpdir } from 'node:os';
import path from 'pathe';
import fs from 'node:fs';
import path$1 from 'node:path';
import https from 'node:https';
import { execSync, spawn } from 'node:child_process';
import Debug from '../lib/Debug';

const CLOUDFLARED_VERSION = process.env.CLOUDFLARED_VERSION || "2023.10.0";
const RELEASE_BASE = "https://github.com/cloudflare/cloudflared/releases/";
const cloudflaredBinPath = path.join(
  tmpdir(),
  "fdk-cli",
  process.platform === "win32" ? `cloudflared.${CLOUDFLARED_VERSION}.exe` : `cloudflared.${CLOUDFLARED_VERSION}`
);
const cloudflaredNotice = `
\u{1F525} Your installation of cloudflared software constitutes a symbol of your signature
   indicating that you accept the terms of the Cloudflare License, Terms and Privacy Policy.

\u276F License:         \`https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/license/\`
\u276F Terms:           \`https://www.cloudflare.com/terms/\`
\u276F Privacy Policy:  \`https://www.cloudflare.com/privacypolicy/\`
`;

const connRegex = /connection[ =]([\da-z-]+)/i;
const ipRegex = /ip=([\d.]+)/;
const locationRegex = /location=([A-Z]+)/;
const indexRegex = /connIndex=(\d)/;

const LINUX_URL: { [key: string]: string } = {
  arm64: "cloudflared-linux-arm64",
  arm: "cloudflared-linux-arm",
  x64: "cloudflared-linux-amd64",
  ia32: "cloudflared-linux-386"
};

const MACOS_URL: { [key: string]: string } = {
  arm64: "cloudflared-darwin-amd64.tgz",
  x64: "cloudflared-darwin-amd64.tgz"
};

const WINDOWS_URL: { [key: string]: string } = {
  x64: "cloudflared-windows-amd64.exe",
  ia32: "cloudflared-windows-386.exe"
};

function resolveBase(version: string): string {
  if (version === "latest") {
    return `${RELEASE_BASE}latest/download/`;
  }
  return `${RELEASE_BASE}download/${version}/`;
}

async function installCloudflared(to: string = cloudflaredBinPath, version: string = CLOUDFLARED_VERSION): Promise<string> {
  switch (process.platform) {
    case "linux": {
      return await installLinux(to, version);
    }
    case "darwin": {
      return await installMacos(to, version);
    }
    case "win32": {
      return await installWindows(to, version);
    }
    default: {
      throw new Error("Unsupported platform: " + process.platform);
    }
  }
}

async function installLinux(to: string, version: string = CLOUDFLARED_VERSION): Promise<string> {
  const file = LINUX_URL[process.arch];
  if (file === void 0) {
    throw new Error("Unsupported architecture: " + process.arch);
  }
  await download(resolveBase(version) + file, to);
  fs.chmodSync(to, "755");
  return to;
}

async function installMacos(to: string, version: string = CLOUDFLARED_VERSION): Promise<string> {
  const file = MACOS_URL[process.arch];
  if (file === void 0) {
    throw new Error("Unsupported architecture: " + process.arch);
  }
  await download(resolveBase(version) + file, `${to}.tgz`);
  Debug(`Extracting to ${to}`);
  execSync(`tar -xzf ${path$1.basename(`${to}.tgz`)}`, { cwd: path$1.dirname(to) });
  fs.unlinkSync(`${to}.tgz`);
  fs.renameSync(`${path$1.dirname(to)}/cloudflared`, to);
  return to;
}

async function installWindows(to: string, version: string = CLOUDFLARED_VERSION): Promise<string> {
  const file = WINDOWS_URL[process.arch];
  if (file === void 0) {
    throw new Error("Unsupported architecture: " + process.arch);
  }
  await download(resolveBase(version) + file, to);
  return to;
}

function download(url: string, to: string, redirect: number = 0): Promise<string> {
  if (redirect === 0) {
    Debug(`Downloading ${url} to ${to}`);
  } else {
    Debug(`Redirecting to ${url}`);
  }
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path$1.dirname(to))) {
      fs.mkdirSync(path$1.dirname(to), { recursive: true });
    }
    let done = true;
    const file = fs.createWriteStream(to);
    const request = https.get(url, (res) => {
      if (res.statusCode === 302 && res.headers.location !== void 0) {
        const redirection = res.headers.location;
        done = false;
        file.close(() => resolve(download(redirection, to, redirect + 1)));
        return;
      }
      res.pipe(file);
    });
    file.on("finish", () => {
      if (done) {
        file.close(() => resolve(to));
      }
    });
    request.on("error", (err) => {
      fs.unlink(to, () => reject(err));
    });
    file.on("error", (err) => {
      fs.unlink(to, () => reject(err));
    });
    request.end();
  });
}

function startCloudflaredTunnel(options: { [key: string]: string | number | null } = {}): { url: Promise<string>, connections: Promise<{ id: string, ip: string, location: string }>[], child: any, stop: () => void } {
  const args = ["tunnel"];
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === "string") {
      args.push(`${key}`, value);
    } else if (typeof value === "number") {
      args.push(`${key}`, value.toString());
    } else if (value === null) {
      args.push(`${key}`);
    }
  }
  if (args.length === 1) {
    args.push("--url", "localhost:8080");
  }
  const child = spawn(cloudflaredBinPath, args, {
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (process.env.DEBUG === 'fdk') {
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  }
  const urlRegex = /\|\s+(https?:\/\/\S+)/;
  let urlResolver: (value: string | PromiseLike<string>) => void = () => void 0;
  let urlRejector: (reason?: any) => void = () => void 0;
  const url = new Promise<string>(
    (...pair) => [urlResolver, urlRejector] = pair
  );
  const connectionResolvers: Array<(value: { id: string, ip: string, location: string } | PromiseLike<{ id: string, ip: string, location: string }>) => void> = [];
  const connectionRejectors: Array<(reason?: any) => void> = [];
  const connections: Promise<{ id: string, ip: string, location: string }>[] = [];
  for (let i = 0; i < 1; i++) {
    connections.push(
      new Promise<{ id: string, ip: string, location: string }>(
        (...pair) => [connectionResolvers[i], connectionRejectors[i]] = pair
      )
    );
  }
  const parser = (data: any) => {
    const str = data.toString();
    const urlMatch = str.match(urlRegex);
    urlMatch && urlResolver(urlMatch[1]);
    const connMatch = str.match(connRegex);
    const ipMatch = str.match(ipRegex);
    const locationMatch = str.match(locationRegex);
    const indexMatch = str.match(indexRegex);
    if (connMatch && ipMatch && locationMatch && indexMatch) {
      const [, id] = connMatch;
      const [, ip] = ipMatch;
      const [, location] = locationMatch;
      const [, idx] = indexMatch;
      connectionResolvers[+idx]?.({ id, ip, location });
    }
  };
  child.stdout.on("data", parser).on("error", urlRejector);
  child.stderr.on("data", parser).on("error", urlRejector);
  const stop = () => child.kill("SIGINT");
  return { url, connections, child, stop };
}

export { cloudflaredBinPath, cloudflaredNotice, installCloudflared, startCloudflaredTunnel };