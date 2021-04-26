const {
    getActiveContext
} = require('../../utils/utils');
const { getThemeV3 } = require('../../apis/theme');
const chalk = require('chalk');
const _ = require('lodash');
const { writeFile } = require('../../utils/file-utlis');
exports.command = 'pull-config';
exports.desc = 'Pull remote theme config';
const pullConfig = async (args, isSync = false) => {
    try {
        const { appId, token, host, themeId } = getActiveContext();
        const { config, information, font, colors } = await getThemeV3(appId, token, themeId, host)
        const newConfig = {};
        if (config && information) {
            newConfig.list = config.list
            newConfig.current = config.current
            newConfig.preset = config.preset
            newConfig.font = font
            newConfig.colors = colors
            newConfig.information = {
                features: information.features
            }
        }
        if(isSync) {
            return newConfig
        }
        writeFile('./theme/config/settings_data.json', JSON.stringify(newConfig, undefined, 2))
        console.log(
            chalk.greenBright.bold(
                'Config updated successfully')
        );
    } catch (error) {
        let msg = _.get(error, 'response.data.message', error.message);
        console.log(chalk.red(msg));
        process.exit(1);
    }
}
exports.handler = pullConfig
exports.pullConfig = pullConfig
