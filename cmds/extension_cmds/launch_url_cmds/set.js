'use strict';
const Listr = require('listr');
const chalk = require('chalk');
const fs = require('fs');
const { setContext, getActiveContext, getDefaultContextData } = require('../../../utils/utils');
const { updateLaunchUrl } = require('../../../apis/extension');
const { logger } = require('../../../utils/logger');

const command = 'set';
const desc = 'Set a launch url for extension';
const builder = function (yargs) {
    return yargs
        .options('url', {
            describe: 'url to be updated'
        })
        .options('api_key', {
            describe: 'extension id'
        })
        .options('verbose', {
            describe: 'Enable verbose logging'
        })
        .demandOption(
            ['url'],
            `Please provide 'url' arguments to work with this command`
        )
        .demandOption(
            ['api_key'],
            `Please provide 'api_key' arguments to work with this command`
        );
};
const handler = async args => {
    let contextData = getDefaultContextData().contexts.default;

    try {
        contextData = getActiveContext();
    }
    catch (err) { }

    const ctx = {
        host: args.host || contextData.host,
        launch_url: args.url,
        token: contextData.partner_access_token || '',
        extension_id: args.api_key,
        verbose: args.verbose
    };
    await setLaunchUrl(ctx);
};

const setLaunchUrl = async ctx => {
    try {
        const tasks = new Listr([
            {
                title: 'Setting launch url',
                task: async () => {
                    await updateLaunchUrl(ctx.host, ctx.token, ctx.extension_id, ctx.launch_url, ctx.verbose);
                }
            }
        ]);
        await tasks.run();
        console.log(chalk.greenBright('Launch url set successfully'));
    } catch (error) {
        console.log(chalk.red(error.message));
    }
};

module.exports = { handler, builder, desc, command };
