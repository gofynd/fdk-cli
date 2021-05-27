const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const Table = require('cli-table');
const { getActiveContext } = require('../../utils/utils');
const { getApplicationThemes } = require('../../apis/theme');

exports.command = 'list';
exports.desc = 'List Application themes';
exports.handler = async (args) => {
    try {
        let { appId, appToken, host } = args;
        let { items } = await getApplicationThemes(appId, appToken, host);
        const table = new Table({
            head: ['Name', 'ID'],
            colWidths: [30, 30]
        });
        items.forEach(t => {
            table.push([t.information.name, t._id]);
        });
        console.log(table.toString());
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};
exports.builder = function (yargs) {
    return yargs
        .options('app-id', {
            describe: 'Application Id'
        })
        .options('app-token', {
            describe: 'Application Token'
        })
        .options('host', {
            alias: 'h',
            describe: 'Host'
        })
        .demandOption(
            ['app-id', 'app-token', 'host'],
            `Please provide 'app-id, app-token, host' arguments to work with this command`
        );
};