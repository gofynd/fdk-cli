'use strict';
const Listr = require('listr');
const chalk = require('chalk');
const fs = require('fs');
const { setContext, getActiveContext, getDefaultContextData } = require('../../../utils/utils');
const { getLaunchUrl } = require('../../../apis/extension');
const { logger } = require('../../../utils/logger');

const command = 'get';
const desc = 'Get current launch url for extension';
const builder = function (yargs) {
    return yargs
        .options('api_key', {
            describe: 'extension id'
        })
        .options('verbose', {
            describe: 'Enable verbose logging'
        })
        .demandOption(
            ['api_key'],
            `Please provide 'api_key' arguments to work with this command`
        );
};
const handler = async args => {
    let contextData = getDefaultContextData().partners.contexts.default;

    try {
        contextData = getActiveContext(true);
    }
    catch (err) { }

    const ctx = {
        host: args.host || contextData.host,
        launch_url: args.url,
        token: contextData.partner_access_token || '',
        extension_id: args.api_key,
        verbose: args.verbose
    };
    await fetchLaunchUrl(ctx);
};

const fetchLaunchUrl = async ctx => {
    try {
        let launchUrl = null;
        const tasks = new Listr([
            {
                title: 'Getting launch url',
                task: async () => {
                    const extensionData = await getLaunchUrl(ctx.host, ctx.token, ctx.extension_id, ctx.verbose);
                    launchUrl = extensionData.base_url;
                }
            }
        ]);
        await tasks.run();
        console.log(chalk.greenBright(`Current launch url: ${launchUrl}`));
    } catch (error) {
        console.log(chalk.red(error.message));
    }
};

module.exports = { handler, builder, desc, command };
