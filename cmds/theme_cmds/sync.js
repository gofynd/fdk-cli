const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const mime = require('mime');
const asyncjs = require('async');
const rimraf = require('rimraf');
const cheerio = require('cheerio');
const compiler = require('vue-template-compiler');
const requireFromString = require('require-from-string');
const { archiveFolder } = require('../../utils/archive');
const { readFile, createDirectory, writeFile } = require('../../utils/file-utlis');
const { logger } = require('../../utils/logger');
const { build } = require('../../utils/build');
const { getActiveContext } = require('../../utils/utils');
const {
  startThemeImagesUpload,
  getTheme,
  updateTheme,
  uploadFile
} = require('../../apis/upload');
const { pullConfig } = require('./pull-config')
const { sendTheme, updateThemeV3, getThemeV3, getAvailablePage, updateAllPages, createAvailablePage } = require('../../apis/theme');
const { promisify } = require('util');
const ncp = require('ncp');
const copy = promisify(ncp);
const inquirer = require('inquirer');
const { unSanitizeThemeName } = require('../../utils/themeUtils');
const { ALL_AVAILABLE_PAGES } = require('../../utils/fileMap');
const leven = require('leven');

const command = 'sync';
const desc = 'Sync Theme Files with DB';
const buildFolder = './.fdk/dist';
const srcFolder = './.fdk/temp-theme';
const srcArchiveFolder = './.fdk/archive';
const zipFileName = `archive.zip`;

function clearPreviousBuild() {
  rimraf.sync(buildFolder);
  rimraf.sync(srcArchiveFolder);
}

function createSectionsIndexFile(available_sections) {
  available_sections = available_sections || [];
  let fileNames = fs.readdirSync(`${process.cwd()}/theme/sections`).filter(o => o != 'index.js');
  let template = `
${fileNames.map((f, i) => `import * as component${i} from './${f}';`).join('\n')}

function exportComponents(components) {
  return [
    ${available_sections.map((s, i) => {
    return JSON.stringify({
      name: s.name,
      label: s.label,
      component: ""
    }).replace('"component":""', `"component": components[${i}].default`)
  }).join(',\n')}
  ];
}

export default exportComponents([${fileNames.map((f, i) => `component${i}`).join(',')}]);
  `;
  rimraf.sync(`${process.cwd()}/theme/sections/index.js`);
  fs.writeFileSync(`${process.cwd()}/theme/sections/index.js`, template);
}

function extractSettingsFromFile(path) {
  let $ = cheerio.load(readFile(path));
  let settingsText = $('settings').text();
  return settingsText ? JSON.parse(settingsText) : {};
}

function extractSectionsFromFile(path) {
  let $ = cheerio.load(readFile(path));
  let template = $('template').html();
  if (!template) {
    return [];
  }
  $ = cheerio.load(template);
  let sections = $('sections');
  sections = sections.map(function () {
    return { attributes: $(this).attr() }
  });
  return sections.get();
}

async function getAvailableSections() {
  let sectionsFiles = fs.readdirSync(`${process.cwd()}/theme/sections`).filter(o => o != 'index.js');
  let settings = sectionsFiles.map((f) => {
    return extractSettingsFromFile(`${process.cwd()}/theme/sections/${f}`);
    //   let image_section = compiler.parseComponent(readFile(`${process.cwd()}/theme/sections/${f}`));
    //   let sectionSettings = await new Promise((resolve, reject) => {
    //     require("@babel/core").transform(
    //       image_section.script.content,
    //       {
    //         // filename: `${process.cwd()}/theme/sections/${f}`,
    //         plugins: ["@babel/plugin-transform-modules-commonjs"],
    //         // presets: ["@vue/babel-preset-app"]
    //       },
    //       (err, result) => {
    //         if (err) {
    //           return reject(err);
    //         }
    //         try {
    //           let modules = requireFromString(result.code);
    //           return resolve(modules.settings);
    //         } catch (e) {
    //           return reject(e);
    //         }
    //       });
    //   });
    //   return sectionSettings;
  });
  // return Promise.all(pArr);
  return settings;
};
async function validateSections(available_sections) {
  let fileNameRegex = /^[0-9a-zA-Z-_ ... ]+$/;
  let sectionNamesObject = {};
  available_sections.forEach((section, index) => {
    if (!fileNameRegex.test(section.name)) {
      throw new Error(`Invalid section name, ${section.name}`);
    }
    if (sectionNamesObject[`${section.name}`]) {
      throw new Error(`Duplication section name found. ${section.name}`)
    }
    sectionNamesObject[`${section.name}`] = true;
  })
  return available_sections;
}

