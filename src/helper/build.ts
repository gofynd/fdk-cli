import { exec } from 'child_process'

export function build({ buildFolder, imageCdnUrl, assetCdnUrl, assetHash = '' }) {
    return new Promise((resolve, reject) => {
        let b = exec(`node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest ${buildFolder} --name ${assetHash}_themeBundle theme/index.js`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    ASSET_CDN_URL: assetCdnUrl,
                    ASSET_HASH: assetHash,
                    NODE_ENV: "production"
                }
            });

        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);

        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}
interface DevBuild {
    buildFolder: string,
    imageCdnUrl: string,
    isProd: boolean
}
export function devBuild({ buildFolder, imageCdnUrl, isProd } : DevBuild) {
    return new Promise((resolve, reject) => {
        let b = exec(`node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest ${buildFolder} --name themeBundle theme/index.js`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    NODE_ENV: (isProd && "production") || "development"
                }
            });

        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);

        b.on('exit', function (code) {
            if (!code) {
                return resolve(true);
            }
            reject({ message: 'Build Failed' });
        });
    });
}
