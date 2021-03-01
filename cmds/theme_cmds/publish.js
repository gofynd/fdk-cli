const { publishThemeV3 } = require('../../apis/theme');
const {
    readFile,
    writeFile,
    createDirectory
} = require('../../utils/file-utlis');
const {
    generateConfigJSON,
    readCookie,
    getActiveContext
} = require('../../utils/utils');
const { downloadFile } = require('../../utils/download');
const { extractArchive } = require('../../utils/archive');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const Listr = require('listr');
const rimraf = require('rimraf');
const { promisify } = require('util');
const ncp = require('ncp');
const copy = promisify(ncp);
const chalk = require('chalk');
const _ = require('lodash');
const command = 'publish';
const desc = 'Publish Theme';

const handler = async args => {
    await pubTheme(args.verbose);
};
const builder = function (yargs) {
    return yargs.options('verbose', {
        describe: 'Enable verbose logging'
    });
};
const publishAppTheme = async verbose => {
    const { appId, token, host, themeId } = getActiveContext();
    const response = await publishThemeV3(appId, token, themeId, host);
};
const pubTheme = async verbose => {
    try {
        const tasks = new Listr([
            {
                title: 'Publish Theme',
                task: async ctx => {
                    await publishAppTheme(verbose);
                }
            }
        ]);
        await tasks.run().then(theme => {
            console.log(chalk.green('Theme published successfully'));
        });
    } catch (error) {
        let msg = _.get(error, 'response.data.message', error.message);
        console.log(chalk.red(msg));
        process.exit(1);
    }
};
module.exports = {
    command,
    desc,
    handler,
    builder
};