function sortString(str){
  var arr = str.split('');
  arr.sort()
  return arr.join('');
}

const handler = async ({ isNew }) => {
  try {
    const currentContext = getActiveContext();
    console.log(
      `${currentContext.domain ? chalk.greenBright.bold("Syncing Theme to: " + currentContext.domain) : chalk.yellow.bold("Please add domain to context")} `)
    const isSync = true
    const newConfig = await pullConfig({}, isSync);
    const oldConfig = JSON.stringify(JSON.parse(readFile('./theme/config/settings_data.json')));
    const questions = [
      {
        type: 'confirm',
        name: 'pullConfig',
        message: 'Do you wish to pull config from remote?',
      }
    ];
    if (!isNew && sortString(JSON.stringify(newConfig)) !== sortString(oldConfig)) {
      await inquirer.prompt(questions).then(async answers => {
        if (answers.pullConfig) {
          writeFile('./theme/config/settings_data.json', JSON.stringify(newConfig, undefined, 2))
          console.log(
            chalk.greenBright.bold(
              'Config updated successfully')
          );
        } else {
          console.log(
            chalk.yellow.bold(
              'Using local config to sync')
          );
        }
      })
    }

    clearPreviousBuild();
    // read config.json for color,styles,font
    console.log(chalk.yellow.bold('Reading Files...'));
    let themeContent = readFile(`${process.cwd()}/config.json`);
    try {
      themeContent = JSON.parse(themeContent);
    } catch (e) {
      throw new Error(`Invalid  config.json\n${e}`);
    }

    // get sections
    let available_sections = await getAvailableSections();
    console.log(chalk.yellow.bold('Validating Files...'));
    available_sections = await validateSections(available_sections);
    createSectionsIndexFile(available_sections);

    let imageCdnUrl = '';

    // get image cdn base url
    {
      const startData = {
        file_name: 'test.jpg',
        content_type: 'image/jpeg',
        size: '1',
      };
      let startAssetData = await startThemeImagesUpload(startData);
      imageCdnUrl = path.dirname(startAssetData.cdn.url);
    }

    console.log(chalk.yellow.bold('Building Assets...'));
    // build js css
    await build({ buildFolder, imageCdnUrl });
    // check if build folder exists, as during build, vue fails with non-error code even when it errors out
    if (!fs.existsSync(buildFolder)) {
      throw new Error('Build Failed');
    }

    let androidImages = [];
    let iosImages = [];
    let desktopImages = [];
    let thumbnailImages = [];
    // upload theme preview images
    {
      const androidImageFolder = path.resolve(process.cwd(), 'theme/config/images/android');
      androidImages = glob.sync('**/**.**', { cwd: androidImageFolder });
      console.log(chalk.yellow.bold('Uploading android images...'));
      let pArr = androidImages.map(async (img) => {
        const assetPath = path.join(process.cwd(), 'theme/config/images/android', img);
        let res = await uploadFile(assetPath, 'application-theme-images');
        return res.start.cdn.url;
      }).filter(o => o);
      androidImages = await Promise.all(pArr);

      const iosImageFolder = path.resolve(process.cwd(), 'theme/config/images/ios');
      iosImages = glob.sync('**/**.**', { cwd: iosImageFolder });
      console.log(chalk.yellow.bold('Uploading ios images...'));
      pArr = iosImages.map(async (img) => {
        const assetPath = path.join(process.cwd(), 'theme/config/images/ios', img);
        let res = await uploadFile(assetPath, 'application-theme-images');
        return res.start.cdn.url;
      }).filter(o => o);
      iosImages = await Promise.all(pArr);

      const desktopImageFolder = path.resolve(process.cwd(), 'theme/config/images/desktop');
      desktopImages = glob.sync('**/**.**', { cwd: desktopImageFolder });
      console.log(chalk.yellow.bold('Uploading desktop images...'));
      pArr = desktopImages.map(async (img) => {
        const assetPath = path.join(process.cwd(), 'theme/config/images/desktop', img);
        let res = await uploadFile(assetPath, 'application-theme-images');
        return res.start.cdn.url;
      }).filter(o => o);
      desktopImages = await Promise.all(pArr);

      const thumbnailImageFolder = path.resolve(process.cwd(), 'theme/config/images/thumbnail');
      thumbnailImages = glob.sync('**/**.**', { cwd: thumbnailImageFolder });
      console.log(chalk.yellow.bold('Uploading thumbnail images...'));
      pArr = thumbnailImages.map(async (img) => {
        const assetPath = path.join(process.cwd(), 'theme/config/images/thumbnail', img);
        let res = await uploadFile(assetPath, 'application-theme-images');
        return res.start.cdn.url;
      }).filter(o => o);
      thumbnailImages = await Promise.all(pArr);
    }

    // upload images
    {
      const cwd = path.resolve(process.cwd(), buildFolder, 'assets/images');
      const images = glob.sync('**/**.**', { cwd });
      console.log(chalk.yellow.bold('Uploading images...'));
      await asyncjs.concatLimit(
        images,
        1,
        async (img) => {
          const assetPath = path.join(buildFolder, 'assets/images', img);
          let res = await uploadFile(assetPath, 'application-theme-images');
          return res.start.cdn.url;
        });
      // let pArr = images.map(async (img) => {
      //   const assetPath = path.join(buildFolder, 'assets/images', img);
      //   let res = await uploadFile(assetPath, 'application-theme-images');
      //   return res.start.cdn.url;
      // });
      // await Promise.all(pArr);
    }


    //copy files to .fdk
    console.log(chalk.yellow.bold('Archiving src...'));
    await copy('./theme', srcFolder);
    fs.copyFileSync('./package.json', srcFolder + '/package.json', function (err) {
      if (err) {
        throw err
      }
    })
    // zip source files
    await archiveFolder({
      srcFolder,
      destFolder: srcArchiveFolder,
      zipFileName,
    });
    //remove temp files
    rimraf.sync(srcFolder)
    const zipFilePath = path.join(srcArchiveFolder, zipFileName);
    let srcCdnUrl;
    // src file upload
    {
      console.log(chalk.yellow.bold('Uploading src...'));
      let res = await uploadFile(zipFilePath, 'application-theme-src');
      srcCdnUrl = res.start.cdn.url;
    }

    // assets upload
    {
      const { appId, token, host, themeId } = currentContext;
      const assets = [
        'themeBundle.css',
        'themeBundle.common.js',
        'themeBundle.umd.min.js',
      ];

      console.log(chalk.yellow.bold('Uploading assets...'));
      let pArr = assets.map(async (asset) => {
        const assetPath = path.join(buildFolder, asset);
        let res = await uploadFile(assetPath, 'application-theme-assets');
        return res.start.cdn.url;
      });

      let [cssUrl, commonJsUrl, umdJsUrl] = await Promise.all(pArr);
      let packageJSON = JSON.parse(readFile(`${process.cwd()}/package.json`));
      if (!packageJSON.name) {
        throw new Error('package.json name can not be empty')
      }

      //update theme
      let theme = await getThemeV3(appId, token, themeId, host).catch((e) => ({}));
      theme = theme || {};
      theme.src = theme.src || {};
      theme.src.link = srcCdnUrl;

      theme.assets = theme.assets || {};
      theme.assets.umdJs = theme.assets.umdJs || {};
      theme.assets.umdJs.link = umdJsUrl;

      theme.assets.commonJs = theme.assets.commonJs || {};
      theme.assets.commonJs.link = commonJsUrl;

      theme.assets.css = theme.assets.css || {};
      theme.assets.css.link = cssUrl;

      theme = {
        ...theme,
        ...themeContent.theme,
        available_sections
      };

      _.set(theme, 'information.images.desktop', desktopImages)
      _.set(theme, 'information.images.ios', iosImages)
      _.set(theme, 'information.images.android', androidImages)
      _.set(theme, 'information.images.thumbnail', thumbnailImages)
      _.set(theme, 'information.name', unSanitizeThemeName(packageJSON.name))

      // get config schema and data
      let globalConfigSchema = JSON.parse(readFile(`${process.cwd()}/theme/config/settings_schema.json`));
      let globalConfigData = JSON.parse(readFile(`${process.cwd()}/theme/config/settings_data.json`));
      theme.config = theme.config || {};
      theme.config.global_schema = globalConfigSchema;
      theme.config.current = globalConfigData.current || 'default';
      theme.config.list = globalConfigData.list || [{ name: 'default' }];
      theme.config.preset = globalConfigData.preset || [];
      theme.version = packageJSON.version;
      theme.customized = true;
      _.set(theme, 'information.features', _.get(globalConfigData, 'information.features', []));

      // extract page level settings schema
      let pageTemplateFiles = fs.readdirSync(`${process.cwd()}/theme/templates/pages`).filter(o => o != 'index.js');
      theme.config = theme.config || {};
      let availablePages = []
      pageTemplateFiles.forEach(async (fileName) => {
          let pageName = fileName.replace('.vue', '');
          // SYSTEM Pages
          let available_page = await getAvailablePage(appId, token, themeId, pageName, host)
          if (!available_page) {
            available_page = ALL_AVAILABLE_PAGES.find(p => p.value === pageName)
            if (!available_page) {
              const suggestion = ALL_AVAILABLE_PAGES.find(
                (page) => leven(page.value, pageName) < page.value.length * 0.4
              );
              let msg = suggestion ? `Did you mean ${suggestion}` : ''
              throw new Error(`Invalid theme template: ${pageName}. ${msg}`)
            }
          }
          available_page.props = (extractSettingsFromFile(`${process.cwd()}/theme/templates/pages/${fileName}`) || {}).props || [];
          available_page.sections_meta = extractSectionsFromFile(`${process.cwd()}/theme/templates/pages/${fileName}`);
          available_page.type = "system"
          availablePages.push(available_page)
      });
      // TODO custom templates
      // let customPageTemplateFiles = fs.readdirSync(`${process.cwd()}/theme/custom-templates`).filter(o => o != 'index.js');
      // customPageTemplateFiles.forEach((fileName) => {
      //   let pageName = fileName.replace('.vue', '');
      //   // SYSTEM Pages
      //   let available_page = await getAvailablePage(appId, token, themeId, pageName, host)
      //   if (!available_page) {
      //     available_page = ALL_AVAILABLE_PAGES.find(p => p.value === pageName)
      //     if(!available_page) {
      //       const suggestion = ALL_AVAILABLE_PAGES.find(
      //         (page) => leven(page, available_page) < page.length * 0.4
      //       );
      //       let msg = suggestion ? `Did you mean ${suggestion}` : ''
      //       throw new Error(`Invalid theme template: ${available_page}. ${msg}`)}
      //   }
      //   available_page.props = (extractSettingsFromFile(`${process.cwd()}/theme/custom-templates/${fileName}`) || {}).props || [];
      //   available_page.sections_meta = extractSectionsFromFile(`${process.cwd()}/theme/custom-templates/${fileName}`);
      //   available_page.type = "custom"
      //   availablePages.push(available_page)
      // });
      await Promise.all([updateThemeV3(appId, token, themeId, theme, host), updateAllPages(appId, token, themeId, {pages: availablePages } , host)]);
    }
  } catch (error) {
    console.log(error);
    process.kill(process.pid);
  }
};

module.exports = {
  command,
  desc,
  handler,
};