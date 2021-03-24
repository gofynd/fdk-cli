const { exec } = require('child_process');
const path = require('path');

function build({ buildFolder, imageCdnUrl }) {
    return new Promise((resolve, reject) => {
        let env_variables = 'PATH='+process.env.PATH + ' NODE_ENV=production';
        let b = exec(`${env_variables} node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest ${buildFolder} --name themeBundle theme/index.js`,
            {
                cwd: process.cwd(),
                env: {
                    IMAGE_CDN_URL: imageCdnUrl
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

function devBuild({ buildFolder, imageCdnUrl }) {
    let env_variables = 'PATH='+process.env.PATH + ' NODE_ENV=development';
    return new Promise((resolve, reject) => {
        let b = exec(`${env_variables} node ./node_modules/@vue/cli/bin/vue.js build --target lib --dest ${buildFolder} --name themeBundle theme/index.js`,
            {
                cwd: process.cwd(),
                env: {
                    IMAGE_CDN_URL: imageCdnUrl
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