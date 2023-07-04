import {
    asyncForEach,
    createContext,
    decodeBase64,
    evaluateModule,
    getActiveContext,
    pageNameModifier,
    isAThemeDirectory,
    installNpmPackages,
} from '../helper/utils';
import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import ConfigurationService from './api/services/configuration.service';
import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import { AVAILABLE_ENVS } from './Env';
import rimraf from 'rimraf';
import terminalLink from 'terminal-link';
import Box from 'boxen';
import chalk from 'chalk';
import inquirer from 'inquirer';
import cheerio from 'cheerio';
import glob from 'glob';
import _ from 'lodash';
import { createDirectory, writeFile, readFile } from '../helper/file.utils';
import shortid from 'shortid';
import ThemeService from './api/services/theme.service';
import UploadService from './api/services/upload.service';
import { build, devBuild } from '../helper/build';
import { archiveFolder, extractArchive } from '../helper/archive';
import urlJoin from 'url-join';
import { getFullLocalUrl, startServer, reload, getPort } from '../helper/serve.utils';
import { getBaseURL } from './api/services/url';
import open from 'open';
import chokidar from 'chokidar';
import { downloadFile } from '../helper/download';
import Env from './Env';
import Debug from './Debug';
import Spinner from '../helper/spinner';
import { themeVueConfigTemplate, settingLoader } from '../helper/theme.vue.config';
import { simpleGit } from 'simple-git';
export default class Theme {
    /*
        new theme from default template -> create
        create theme from another theme -> init
        pull theme updates
        serve theme
        sync theme
        publish theme
        unpublish theme
        pull-config
    */
    static TEMPLATE_DIRECTORY = path.join(__dirname, '..', '..', 'template');
    static BUILD_FOLDER = './.fdk/dist';
    static SRC_FOLDER = path.join('.fdk', 'temp-theme');
    static VUE_CLI_CONFIG_PATH = path.join('.fdk', 'vue.config.js');
    static SRC_ARCHIVE_FOLDER = path.join('.fdk', 'archive');
    static  SETTING_LOADER_FILE = path.join('.fdk', 'setting-loader.js');
    static ZIP_FILE_NAME = `archive.zip`;
    static TEMPLATE_THEME_URL = 'https://github.com/gofynd/Emerge.git';

    public static getSettingsDataPath() {
        return path.join(process.cwd(), 'theme', 'config', 'settings_data.json');
    }

    public static getSettingsSchemaPath() {
        return path.join(process.cwd(), 'theme', 'config', 'settings_schema.json');
    }

    public static async writeSettingJson(path, jsonObject) {
        try {
            await fs.writeJSON(path, jsonObject, {
                spaces: 2,
            });
            Logger.info(`theme/config/settings_data.json written succesfully.!!!`);
        } catch (err) {
            throw new CommandError(`Error writing ${path} file.!!!`);
        }
    }

    public static async readSettingsJson(path) {
        try {
            const settingsJson = await fs.readJSON(path);
            Logger.info(`theme/config/settings_data.json read successfully.!!!`);
            return settingsJson;
        } catch (err) {
            throw new CommandError(`Error reading ${path} file.!!!`);
        }
    }

