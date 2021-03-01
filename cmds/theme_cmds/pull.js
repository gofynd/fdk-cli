const { getThemeV3 } = require('../../apis/theme');
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
const command = 'pull';
const desc = 'Pull App Theme';

const handler = async args => {
  await pullTheme(args.verbose);
};
const builder = function (yargs) {
  return yargs.options('verbose', {
    describe: 'Enable verbose logging'
  });
};
const pullAppTheme = async verbose => {
  try {
    rimraf.sync(path.resolve(process.cwd(), './theme'))
    createDirectory('theme');
    const { appId, token, host, themeId } = getActiveContext();
    const response = await getThemeV3(appId, token, themeId, host);
    const theme = _.cloneDeep({ ...response });

    rimraf.sync(path.resolve(process.cwd(), './.fdk/archive'));
    await downloadFile(theme.src.link, './.fdk/pull-archive.zip');
    await extractArchive({
      zipPath: path.resolve(process.cwd(), './.fdk/pull-archive.zip'),
      destFolderPath: path.resolve(process.cwd(), './theme')
    });
    writeFile(
      process.cwd() + '/config.json',
      JSON.stringify({ theme: _.pick(theme, ['colors', 'styles', 'font']) }, undefined, 2)
    );

    let list = _.get(theme, 'config.list', []);
    let current = _.get(theme, 'config.current', 'default');
    let preset = _.get(theme, 'config.preset', {});
    let information = { features: _.get(theme, 'information.features', []) };
    writeFile(
      process.cwd() + '/theme/config/settings_data.json',
      JSON.stringify({ list, current, preset, information }, undefined, 2)
    );

    writeFile(
      process.cwd() + '/theme/config/settings_schema.json',
      JSON.stringify(_.get(theme, 'config.global_schema', { props: [] }), undefined, 2)
    );
    writeFile(process.cwd()+'/package.json',fs.readFileSync(process.cwd()+'/theme/package.json'))
    rimraf.sync(process.cwd()+'/theme/package.json')
    // let desktopImages = _.get(theme, 'information.images.desktop', []);
    // if (desktopImages.length) {
    //   let pArr = desktopImages.map((link) => {
    //     return downloadFile(link, `./theme/config/images/desktop/${path.basename(link)}`);
    //   });
    //   await Promise.all(pArr);
    // }

    // let iosImages = _.get(theme, 'information.images.ios', []);
    // if (iosImages.length) {
    //   let pArr = iosImages.map((link) => {
    //     return downloadFile(link, `./theme/config/images/ios/${path.basename(link)}`);
    //   });
    //   await Promise.all(pArr);
    // }

    // let androidImages = _.get(theme, 'information.images.android', []);
    // if (androidImages.length) {
    //   let pArr = androidImages.map((link) => {
    //     return downloadFile(link, `./theme/config/images/android/${path.basename(link)}`);
    //   });
    //   await Promise.all(pArr);
    // }

    // let thumbnailImages = _.get(theme, 'information.images.thumbnail', []);
    // if (thumbnailImages.length) {
    //   let pArr = thumbnailImages.map((link) => {
    //     return downloadFile(link, `./theme/config/images/thumbnail/${path.basename(link)}`);
    //   });
    //   await Promise.all(pArr);
    // }
  } catch (error) {
    console.log(error);
  }
};
const pullTheme = async verbose => {
  try {
    const tasks = new Listr([
      {
        title: 'Pull Theme Data',
        task: async ctx => {
          try {
            await pullAppTheme(verbose);
          } catch (error) {
            console.log(error);
          }
        }
      }
    ]);
    await tasks.run().then(theme => {
      console.log(chalk.green('Theme pulled successfully'));
    });
  } catch (error) {
    console.log(chalk.red(error.message));
    process.exit(1);
  }
};
module.exports = {
  command,
  desc,
  handler,
  builder
};
