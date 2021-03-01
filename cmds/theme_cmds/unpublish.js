const { unPublishAppThemeV3 } = require('../../apis/theme');
const {
    getActiveContext
} = require('../../utils/utils');
const Listr = require('listr');
const chalk = require('chalk');
const _ = require('lodash');
const command = 'unpublish';
const desc = 'Unpublish Theme';

const handler = async args => {
    await pubTheme(args.verbose);
};
const builder = function (yargs) {
    return yargs.options('verbose', {
        describe: 'Enable verbose logging'
    });
};
const unPublishAppTheme = async verbose => {
    const { appId, token, host, themeId } = getActiveContext();
    const response = await unPublishAppThemeV3(appId, token, themeId, host);
};
const pubTheme = async verbose => {
    try {
        const tasks = new Listr([
            {
                title: 'Unpublishing Theme',
                task: async ctx => {
                    await unPublishAppTheme(verbose);
                }
            }
        ]);
        await tasks.run().then(theme => {
            console.log(chalk.green('Theme unpublished successfully'));
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
