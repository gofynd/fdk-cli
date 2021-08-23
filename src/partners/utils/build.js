const { exec } = require('child_process');
const path = require('path');

function build({ buildFolder, imageCdnUrl }) {
    return new Promise((resolve, reject) => {
        let b = exec(`node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest ${buildFolder} --name themeBundle theme/index.js`,
            {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    IMAGE_CDN_URL: imageCdnUrl,
                    NODE_ENV: "production"
                }
            });

        b.stdout.pipe(process.stdout);
        b.stderr.pipe(process.stderr);

        b.on('exit', function (code) {
            if (!code) {
                return resolve();
            }
            reject({ message: 'Build Failed' });
        });
    });
}

function devBuild({ buildFolder, imageCdnUrl, isProd }) {
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
                return resolve();
            }
            reject({ message: 'Build Failed' });
        });
    });
}

module.exports = {
    build,
    devBuild
}