    public static async createTheme(options) {
        let shouldDelete = false;
        const targetDirectory = path.join(process.cwd(), options.name);
        try {
            if (fs.existsSync(targetDirectory)) {
                shouldDelete = false;
                throw new CommandError(`Folder ${options.name} already exists`);
            }
            
            Logger.info('Validating token');
            const configObj = JSON.parse(decodeBase64(options.token) || '{}');
            Debug(`Token Data: ${JSON.stringify(configObj)}`);
            if (!configObj) throw new CommandError('Invalid token', ErrorCodes.INVALID_INPUT.code);
            if (new Date(Date.now()) > new Date(configObj.expires_in)) {
                throw new CommandError(
                    'Token expired. Generate a new token',
                    ErrorCodes.INVALID_INPUT.code
                );
            }
            Debug(`Token expires in: ${configObj.expires_in}`);
            const { data: appConfig } = await ConfigurationService.getApplicationDetails(configObj);
            
            Logger.info('Cloning template files');
            await Theme.cloneTemplate(options, targetDirectory);
            shouldDelete = true;

            Logger.info('Creating Theme');
            let available_sections = await Theme.getAvailableSections();
            const themeData = {
                information: {
                    name: options.name,
                },
                available_sections,
            };
            const { data: theme } = await ThemeService.createTheme({ ...configObj, ...themeData });
            
            let context: any = {
                name: options.name,
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: theme._id,
            };
            process.chdir(path.join('.', options.name));

            Logger.info('Saving context');
            await createContext(context);

            Logger.info('Installing dependencies');
            let spinner = new Spinner("Installing npm packages")
            try {
                spinner.start();
                await installNpmPackages()
                spinner.succeed();
            } catch(error) {
                spinner.fail();
                throw new CommandError(error.message);
            } 

            let packageJSON = await fs.readJSON(path.join(process.cwd(), 'package.json'));
            packageJSON.name = Theme.sanitizeThemeName(options.name);
            await fs.writeJSON(`${process.cwd()}/package.json`, packageJSON, {
                spaces: 2,
            });

            await Theme.syncTheme(true);
            var b5 = Box(
                chalk.green.bold('DONE ') +
                    chalk.green.bold('Project ready\n') +
                    chalk.yellowBright.bold('NOTE ') +
                    chalk.green.bold('cd ' + targetDirectory + ' to continue ...'),
                {
                    padding: 1,
                    margin: 1,
                }
            );
            console.log(b5.toString());
        } catch (error) {
            if (shouldDelete) await Theme.cleanUp(targetDirectory);
            throw new CommandError(error.message, error.code);
        }
    }
    public static initTheme = async options => {
        let shouldDelete = false;
        let targetDirectory = '';
        try {
            Logger.info('Validating token');
            const configObj = JSON.parse(decodeBase64(options.token) || '{}');
            Debug(`Token Data: ${JSON.stringify(configObj)}`);
            if (!configObj || !configObj.theme_id)
                throw new CommandError('Invalid token', ErrorCodes.INVALID_INPUT.code);
            
            if (new Date(Date.now()) > new Date(configObj.expires_in)) {
                throw new CommandError(
                    'Token expired. Generate a new token',
                    ErrorCodes.INVALID_INPUT.code
                );
            }
            
            const { data: appConfig } = await ConfigurationService.getApplicationDetails(configObj);
            
            Logger.info('Fetching Template Files');
            const { data: themeData } = await ThemeService.getThemeById(configObj);
            const themeName = themeData?.information?.name || 'default';
            
            targetDirectory = path.join(process.cwd(), themeName);
            if (fs.existsSync(targetDirectory)) {
                shouldDelete = false;
                throw new CommandError(`Folder ${themeName}  already exists`);
            }

            Logger.info('Copying template config files');
            shouldDelete = true;
            await Theme.copyTemplateFiles(Theme.TEMPLATE_DIRECTORY, targetDirectory);
            
            let context: any = {
                name: themeName + '-' + Env.getEnvValue(),
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: themeData._id,
            };

            process.chdir(path.join('.', themeName));
            let zipPath = path.join(targetDirectory, '.fdk', 'archive', 'archive.zip');
            
            Logger.info('Downloading bundle file');
            await downloadFile(themeData.src.link, zipPath);
            
            Logger.info('Extracting bundle archive')
            await extractArchive({ zipPath, destFolderPath: path.resolve(process.cwd(), 'theme') });
            
            Logger.info('Generating Configuration Files');
            let list = _.get(themeData, 'config.list', []);
            let current = _.get(themeData, 'config.current', 'default');
            let preset = _.get(themeData, 'config.preset', {});
            let information = { features: _.get(themeData, 'information.features', []) };
            
            await Theme.writeSettingJson(Theme.getSettingsDataPath(), {
                list,
                current,
                preset,
                information,
            });

            await Theme.writeSettingJson(
                Theme.getSettingsSchemaPath(),
                _.get(themeData, 'config.global_schema', { props: [] })
            );
            fs.writeJson(
                path.join(targetDirectory, 'config.json'),
                {
                    theme: {
                        colors: themeData.colors,
                        styles: themeData.styles,
                        font: themeData.font,
                    },
                },
                {
                    spaces: 2,
                }
            );

            Logger.info('Saving context');
            await createContext(context);

            Logger.info('Installing dependencies..');
            if (fs.existsSync(path.join(process.cwd(), 'theme', 'package.json'))) {
                writeFile(
                    path.join(process.cwd(), 'package.json'),
                    fs.readFileSync(path.join(process.cwd(), 'theme', 'package.json'))
                );
                rimraf.sync(path.join(process.cwd(), 'theme', 'package.json'));
            }
            
            let spinner = new Spinner("Installing npm packages");
            try {
                spinner.start();
                await installNpmPackages();
                spinner.succeed();
            } catch(error) {
                spinner.fail();
                throw new CommandError(error.message);
            } 
            let packageJSON = await fs.readJSON(path.join(process.cwd(), 'package.json'));
            packageJSON.name = Theme.sanitizeThemeName(themeName);
            await fs.writeJSON(path.join(process.cwd(), 'package.json'), packageJSON, {
                spaces: 2,
            });
        } catch (error) {
            if (shouldDelete) await Theme.cleanUp(targetDirectory);
            throw new CommandError(error.message, error.code);
        }
    };
    public static syncThemeWrapper = async () => {
        await Theme.syncTheme();
    };
    private static syncTheme = async (isNew = false) => {
        try {
            const currentContext = getActiveContext();
            currentContext.domain
                ? Logger.warn('Syncing Theme to: ' + currentContext.domain)
                : Logger.warn('Please add domain to context');
            let { data: theme } = await ThemeService.getThemeById(currentContext);
            
            // Merge with latest platform config
            await Theme.matchWithLatestPlatformConfig(theme, (isNew));
            Theme.clearPreviousBuild();
            
            Logger.info('Reading Files');
            let themeContent: any = readFile(`${process.cwd()}/config.json`);

            try {
                themeContent = JSON.parse(themeContent);
            } catch (e) {
                throw new CommandError(`Invalid config.json`);
            }

            let available_sections = await Theme.getAvailableSectionsForSync();
            await Theme.validateAvailableSections(available_sections);
            
            // Create index.js with section file imports
            await Theme.createSectionsIndexFile(available_sections);
            
            const imageCdnUrl = await Theme.getImageCdnBaseUrl();
            const assetCdnUrl = await Theme.getAssetCdnBaseUrl();
            Theme.createVueConfig();
            const assetHash = shortid.generate();

            Logger.info('Building Assets');
            // Building .js & .css bundles using vue-cli
            await build({ buildFolder: Theme.BUILD_FOLDER, imageCdnUrl, assetCdnUrl, assetHash });

            // Check if build folder exists, as during build, vue fails with non-error code even when it errors out
            if (!fs.existsSync(path.join(process.cwd(), Theme.BUILD_FOLDER))) {
                throw new Error('Build Failed');
            }

            let [androidImages, iosImages, desktopImages, thumbnailImages] =
                await Theme.uploadThemePreviewImages();
            
            Logger.info('Uploading theme assets/images');
            await Theme.assetsImageUploader();
            
            Logger.info('Uploading theme assets/fonts');
            await Theme.assetsFontsUploader();

            Logger.info('Creating theme source code zip file');
            await Theme.copyThemeSourceToFdkFolder();
            
            // Remove temp source folder
            rimraf.sync(path.join(process.cwd(), Theme.SRC_FOLDER));

            Logger.info('Uploading theme source code zip file');
            let srcCdnUrl = await Theme.uploadThemeSrcZip();

            Logger.info('Uploading bundle files');
            let pArr = await Theme.uploadThemeBundle({ assetHash });
            let [cssUrls, commonJsUrl, umdJsUrls] = await Promise.all(pArr);


            // extract page level settings schema
            Logger.info('Updating Available pages');
            const { pagesToSave, allowedDefaultProps } = await Theme.updateAvailablePages({ assetHash });

            // Set new theme data
            const newTheme = await Theme.setThemeData(
                theme,
                cssUrls,
                commonJsUrl,
                umdJsUrls,
                srcCdnUrl,
                desktopImages,
                iosImages,
                androidImages,
                thumbnailImages,
                available_sections,
                allowedDefaultProps
            );

            Logger.info('Updating theme');
            await ThemeService.updateTheme(newTheme);

            Logger.info('Theme syncing DONE');
            let domainURL = null;
            if(AVAILABLE_ENVS[currentContext.env])
                domainURL = `https://${AVAILABLE_ENVS[currentContext.env]}`;
            else
                domainURL =`https://${currentContext.env}`
            const url = new URL(domainURL);
            const hostName = url.hostname;
            let domain = hostName.replace('api.', '');
            var b5 = Box(
                chalk.green.bold('Your Theme was pushed successfully\n') +
                    chalk.white('\n') +
                    chalk.white('View your theme:\n') +
                    chalk.green(terminalLink('',`https://${currentContext.domain}/?themeId=${currentContext.theme_id}&preview=true`)) +
                    chalk.white('\n') +
                    chalk.white('\n') +
                    chalk.white('Customize this theme in Theme Editor:\n') +
                    chalk.green(terminalLink('',`https://platform.${domain}/company/${currentContext.company_id}/application/${currentContext.application_id}/themes/${currentContext.theme_id}/edit?preview=true`)),
                {
                    padding: 1,
                    margin: 1,
                    borderColor: 'green',
                }
            );
            console.log(b5.toString());
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    public static serveTheme = async options => {
        try {
            const isSSR =
                typeof options['ssr'] === 'boolean'
                    ? options['ssr']
                    : options['ssr'] == 'true'
                    ? true
                    : false;
            const DEFAULT_PORT = 5001;
            const serverPort =
                typeof options['port'] === 'string'
                    ? parseInt(options['port'])
                    : typeof options['port'] === 'number'
                    ? options['port']
                    : DEFAULT_PORT;
            const port = await getPort(serverPort);
            if (port !== serverPort)
                Logger.warn(
                    chalk.bold.yellowBright(
                        `PORT: ${serverPort} is busy, Switching to PORT: ${port}`
                    )
                );
            !isSSR ? Logger.warn('Disabling SSR') : null;
            let { data: appInfo } = await ConfigurationService.getApplicationDetails();
            let domain = Array.isArray(appInfo.domains)
                ? `https://${appInfo.domains.filter(d => d.is_primary)[0].name}`
                : `https://${appInfo.domain.name}`;
            let host = getBaseURL();
            // initial build
            Logger.info(`Locally building`);
            Theme.createVueConfig();
            await devBuild({
                buildFolder: Theme.BUILD_FOLDER,
                imageCdnUrl: urlJoin(getFullLocalUrl(port), 'assets/images'),
                isProd: isSSR,
            });
            // start dev server
            Logger.info(chalk.bold.blueBright(`Starting server`));
            await startServer({ domain, host, isSSR, port });

            // open browser
            await open(getFullLocalUrl(port));
            console.log(chalk.bold.green(`Watching files for changes`));
            let watcher = chokidar.watch(path.resolve(process.cwd(), 'theme'), {
                persistent: true,
            });
            watcher.on('change', async () => {
                console.log(chalk.bold.green(`building`));
                await devBuild({
                    buildFolder: Theme.BUILD_FOLDER,
                    imageCdnUrl: urlJoin(getFullLocalUrl(port), 'assets/images'),
                    isProd: isSSR,
                });
                reload();
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    public static pullTheme = async () => {
        let spinner = new Spinner('Pulling theme data');
        try {
            spinner.start();
            rimraf.sync(path.resolve(process.cwd(), './theme'));
            createDirectory('theme');
            const { data: themeData } = await ThemeService.getThemeById(null);
            const theme = _.cloneDeep({ ...themeData });
            rimraf.sync(path.resolve(process.cwd(), './.fdk/archive'));
            const zipFilePath = path.join(process.cwd(), './.fdk/pull-archive.zip');
            await downloadFile(theme.src.link, zipFilePath);
            await extractArchive({
                zipPath: path.resolve(process.cwd(), './.fdk/pull-archive.zip'),
                destFolderPath: path.resolve(process.cwd(), './theme'),
            });
            await fs.writeJSON(
                path.join(process.cwd(), '/config.json'),
                { theme: _.pick(theme, ['colors', 'styles', 'font']) },
                {
                    spaces: 2,
                }
            );
            let list = _.get(theme, 'config.list', []);
            let current = _.get(theme, 'config.current', 'default');
            let preset = _.get(theme, 'config.preset', {});
            let information = { features: _.get(theme, 'information.features', []) };
            await Theme.writeSettingJson(Theme.getSettingsDataPath(), {
                list,
                current,
                preset,
                information,
            });
            await Theme.writeSettingJson(
                Theme.getSettingsSchemaPath(),
                _.get(theme, 'config.global_schema', { props: [] })
            );
            const packageJSON = await fs.readJSON(process.cwd() + '/theme/package.json');
            await fs.writeJSON(process.cwd() + '/package.json', packageJSON, {
                spaces: 2,
            });
            rimraf.sync(process.cwd() + '/theme/package.json');
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message, error.code);
        }
    };
    public static publishTheme = async () => {
        let spinner = new Spinner('Publishing theme');
        try {
            spinner.start();
            await ThemeService.publishTheme();
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message, error.code);
        }
    };
    public static unPublishTheme = async () => {
        let spinner = new Spinner('Unpublishing theme');
        try {
            spinner.start();
            await ThemeService.unPublishTheme();
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message, error.code);
        }
    };
    public static pullThemeConfig = async () => {
        try {
            const { data: theme } = await ThemeService.getThemeById(null);
            const { config, information } = theme;
            const newConfig: any = {};
            if (config && information) {
                newConfig.list = config.list;
                newConfig.current = config.current;
                newConfig.preset = config.preset;
                newConfig.information = {
                    features: information.features,
                };
            }
            await Theme.writeSettingJson(Theme.getSettingsDataPath(), newConfig);
            Theme.createVueConfig();
            Logger.info('Config updated successfully');
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    // private methods
    private static async copyTemplateFiles(templateDirectory, targetDirectory) {
        try {
            createDirectory(targetDirectory);
            await fs.copy(templateDirectory, targetDirectory);
            await execa('git', ['init'], { cwd: targetDirectory });
            writeFile(targetDirectory + '/.gitignore', `.fdk\nnode_modules`);
            return true;
        } catch (error) {
            return Promise.reject(error);
        }
    }
    private static async getAvailableSections() {
        let sectionsFiles = [];
        try {
            sectionsFiles = fs
                .readdirSync(path.join(Theme.TEMPLATE_DIRECTORY, '/sections'))
                .filter(o => o != 'index.js');
        } catch (err) {}
        let settings = sectionsFiles.map(f => {
            return Theme.extractSettingsFromFile(`${Theme.TEMPLATE_DIRECTORY}/theme/sections/${f}`);
        });
        return settings;
    }
    private static async getAvailableSectionsForSync() {
        let sectionsFiles = fs
            .readdirSync(`${process.cwd()}/theme/sections`)
            .filter(o => o != 'index.js');
        let settings = sectionsFiles.map(f => {
            return Theme.extractSettingsFromFile(`${process.cwd()}/theme/sections/${f}`);
        });
        return settings;
    }
    private static extractSettingsFromFile(path) {
        try {
            let $ = cheerio.load(readFile(path));
            let settingsText = $('settings').text();

            try {
                return settingsText ? JSON.parse(settingsText) : {};
            } catch(err) {
                throw new Error(`Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`);
            }
        } catch(error) {
            throw new Error(`Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`);
        }
    }
    private static validateSections(available_sections) {
        let fileNameRegex = /^[0-9a-zA-Z-_ ... ]+$/;
        let sectionNamesObject = {};
        available_sections.forEach((section, index) => {
            if (!fileNameRegex.test(section.name)) {
                throw new Error(`Invalid section name, ${section.name}`);
            }
            if (sectionNamesObject[`${section.name}`]) {
                throw new Error(`Duplication section name found. ${section.name}`);
            }
            sectionNamesObject[`${section.name}`] = true;
        });
        return available_sections;
    }
    private static async createSectionsIndexFile(available_sections) {
        available_sections = available_sections || [];
        let fileNames = fs
            .readdirSync(`${process.cwd()}/theme/sections`)
            .filter(o => o != 'index.js');
        let template = `
            ${fileNames.map((f, i) => `import * as component${i} from './${f}';`).join('\n')}
            function exportComponents(components) {
            return [
                ${available_sections
                    .map((s, i) => {
                        return JSON.stringify({
                            name: s.name,
                            label: s.label,
                            component: '',
                        }).replace('"component":""', `"component": components[${i}].default`);
                    })
                    .join(',\n')}
            ];
            }
            export default exportComponents([${fileNames
                .map((f, i) => `component${i}`)
                .join(',')}]);
            `;
        rimraf.sync(`${process.cwd()}/theme/sections/index.js`);
        fs.writeFileSync(`${process.cwd()}/theme/sections/index.js`, template);
    }
    private static extractSectionsFromFile(path) {
        let $ = cheerio.load(readFile(path));
        let template = $('template').html();
        if (!template) {
            return [];
        }
        $ = cheerio.load(template);
        let sections: any = $('sections');
        sections = sections.map(function () {
            return { attributes: $(this).attr() };
        });
        return sections.get();
    }
    private static async cleanUp(targetDirectory = process.cwd()) {
        const spinner = new Spinner("Cleaning up theme data");
        try {
            Logger.error('Cleaning up');
            spinner.start();
            if (fs.existsSync(targetDirectory)) {
                if (fs.existsSync(`${path.join(targetDirectory, '.fdk', 'context.json')}`)) {
                    const contexts = await fs.readJSON(`${path.join(targetDirectory, '.fdk', 'context.json')}`);
                    const activeContext = contexts.theme.active_context;
                    await ThemeService.deleteThemeById(contexts.theme.contexts[activeContext]);
                }
                rimraf.sync(targetDirectory);
            }
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message);
        }
    }
    private static sanitizeThemeName = name => {
        return name.replace(/ /g, '_');
    };
    private static unSanitizeThemeName = name => {
        return name.replace(/_/g, ' ');
    };
    private static getSettingsData = theme => {
        let newConfig;
        if (theme.config && theme.information) {
            newConfig = {};
            newConfig.list = theme.config.list;
            newConfig.current = theme.config.current;
            newConfig.preset = theme.config.preset;
            newConfig.information = {
                features: theme.information.features,
            };
        }
        return newConfig;
    };
    private static clearPreviousBuild = () => {
        rimraf.sync(Theme.BUILD_FOLDER);
        rimraf.sync(Theme.SRC_ARCHIVE_FOLDER);
    };

    private static createVueConfig() {
        const oldVueConfigPath = path.join(process.cwd(), 'vue.config.js');
        const fdkConfigPath = path.join(process.cwd(), 'fdk.config.js');
        if (fs.existsSync(oldVueConfigPath)) {
            if (fs.existsSync(fdkConfigPath)) {
                throw new CommandError(`vue.config.js is not supported, move its file content to fdk.config.js`, ErrorCodes.NOT_KNOWN.code);
            } else {
                fs.renameSync(oldVueConfigPath, fdkConfigPath);
                Logger.info('Renamed file from vue.config.js to fdk.config.js');
            }
        }
        rimraf.sync(path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH));
        fs.writeFileSync(path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH), themeVueConfigTemplate);
        rimraf.sync(path.join(process.cwd(), Theme.SETTING_LOADER_FILE));
        fs.writeFileSync(path.join(process.cwd(), Theme.SETTING_LOADER_FILE),  settingLoader);
        
        
    }

    private static assetsImageUploader = async () => {
        try {
            const cwd = path.resolve(process.cwd(), Theme.BUILD_FOLDER, 'assets', 'images');
            const images = glob.sync(path.join('**', '**.**'), { cwd });
            await asyncForEach(images, async img => {
                const assetPath = path.join(process.cwd(), Theme.BUILD_FOLDER, 'assets', 'images', img);
                await UploadService.uploadFile(assetPath, 'application-theme-images');
            });
        } catch (err) {
            throw new CommandError(err.message || `Failed to upload assets/images`, err.code);
        }
    };
    private static uploadThemePreviewImages = async () => {
        let androidImages = [];
        let iosImages = [];
        let desktopImages = [];
        let thumbnailImages = [];
        try {
            const androidImageFolder = path.resolve(process.cwd(), 'theme/config/images/android');
            androidImages = glob.sync('**/**.**', { cwd: androidImageFolder });
            Logger.info('Uploading android images');
            let pArr = androidImages
                .map(async img => {
                    const assetPath = path.join(process.cwd(), 'theme/config/images/android', img);
                    let res = await UploadService.uploadFile(assetPath, 'application-theme-images');
                    return res.start.cdn.url;
                })
                .filter(o => o);
            androidImages = await Promise.all(pArr);
            const iosImageFolder = path.resolve(process.cwd(), 'theme/config/images/ios');
            iosImages = glob.sync('**/**.**', { cwd: iosImageFolder });
            Logger.info('Uploading ios image');
            pArr = iosImages
                .map(async img => {
                    const assetPath = path.join(process.cwd(), 'theme/config/images/ios', img);
                    let res = await UploadService.uploadFile(assetPath, 'application-theme-images');
                    return res.start.cdn.url;
                })
                .filter(o => o);
            iosImages = await Promise.all(pArr);
            const desktopImageFolder = path.resolve(process.cwd(), 'theme/config/images/desktop');
            desktopImages = glob.sync('**/**.**', { cwd: desktopImageFolder });
            Logger.info('Uploading desktop images');
            pArr = desktopImages
                .map(async img => {
                    const assetPath = path.join(process.cwd(), 'theme/config/images/desktop', img);
                    let res = await UploadService.uploadFile(assetPath, 'application-theme-images');
                    return res.start.cdn.url;
                })
                .filter(o => o);
            desktopImages = await Promise.all(pArr);
            const thumbnailImageFolder = path.resolve(
                process.cwd(),
                'theme',
                'config',
                'images',
                'thumbnail'
            );
            thumbnailImages = glob.sync('**/**.**', { cwd: thumbnailImageFolder });
            Logger.info('Uploading thumbnail images');
            pArr = thumbnailImages
                .map(async img => {
                    const assetPath = path.join(
                        process.cwd(),
                        'theme',
                        'config',
                        'images',
                        'thumbnail',
                        img
                    );
                    let res = await UploadService.uploadFile(assetPath, 'application-theme-images');
                    return res.start.cdn.url;
                })
                .filter(o => o);
            thumbnailImages = await Promise.all(pArr);
            return [androidImages, iosImages, desktopImages, thumbnailImages];
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    private static getImageCdnBaseUrl = async () => {
        let imageCdnUrl = '';
        try {
            let startData = {
                file_name: 'test.jpg',
                content_type: 'image/jpeg',
                size: '1',
            };
            let startAssetData = (
                await UploadService.startUpload(startData, 'application-theme-images')
            ).data;
            return (imageCdnUrl = path.dirname(startAssetData.cdn.url));
        } catch (err) {
            throw new CommandError(`Failed in getting image CDN base url`, err.code);
        }
    };

    private static getAssetCdnBaseUrl = async () => {
        let assetCdnUrl = '';
        try {
            if (fs.existsSync(path.join(process.cwd(), 'theme', 'assets', 'fonts'))) {
                let startData = {
                    file_name: 'test.ttf',
                    content_type: 'font/ttf',
                    size: '10',
                };
                let startAssetData = (
                    await UploadService.startUpload(startData, 'application-theme-assets')
                ).data;
                return (assetCdnUrl = path.dirname(startAssetData.cdn.url));
            }
            return assetCdnUrl;
        } catch (err) {
            throw new CommandError(`Failed in getting assets CDN base url`, err.code);
        }
    };
    private static assetsFontsUploader = async () => {
        try {
            if (fs.existsSync(path.join(process.cwd(), Theme.BUILD_FOLDER, 'assets', 'fonts'))) {
                const cwd = path.join(process.cwd(), Theme.BUILD_FOLDER, 'assets', 'fonts');
                const fonts = glob.sync('**/**.**', { cwd });
                await asyncForEach(fonts, async font => {
                    const assetPath = path.join(Theme.BUILD_FOLDER, 'assets', 'fonts', font);
                    await UploadService.uploadFile(assetPath, 'application-theme-assets');
                });
            }
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };
    private static copyThemeSourceToFdkFolder = async () => {
        try {
            await fs.copy(path.join(process.cwd(), 'theme'), path.join(process.cwd(), Theme.SRC_FOLDER));
            fs.copyFileSync(path.join(process.cwd(), 'package.json'), path.join(process.cwd(), Theme.SRC_FOLDER, 'package.json'));
            await archiveFolder({
                srcFolder: Theme.SRC_FOLDER,
                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                zipFileName: Theme.ZIP_FILE_NAME,
            });
        } catch (err) {
            throw new CommandError(`Failed to copying theme files to .fdk folder`);
        }
    };
    private static validateAvailableSections = async available_sections => {
        try {
            Logger.info('Validating Files');
            available_sections = await Theme.validateSections(available_sections);
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };
    private static uploadThemeBundle = async ({ assetHash }) => {
        try {
            Logger.info('Uploading commonJS');
            const commonJS = `${assetHash}_themeBundle.common.js`;
            const commonJsUrlRes = await UploadService.uploadFile(path.join(process.cwd(), Theme.BUILD_FOLDER, commonJS), 'application-theme-assets');
            const commonJsUrl = commonJsUrlRes.start.cdn.url
            
            Logger.info('Uploading umdJS');
            const umdMinAssets = glob.sync(path.join(process.cwd(), Theme.BUILD_FOLDER, `${assetHash}_themeBundle.umd.min.**.js`));
            umdMinAssets.push(path.join(process.cwd(), Theme.BUILD_FOLDER, `${assetHash}_themeBundle.umd.min.js`));
            const umdJSPromisesArr = umdMinAssets.map(asset => {
                const assetPath = asset;
                return UploadService.uploadFile(assetPath, 'application-theme-assets');
            });
            const umdJsUrls = await Promise.all(umdJSPromisesArr);
            Logger.info('Uploading css');
            let cssAssests = glob.sync(path.join(process.cwd(), Theme.BUILD_FOLDER, '**.css'));
            let cssPromisesArr = cssAssests.map(asset => {
                return UploadService.uploadFile(asset, 'application-theme-assets');
            });
            const cssUrls = await Promise.all(cssPromisesArr);
            return [cssUrls.map(res => res.start.cdn.url), commonJsUrl, umdJsUrls.map(res => res.start.cdn.url)];
        } catch (err) {
            throw new CommandError(err.message || `Failed to upload theme bundle `, err.code);
        }
    };
    private static setThemeData = async (
        theme,
        cssUrls,
        commonJsUrl,
        umdJsUrls,
        srcCdnUrl,
        desktopImages,
        iosImages,
        androidImages,
        thumbnailImages,
        available_sections,
        allowedDefaultProps
    ) => {
        try {
            let themeContent: any = readFile(path.join(process.cwd(), 'config.json'));
            let packageJSON = JSON.parse(readFile(path.join(process.cwd(), 'package.json')));
            if (!packageJSON.name) {
                throw new Error('package.json name can not be empty');
            }
            theme.src = theme.src || {};
            theme.src.link = srcCdnUrl;
            theme.assets = theme.assets || {};
            theme.assets.umd_js = theme.assets.umdJs || {};
            theme.assets.umd_js.links = umdJsUrls;
            theme.assets.umd_js.link = "";
            theme.assets.common_js = theme.assets.commonJs || {};
            theme.assets.common_js.link = commonJsUrl;
            // - start for backward compatibility, will be removed
            theme.assets.umdJs = theme.assets.umdJs || {};
            theme.assets.umdJs.links = umdJsUrls;
            theme.assets.umdJs.link = "";
            theme.assets.umd_js = theme.assets.umdJs || {};
            theme.assets.umd_js.links = umdJsUrls;
            theme.assets.umd_js.link = "";
            theme.assets.commonJs = theme.assets.commonJs || {};
            theme.assets.commonJs.link = commonJsUrl;
            theme.assets.common_js = theme.assets.commonJs || {};
            theme.assets.common_js.link = commonJsUrl;
            theme.assets.css = theme.assets.css || {};
            theme.assets.css.links = cssUrls;
            theme.assets.css.link = "";
            // TODO Issue here
            theme = {
                ...theme,
                ...themeContent.theme,
                available_sections,
            };
            _.set(theme, 'information.images.desktop', desktopImages);
            _.set(theme, 'information.images.ios', iosImages);
            _.set(theme, 'information.images.android', androidImages);
            _.set(theme, 'information.images.thumbnail', thumbnailImages);
            _.set(theme, 'information.name', Theme.unSanitizeThemeName(packageJSON.name));
            let globalConfigSchema = await fs.readJSON(
                path.join(process.cwd(), 'theme', 'config', 'settings_schema.json')
            );
            let globalConfigData = await fs.readJSON(
                path.join(process.cwd(), 'theme', 'config', 'settings_data.json')
            );
            theme.config = theme.config || {};
            theme.config.global_schema = globalConfigSchema;
            theme.config.current = globalConfigData.current || 'default';

            // Modify list to update deleted page's prop
            let newList = null;
            if (globalConfigData.list && Object.keys(allowedDefaultProps).length > 0) {
                newList = globalConfigData.list.map(listItem => {
                    if (!listItem.page) return listItem

                    // delete extra props from all list (Default, Blue, Dark)
                    listItem.page.forEach(pageData => {
                        // allowedDefaultProps object have deleted page name as key
                        // If current page is not deleted page, then no changes needed
                        if (!allowedDefaultProps[pageData.page]) return pageData;

                        Object.keys(pageData.settings.props).forEach(prop => {
                            if (!allowedDefaultProps[pageData.page].includes(prop)) {
                                delete pageData.settings.props[prop]
                            }
                        })
                    })
                    return listItem
                })
            }
            theme.config.list = newList || [{ name: 'default' }];
            theme.config.preset = globalConfigData.preset || [];
            theme.version = packageJSON.version;
            theme.customized = true;
            _.set(
                theme,
                'information.features',
                _.get(globalConfigData, 'information.features', [])
            );
            return theme;
        } catch (err) {
            throw new CommandError(`Failed to set theme data `);
        }
    };
    // Remove extra param "newTheme"
    private static updateAvailablePages = async ({ assetHash }) => {
        const spinner = new Spinner("Adding/updating available pages");
        try {
            spinner.start();
            // Get all available pages before syncing
            const allPages = (await ThemeService.getAllAvailablePage()).data.pages;
            // All available System page
            const systemPagesDB = allPages.filter(x => x.type == 'system');
            // All available Custom page
            const customPagesDB = allPages.filter(x => x.type == 'custom');
            const pagesToSave = [];

            // extract system page level settings schema
            let systemPagesLocally = fs
                .readdirSync(path.join(process.cwd(), 'theme', 'templates', 'pages'))
                .filter(o => o != 'index.js');
            
            // Check if any themefied system page is empty or not
            await asyncForEach(systemPagesLocally, async fileName => {
                let $ = cheerio.load(readFile(path.join(process.cwd(), 'theme', 'templates', 'pages', fileName)));
                let templateText = $('template').text();

                if(!templateText) {
                    throw new CommandError(`${path.join('theme', 'templates', 'pages', fileName)} file is empty. Either delete this page OR themefy it accordingly`, ErrorCodes.NOT_KNOWN.code);
                }
            });

            await asyncForEach(systemPagesLocally, async fileName => {
                let pageName = fileName.replace('.vue', '');
                // SYSTEM Pages
                let systemPage = systemPagesDB.find(p => p.value == pageName);

                // If this system page was not available previously
                if (!systemPage) {
                    Logger.info('Creating System Page: ', pageName);
                    const pageData = {
                        value: pageName,
                        props: [],
                        sections: [],
                        sections_meta: [],
                        type: 'system',
                        text: pageNameModifier(pageName),
                    };
                    systemPage = (await ThemeService.createAvailabePage(pageData)).data;
                }

                // Get page settings props
                systemPage.props =
                    (
                        Theme.extractSettingsFromFile(
                            path.join(process.cwd(), 'theme', 'templates', 'pages', fileName)
                        ) || {}
                    ).props || [];

                // Check if any section tag available in file
                systemPage.sections_meta = Theme.extractSectionsFromFile(
                    path.join(process.cwd(), 'theme', 'templates', 'pages', fileName)
                );
                // set page type to system page
                systemPage.type = 'system';
                pagesToSave.push(systemPage);
            });

            // remove .vue from file name
            const allLocalSystemPageNames = systemPagesLocally.map(name => name.replace('.vue', ''))
            // Delete system pages that were available before sync but now deleted
            const systemPagesToDelete = systemPagesDB.filter(x => !allLocalSystemPageNames.includes(x.value));

            const allowedDefaultProps = {}

            if (systemPagesToDelete.length > 0) {
                // Reseting props in system pages

                // Get default values of all deleted system pages
                const default_props_arr = await Promise.all(systemPagesToDelete.map(
                    page => ThemeService.getDefaultPageDetails(page.value))
                )

                const default_props = {}

                // Create object with page value as a `key` and page details as `value`
                default_props_arr.forEach(res => { default_props[res.data.value] = res.data })

                /**
                 * Update deleted page props with default props. Also filter out
                 * default props from existing props to keep current values intact
                 */
                await Promise.all(
                    systemPagesToDelete.map(async page => {

                        // To fetch deleted system page details
                        const { data: deletedPage }  = await ThemeService.getAvailablePage(page.value);
                        
                        // default page values for a system page
                        const defaultPage = default_props[page.value];
                        if (defaultPage) {
                            allowedDefaultProps[defaultPage.value] = deletedPage.props.map(prop => {
                                
                                // If both `id` and `type` values match for current prop and default prop we will confirm this is a default prop
                                for(let i = 0 ; i < defaultPage.props.length ; i++) {
                                    if(prop.id === defaultPage.props[i].id && prop.type === defaultPage.props[i].type) return prop.id;
                                }
                            });
                            return ThemeService.updateAvailablePage(defaultPage);
                        } else {
                            // show something in CLI
                        }
                    })
                )
            }

            // extract custom page level settings schema
            const bundleFiles = await fs.readFile(
                path.join(Theme.BUILD_FOLDER, `${assetHash}_themeBundle.common.js`),
                'utf-8'
            );
            let customTemplates = [];
            const themeBundle = evaluateModule(bundleFiles);
            if(themeBundle && themeBundle.getCustomTemplates){
                customTemplates = themeBundle.getCustomTemplates();
            }   
            const customFiles = {};
            let settingProps;
            const customRoutes = (ctTemplates, parentKey = null) => {
                for (let key in ctTemplates) {
                    const routerPath = (parentKey && `${parentKey}/${key}`) || `c/${key}`;
                    const value = routerPath.replace(/\//g, ':::');
                    if(ctTemplates[key].component && ctTemplates[key].component.__settings){
                        settingProps = ctTemplates[key].component.__settings.props
                    }
                    customFiles[value] = {
                        fileSetting: settingProps,
                        value,
                        text: pageNameModifier(key),
                        path: routerPath,
                    };
                   
                    if (
                        ctTemplates[key].children &&
                        Object.keys(ctTemplates[key].children).length
                    ) {
                        customRoutes(ctTemplates[key].children, routerPath);
                    }
                }
            };   
            customRoutes(customTemplates);

            // Delete custom pages removed from code
            const pagesToDelete = customPagesDB.filter(x => !customFiles[x.value]);
            await Promise.all(
                pagesToDelete.map(page => {
                    return ThemeService.deleteAvailablePage(page.value);
                })
            )
            for (let key in customFiles) {
                const customPageConfig = customFiles[key];
                let customPage = customPagesDB.find(p => p.value == key);
                if (!customPage) {
                    Logger.log('Creating Custom Page: ', key);
                    const pageData = {
                        value: customPageConfig.value,
                        text: customPageConfig.text,
                        path: customPageConfig.path,
                        props: [],
                        sections: [],
                        sections_meta: [],
                        type: 'custom',
                    };
                    customPage = (await ThemeService.createAvailabePage(pageData)).data;
                }
                customPage.props = customPageConfig.fileSetting || []
                customPage.sections_meta =[]
                customPage.type = 'custom';
                pagesToSave.push(customPage);
            }
            // Logger.info('Updating theme');
            // await ThemeService.updateTheme(theme);
            await ThemeService.updateAllAvailablePages({ pages: pagesToSave });
            spinner.succeed();
            return { pagesToSave, allowedDefaultProps };
        } catch (err) {
            spinner.fail();
            throw new CommandError(err.message, err.code);
        }
    };
    private static uploadThemeSrcZip = async () => {
        const zipFilePath = path.join(process.cwd(), Theme.SRC_ARCHIVE_FOLDER, Theme.ZIP_FILE_NAME);
        try {
            let res = await UploadService.uploadFile(zipFilePath, 'application-theme-src');
            return res.start.cdn.url;
        } catch (err) {
            throw new CommandError(err.message || `Failed to upload src folder`, err.code);
        }
    };

    private static matchWithLatestPlatformConfig = async (theme, isNew) => {
        try {
            const newConfig = Theme.getSettingsData(theme);
            const oldConfig = await Theme.readSettingsJson(Theme.getSettingsDataPath());
            const questions = [
                {
                    type: 'confirm',
                    name: 'pullConfig',
                    message: 'Do you wish to pull config from remote?',
                },
            ];
            if (!isNew && !_.isEqual(newConfig, oldConfig)) {
                await inquirer.prompt(questions).then(async answers => {
                    if (answers.pullConfig) {
                        await Theme.writeSettingJson(Theme.getSettingsDataPath(), newConfig);
                        Logger.info('Config updated successfully');
                    } else {
                        Logger.warn('Using local config to sync');
                    }
                });
            }
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    public static previewTheme =  async() => {
        const currentContext = getActiveContext();
        try {
           await open(`https://${currentContext.domain}/?themeId=${currentContext.theme_id}&preview=true&upgrade=true`);
        } catch(err) {
            throw new CommandError(err.message, err.code);
        }
    };
    public static copyFolders = async(from, to) => {
        try {
            fs.mkdir(to);
           const files = await fs.readdir(from)
           files.forEach((element) => {
                if (element === 'temp-theme') {
                return;
                }else if (fs.lstatSync(path.join(from, element)).isFile() && element != 'node_modules' && element != '.fdk') {
                    fs.copyFile(path.join(from, element), path.join(to, element));
                } else if (fs.lstatSync(path.join(from, element)).isDirectory() && element != 'node_modules' && element != '.fdk') {
                    Theme.copyFolders(path.join(from, element), path.join(to, element));
                }
            });
        } catch(err) {
            throw new CommandError(err.message, err.code);
        }
    };

    public static generateThemeZip = async () => {
        let content = { name: ''};
        let spinner;
        try {
            if(fs.existsSync(Theme.SRC_FOLDER)){
                rimraf.sync(Theme.SRC_FOLDER);
            }
            spinner = new Spinner(chalk.yellow("CLI has started creating zip file..."))
            spinner.start();
            let filepath = path.join(process.cwd(),'package.json');
            let packageContent: any = readFile(filepath);
            let content = JSON.parse(packageContent) || {};
            process.on("SIGINT", () => {
                rimraf.sync(path.join(process.cwd(),'.fdk','temp-theme'));
                rimraf.sync(path.join(process.cwd(),`${content.name}_${content.version}.zip`));
                spinner.fail("CLI has stopped creating zip file...");
                process.exit(0);
            });
            await Theme.copyFolders(path.join(process.cwd()), Theme.SRC_FOLDER);
            await archiveFolder({
                srcFolder: path.join(process.cwd(),'.fdk','temp-theme'),
                destFolder: path.join(process.cwd()),
                zipFileName: `${content.name}_${content.version}.zip`,
            });
            rimraf.sync(path.join(process.cwd(),'.fdk','temp-theme'));
            spinner.succeed(`${content.name}_${content.version}.zip file created.`);
        } catch (err) {
            if (spinner.isSpinning) {
                spinner.fail();
            }
            throw new CommandError(`Failed to generate .zip file of ${content?.name} theme`, err.code);
        }
    };

    private static cloneTemplate = async (options, targetDirectory) => {
        const spinner = new Spinner(`Cloning template files`);
        const url = options.url || Theme.TEMPLATE_THEME_URL;
        try {
            spinner.start();
            const git = simpleGit();
            await git.clone(url, targetDirectory);
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw new CommandError(`Failed to clone template files.\n ${err.message}`, err.code);
        }
    };
}