import {
    asyncForEach,
    createContext,
    decodeBase64,
    evaluateModule,
    getActiveContext,
    pageNameModifier,
    isAThemeDirectory,
    installNpmPackages,
    ThemeContextInterface,
    parseBundleFilename,
    transformSectionFileName,
    findExportedVariable,
} from '../helper/utils';
import CommandError, { ErrorCodes } from './CommandError';
import Logger, { COMMON_LOG_MESSAGES } from './Logger';
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
import { customAlphabet } from 'nanoid';
import ThemeService from './api/services/theme.service';
import UploadService from './api/services/upload.service';
import ExtensionService from './api/services/extension.service';
import {
    THEME_ENTRY_FILE,
    build,
    devBuild,
    devReactBuild,
    devReactWatch,
} from '../helper/build';
import { archiveFolder, extractArchive } from '../helper/archive';
import urlJoin from 'url-join';
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
import {
    getFullLocalUrl,
    startServer,
    reload,
    getPort,
    startReactServer,
} from '../helper/serve.utils';
import { getBaseURL, getPlatformUrls } from './api/services/url';
import open from 'open';
import chokidar from 'chokidar';
import { downloadFile } from '../helper/download';
import Env from './Env';
import Spinner from '../helper/spinner';
import {
    themeVueConfigTemplate,
    settingLoader,
} from '../helper/theme.vue.config';
import { simpleGit } from 'simple-git';
import { THEME_TYPE } from '../helper/constants';

const nanoid = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    9
  );
export default class Theme {
    /*
        new theme from default template -> create
        create theme from another theme -> init
        pull theme updates
        serve theme
        sync theme
        pull-config
    */
    static TEMPLATE_DIRECTORY = path.join(__dirname, '..', '..', 'template');
    static REACT_TEMPLATE_DIRECTORY = path.join(
        __dirname,
        '..',
        '..',
        'react-template',
    );
    static TEMP_REACT_TEMPLATE_DIRECTORY = path.join(
        __dirname,
        '..',
        '..',
        'react-theme-template',
    );
    static BUILD_FOLDER = './.fdk/dist';
    static SRC_FOLDER = path.join('.fdk', 'temp-theme');
    static VUE_CLI_CONFIG_PATH = path.join('.fdk', 'vue.config.js');
    static REACT_CLI_CONFIG_PATH = 'webpack.config.js';
    static SRC_ARCHIVE_FOLDER = path.join('.fdk', 'archive');
    static SETTING_LOADER_FILE = path.join('.fdk', 'setting-loader.js');
    static ZIP_FILE_NAME = `archive.zip`;
    static TEMPLATE_THEME_URL = 'https://github.com/gofynd/Astra.git';

    public static getSettingsDataPath() {
        let settings_path = path.join(
            process.cwd(),
            'theme',
            'config',
            'settings_data.json',
        );
        if (fs.existsSync(settings_path)) return settings_path;
        settings_path = path.join(
            process.cwd(),
            'config',
            'settings_data.json',
        );
        if (fs.existsSync(settings_path)) return settings_path;
        throw 'Settings path not exist';
    }

    public static getSettingsSchemaPath() {
        let settings_schema_path = path.join(
            process.cwd(),
            'theme',
            'config',
            'settings_schema.json',
        );
        if (fs.existsSync(settings_schema_path)) return settings_schema_path;
        settings_schema_path = path.join(
            process.cwd(),
            'config',
            'settings_schema.json',
        );
        if (fs.existsSync(settings_schema_path)) return settings_schema_path;
        throw 'Settings schema path not exist';
    }

    public static async writeSettingJson(path, jsonObject) {
        try {
            await fs.writeJSON(path, jsonObject, {
                spaces: 2,
            });
            Logger.info(
                `theme/config/settings_data.json written succesfully.!!!`,
            );
        } catch (err) {
            Logger.info(err);
            throw new CommandError(`Error writing ${path} file.!!!`);
        }
    }

    public static async readSettingsJson(path) {
        try {
            const settingsJson = await fs.readJSON(path);
            Logger.info(
                `theme/config/settings_data.json read successfully.!!!`,
            );
            return settingsJson;
        } catch (err) {
            throw new CommandError(`Error reading ${path} file.!!!`);
        }
    }
    public static async validateSectionWithDB(available_sections_in_db, available_sections){
        // validate available section
        const db_section_names = available_sections_in_db.map(section => section.name)
        const local_section_names = available_sections.map(section => section.name)
        const mismatched_sections = _.difference(db_section_names, local_section_names)

        if(mismatched_sections.length > 0){
            const questions = [
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: `Certain theme sections are unavailable in your code. Proceeding with the sync may result in potential side effects and issues. Would you like to continue?`,
                },
            ];

            const log_section_details = mismatched_sections.map(name => `❌ ${name} section is not present in your code`).join("\n")

            // Show which section is not present and in which page it is set as an preset section.
            // Ex. ❌ hero_image section used in home page is not available
            console.log('\n' + chalk.yellow(log_section_details) + '\n');

            await inquirer.prompt(questions).then(async answers => {
                if (answers.proceed) {
                    Logger.info('Proceeding without unavailable sections...');
                } else {
                    throw new Error(`Please review the sections. Some of the sections that were available in the theme are missing from your code.`)
                }
            });
        }
    }

    public static async selectTheme(config) {
        const themeListOptions = {};
        const themeList = await ThemeService.getAllThemes(config);
        if (!themeList.data.length) {
            throw new CommandError(
                ErrorCodes.NO_THEME_FOUND.message(getPlatformUrls().partners),
                ErrorCodes.NO_THEME_FOUND.code,
            );
        }
        themeList.data.forEach((theme) => {
            themeListOptions[`${theme.name}`] = { ...theme };
        });
        const themeListQuestions = [
            {
                type: 'search-list',
                name: 'selectedTheme',
                message: 'Select Theme',
                choices: Object.keys(themeListOptions),
            },
        ];
        return await inquirer
            .prompt(themeListQuestions)
            .then(async (answers) => {
                try {
                    const selectedTheme =
                        themeListOptions[answers.selectedTheme]?._id;
                    config['theme_id'] = selectedTheme;
                    return config;
                } catch (error) {
                    Logger.error(error);
                    throw new CommandError(error.message, error.code);
                }
            });
    }

    public static async selectCompanyAndStore() {
        const accountTypeQuestions = [
            {
                type: 'list',
                name: 'accountType',
                message: 'Select accounts type.',
                choices: ['development', 'live'],
            },
        ];
        let config = {};
        let company_type;
        let companyList;
        let selectedCompany;
        let applicationList;
        let selectedApplication;
        await inquirer.prompt(accountTypeQuestions).then(async (answers) => {
            try {
                company_type = answers.accountType;
                if (answers.accountType === 'development') {
                    companyList = await ExtensionService.getDevelopmentAccounts(
                        1,
                        9999,
                    );
                } else {
                    companyList = await ExtensionService.getLiveAccounts(
                        1,
                        9999,
                    );
                }
            } catch (error) {
                throw new CommandError(error.message, error.code);
            }
        });

        const companyListOptions = {};
        if (!companyList.items.length) {
            throw new CommandError(
                ErrorCodes.NO_COMPANY_FOUND.message(
                    company_type,
                    getPlatformUrls().partners,
                ),
                ErrorCodes.NO_COMPANY_FOUND.code,
            );
        }
        companyList?.items.forEach((company) => {
            companyListOptions[`${company.company_name}`] = { ...company };
        });
        const companyListQuestions = [
            {
                type: 'search-list',
                name: 'selectedCompany',
                message: 'Select company',
                choices: Object.keys(companyListOptions),
            },
        ];
        await inquirer.prompt(companyListQuestions).then(async (answers) => {
            try {
                selectedCompany =
                    companyListOptions[answers.selectedCompany]?.company?.uid ||
                    companyListOptions[answers.selectedCompany].company_id;
                applicationList =
                    await ConfigurationService.getApplications(selectedCompany);
            } catch (error) {
                Logger.error(error);
                throw new CommandError(error.message, error.code);
            }
        });
        if (!applicationList.data.items.length) {
            throw new CommandError(
                ErrorCodes.NO_APP_FOUND.message(getPlatformUrls().partners),
                ErrorCodes.NO_APP_FOUND.code,
            );
        }
        const applicationListOptions = {};
        applicationList.data.items.forEach((application) => {
            applicationListOptions[`${application.name}`] = { ...application };
        });
        const applicationListQuestions = [
            {
                type: 'search-list',
                name: 'selectedApplication',
                message: 'Select sales channel',
                choices: Object.keys(applicationListOptions),
            },
        ];

        await inquirer
            .prompt(applicationListQuestions)
            .then(async (answers) => {
                try {
                    selectedApplication =
                        applicationListOptions[answers.selectedApplication]._id;
                } catch (error) {
                    Logger.error(error);
                    throw new CommandError(error.message, error.code);
                }
            });
        config['application_id'] = selectedApplication;
        config['company_id'] = selectedCompany;
        return config;
    }

    public static async createTheme(options) {
        let shouldDelete = false;
        const dir_name = Theme.sanitizeThemeName(options.name);
        const targetDirectory = path.join(process.cwd(), dir_name);
        try {
            if (fs.existsSync(targetDirectory)) {
                shouldDelete = false;
                throw new CommandError(`Folder ${options.name} already exists`);
            }
            const themeType = await Theme.selectThemeType();
            if (themeType !== 'vue2' && themeType !== 'react') {
                throw new CommandError(COMMON_LOG_MESSAGES.invalidThemeType);
            }
            const configObj = await Theme.selectCompanyAndStore();
            const { data: appConfig } =
                await ConfigurationService.getApplicationDetails(configObj);

            if (themeType === 'vue2') {
                await Theme.createVueTheme(
                    options,
                    appConfig,
                    configObj,
                    targetDirectory,
                );
            } else if (themeType === 'react') {
                await Theme.createReactTheme(
                    options,
                    appConfig,
                    configObj,
                    targetDirectory,
                );
            }
        } catch (error) {
            if (shouldDelete) await Theme.cleanUp(targetDirectory);
            throw new CommandError(error.message, error.code);
        }
    }

    public static async createVueTheme(
        options,
        appConfig,
        configObj,
        targetDirectory,
    ) {
        let shouldDelete = false;
        try {
            Logger.info('Cloning template files');
            await Theme.cloneTemplate(options, targetDirectory, appConfig);
            shouldDelete = true;
            process.chdir(path.join('.', options.name));
            Logger.info('Installing dependencies');
            let spinner = new Spinner('Installing npm packages');
            try {
                spinner.start();
                await installNpmPackages();
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }
            Logger.info('Creating Theme');
            let available_sections = await Theme.getAvailableSections();
            let settings_schema = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_schema.json',
                ),
            );
            let settings_data = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_data.json',
                ),
            );
            const imageCdnUrl = await Theme.getImageCdnBaseUrl();
            const assetCdnUrl = await Theme.getAssetCdnBaseUrl();
            Theme.createVueConfig();
            const assetHash = nanoid();
            await build({
                buildFolder: Theme.BUILD_FOLDER,
                imageCdnUrl,
                assetCdnUrl,
                assetHash,
            });
            const pages = await Theme.generateAvailablePages(assetHash, true);
            const themeData = {
                name: options.name,
                available_sections,
                version: '1.0.0',
                theme_type: 'vue2',
                list: settings_data.list,
                preset: settings_data.preset,
                current: settings_data.current,
                global_schema: settings_schema,
                pages: pages,
            };
            const { data: theme } = await ThemeService.createTheme({
                ...configObj,
                ...themeData,
            });

            let context: any = {
                name: options.name,
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: theme._id,
                application_token: appConfig.token,
                theme_type: 'vue2',
            };
            Logger.info('Saving context');
            await createContext(context);
            await Theme.ensureThemeTypeInPackageJson();
            let packageJSON = await fs.readJSON(
                path.join(process.cwd(), 'package.json'),
            );
            packageJSON.name = Theme.sanitizeThemeName(options.name);
            packageJSON.version = '1.0.0';
            await fs.writeJSON(`${process.cwd()}/package.json`, packageJSON, {
                spaces: 2,
            });
            const currentContext = getActiveContext();
            await Theme.syncVueTheme(currentContext, true, {
                assetCdnUrl,
                assetHash,
                imageCdnUrl,
            });
            var b5 = Box(
                chalk.green.bold('DONE ') +
                    chalk.green.bold('Project ready\n') +
                    chalk.yellowBright.bold('NOTE ') +
                    chalk.green.bold(
                        'cd ' + targetDirectory + ' to continue ...',
                    ),
                {
                    padding: 1,
                    margin: 1,
                },
            );
            Logger.info(b5.toString());
        } catch (error) {
            if (shouldDelete) await Theme.cleanUp(targetDirectory);
            throw new CommandError(error.message, error.code);
        }
    }

    public static async createReactTheme(
        options,
        appConfig,
        configObj,
        targetDirectory,
    ) {
        try {
            Logger.info('Copying template files');
            await Theme.copyTemplateFiles(
                Theme.TEMP_REACT_TEMPLATE_DIRECTORY,
                targetDirectory,
                true,
            );
            Logger.info('Copied template files');
            process.chdir(path.join('.', options.name));

            // Create index.js with section file imports
            Logger.info('creating section index file');
            await Theme.createReactSectionsIndexFile();
            Logger.info('created section index file');

            Logger.info('Installing dependencies');
            let spinner = new Spinner('Installing npm packages');
            try {
                spinner.start();
                await installNpmPackages();
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }

            Logger.info('Building Theme...');
            await devReactBuild({
                buildFolder: Theme.BUILD_FOLDER,
                runOnLocal: true,
                isHMREnabled: false,
            });

            const available_sections =
                await Theme.getAvailableReactSectionsForSync();
            let settings_schema = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_schema.json',
                ),
            );
            let settings_data = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_data.json',
                ),
            );
            const pages = await Theme.generateAvailablePagesReact(true);
            const themeData = {
                name: options.name,
                available_sections,
                theme_type: 'react',
                version: '1.0.0',
                list: settings_data.list,
                preset: settings_data.preset,
                current: settings_data.current,
                global_schema: settings_schema,
                pages: pages,
            };

            const { data: theme } = await ThemeService.createTheme({
                ...configObj,
                ...themeData,
            });

            const context: any = {
                name: options.name,
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: theme._id,
                application_token: appConfig.token,
                theme_type: 'react',
            };

            Logger.info('Saving context');
            await createContext(context);
            await Theme.ensureThemeTypeInPackageJson();

            let packageJSON = await fs.readJSON(
                path.join(process.cwd(), 'package.json'),
            );
            packageJSON.name = Theme.sanitizeThemeName(options.name);
            await fs.writeJSON(`${process.cwd()}/package.json`, packageJSON, {
                spaces: 2,
            });
            const currentContext = getActiveContext();
            await Theme.syncReactTheme(currentContext);
            var b5 = Box(
                chalk.green.bold('DONE ') +
                    chalk.green.bold('Project ready\n') +
                    chalk.yellowBright.bold('NOTE ') +
                    chalk.green.bold(
                        'cd ' + targetDirectory + ' to continue ...',
                    ),
                {
                    padding: 1,
                    margin: 1,
                },
            );
            Logger.info(b5.toString());
        } catch (error) {
            Logger.error(error);
            // if (shouldDelete) await Theme.cleanUp(targetDirectory);
            // throw new CommandError(error.message, error.code);
        }
    }

    public static initTheme = async (options) => {
        let shouldDelete = false;
        let targetDirectory = '';
        let dir_name = 'default';
        try {
            let configObj = await Theme.selectCompanyAndStore();
            configObj = await Theme.selectTheme(configObj);
            const { data: appConfig } =
                await ConfigurationService.getApplicationDetails(configObj);

            Logger.info('Fetching Template Files');
            const { data: themeData } =
                await ThemeService.getThemeById(configObj);
            const themeName = themeData?.name || 'default';
            dir_name = Theme.sanitizeThemeName(themeName);
            targetDirectory = path.join(process.cwd(), dir_name);
            if (fs.existsSync(targetDirectory)) {
                shouldDelete = false;
                throw new CommandError(`Folder ${themeName}  already exists`);
            }

            Logger.info('Copying template config files');
            shouldDelete = true;
            if (themeData.theme_type === THEME_TYPE.react) {
                await Theme.copyTemplateFiles(
                    Theme.REACT_TEMPLATE_DIRECTORY,
                    targetDirectory,
                    true,
                );
            } else {
                await Theme.copyTemplateFiles(
                    Theme.TEMPLATE_DIRECTORY,
                    targetDirectory,
                );
            }

            let context: any = {
                name: themeName + '-' + Env.getEnvValue(),
                application_id: appConfig._id,
                domain: appConfig.domain.name,
                company_id: appConfig.company_id,
                theme_id: themeData._id,
                application_token: appConfig.token,
                theme_type: themeData.theme_type,
            };

            process.chdir(path.join('.', dir_name));
            let zipPath = path.join(
                targetDirectory,
                '.fdk',
                'archive',
                'archive.zip',
            );

            Logger.info('Downloading bundle file');
            await downloadFile(themeData.src, zipPath);

            Logger.info('Extracting bundle archive');
            await extractArchive({
                zipPath,
                destFolderPath: path.resolve(process.cwd()),
            });

            Logger.info('Generating Configuration Files');
            let list = _.get(themeData, 'config.list', []);
            let current = _.get(themeData, 'config.current', 'default');
            let preset = _.get(themeData, 'config.preset', {});
            try {
                await Theme.writeSettingJson(Theme.getSettingsDataPath(), {
                    list,
                    current,
                    preset,
                });
            } catch (error) {
                Logger.error({ error });
            }

            await Theme.writeSettingJson(
                Theme.getSettingsSchemaPath(),
                _.get(themeData, 'config.global_schema', { props: [] }),
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
                },
            );

            Logger.info('Saving context');
            await createContext(context);
            await Theme.ensureThemeTypeInPackageJson();

            Logger.info('Installing dependencies..');
            if (
                fs.existsSync(path.join(process.cwd(), 'theme', 'package.json'))
            ) {
                writeFile(
                    path.join(process.cwd(), 'package.json'),
                    fs.readFileSync(
                        path.join(process.cwd(), 'theme', 'package.json'),
                    ),
                );
                rimraf.sync(path.join(process.cwd(), 'theme', 'package.json'));
            }

            if (
                fs.existsSync(
                    path.join(process.cwd(), 'theme', 'webpack.config.js'),
                )
            ) {
                writeFile(
                    path.join(process.cwd(), 'webpack.config.js'),
                    fs.readFileSync(
                        path.join(process.cwd(), 'theme', 'webpack.config.js'),
                    ),
                );
                rimraf.sync(
                    path.join(process.cwd(), 'theme', 'webpack.config.js'),
                );
            }

            if (
                fs.existsSync(path.join(process.cwd(), 'theme', 'config.json'))
            ) {
                writeFile(
                    path.join(process.cwd(), 'config.json'),
                    fs.readFileSync(
                        path.join(process.cwd(), 'theme', 'config.json'),
                    ),
                );
                rimraf.sync(path.join(process.cwd(), 'theme', 'config.json'));
            }

            let spinner = new Spinner('Installing npm packages');
            try {
                spinner.start();
                await installNpmPackages();
                spinner.succeed();
            } catch (error) {
                spinner.fail();
                throw new CommandError(error.message);
            }
            let packageJSON = await fs.readJSON(
                path.join(process.cwd(), 'package.json'),
            );
            packageJSON.name = Theme.sanitizeThemeName(themeName);
            await fs.writeJSON(
                path.join(process.cwd(), 'package.json'),
                packageJSON,
                {
                    spaces: 2,
                },
            );
            if (!fs.existsSync(path.join(process.cwd(), THEME_ENTRY_FILE))) {
                Logger.info('Restructuring folder structure');
                let restructureSpinner = new Spinner(
                    'Restructuring folder structure',
                );
                try {
                    restructureSpinner.start();
                    this.restructTheme();
                    restructureSpinner.succeed();
                } catch (err) {
                    spinner.fail();
                    Logger.error(
                        'Failed restructuring: Please check your folder structure',
                    );
                    console.log(
                        chalk.red('Please check your folder structure'),
                    );
                }
            }
        } catch (error) {
            if (shouldDelete) await Theme.cleanUp(targetDirectory);
            throw new CommandError(error.message, error.code);
        }
    };
    public static syncThemeWrapper = async () => {
        const currentContext = getActiveContext();
        switch (currentContext.theme_type) {
            case THEME_TYPE.react:
                await Theme.syncReactTheme(currentContext);
                break;
            case THEME_TYPE.vue2:
                await Theme.syncVueTheme(currentContext);
                break;
            default:
                await Theme.syncVueTheme(currentContext);
                break;
        }
    };
    private static syncReactTheme = async (
        currentContext: ThemeContextInterface,
    ) => {
        try {
            await Theme.ensureThemeTypeInPackageJson();
            currentContext.domain
                ? Logger.warn('Syncing Theme to: ' + currentContext.domain)
                : Logger.warn('Please add domain to context');
            let { data: theme } =
                await ThemeService.getThemeById(currentContext);

          

            
            // Clear previosu builds
            Theme.clearPreviousBuild();

            // Create index.js with section file imports
            await Theme.createReactSectionsIndexFile();

            const buildPath = path.join(process.cwd(), Theme.BUILD_FOLDER);

            Logger.info('Creating theme source code zip file');
            // Remove temp source folder
            rimraf.sync(path.join(process.cwd(), Theme.SRC_FOLDER));
            await Theme.copyFolders(path.join(process.cwd()), Theme.SRC_FOLDER);
            await archiveFolder({
                srcFolder: Theme.SRC_FOLDER,
                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                zipFileName: Theme.ZIP_FILE_NAME,
            });
            // await Theme.copyReactThemeSourceToFdkFolder();

            Logger.info('Uploading theme source code zip file');
            let srcCdnUrl = await Theme.uploadThemeSrcZip();

            const imageCdnUrl = await Theme.getImageCdnBaseUrl();
            const assetBasePath = await Theme.getAssetCdnBaseUrl();

            Logger.info('Building Theme for Production...');
            await devReactBuild({
                buildFolder: Theme.BUILD_FOLDER,
                runOnLocal: false,
                assetBasePath,
                imageCdnUrl,
                isHMREnabled: false,
            });

            Logger.info('Uploading theme assets/images');
            await Theme.assetsImageUploader();

            Logger.info('Uploading theme assets/fonts');
            await Theme.assetsFontsUploader();
            
            let available_sections = await Theme.getAvailableReactSectionsForSync();
            
            await Theme.validateAvailableSections(available_sections);

            await Theme.validateSectionWithDB(theme.available_sections, available_sections);

            Logger.info('Uploading bundle files');
            let pArr = await Theme.uploadReactThemeBundle({ buildPath });
            let [cssUrls, umdJsUrls] = await Promise.all(pArr);

            Logger.info('Updating Available pages');
            const { allowedDefaultProps } =
                await Theme.updateAvailablePagesForReact();

            // Set new theme data
            const newTheme = await Theme.setThemeData(
                theme,
                cssUrls,
                'https://example-host.com/temp-common-js-file.js',
                umdJsUrls,
                srcCdnUrl,
                available_sections,
                allowedDefaultProps,
            );

            Logger.info('Updating theme');
            await ThemeService.updateTheme(newTheme);

            Logger.info('Theme syncing DONE');
            var b5 = Box(
                chalk.green.bold('Your Theme was pushed successfully\n') +
                    chalk.white('\n') +
                    chalk.white('View your theme:\n') +
                    chalk.green(
                        terminalLink(
                            '',
                            `https://${currentContext.domain}/?themeId=${currentContext.theme_id}&preview=true`,
                        ),
                    ) +
                    chalk.white('\n') +
                    chalk.white('\n') +
                    chalk.white('Customize this theme in Theme Editor:\n') +
                    chalk.green(
                        terminalLink(
                            '',
                            `${getPlatformUrls().platform}/company/${
                                currentContext.company_id
                            }/application/${
                                currentContext.application_id
                            }/themes/${
                                currentContext.theme_id
                            }/edit?preview=true`,
                        ),
                    ),
                {
                    padding: 1,
                    margin: 1,
                    borderColor: 'green',
                },
            );
            Logger.info(b5.toString());
        } catch (error) {
            Logger.error(error);
            throw new CommandError(error.message, error.code);
        } finally {
            rimraf.sync(path.join(process.cwd(), Theme.SRC_FOLDER));
        }
    };
    private static syncVueTheme = async (
        currentContext: ThemeContextInterface,
        isNew = false,
        buildData = undefined,
    ) => {
        try {
            await Theme.ensureThemeTypeInPackageJson();
            currentContext.domain
                ? Logger.warn('Syncing Theme to: ' + currentContext.domain)
                : Logger.warn('Please add domain to context');
            let { data: theme } =
                await ThemeService.getThemeById(currentContext);

            // Merge with latest platform config
            await Theme.matchWithLatestPlatformConfig(theme, isNew);
            if (!buildData) {
                Theme.clearPreviousBuild();
            }

            Logger.info('Reading Files');
            let themeContent: any = readFile(`${process.cwd()}/config.json`);

            try {
                themeContent = JSON.parse(themeContent);
            } catch (e) {
                throw new CommandError(`Invalid config.json`);
            }

            let available_sections = await Theme.getAvailableSectionsForSync();
            await Theme.validateAvailableSections(available_sections);
            await Theme.validateSectionWithDB(theme.available_sections, available_sections);
            
            // Create index.js with section file imports
            await Theme.createSectionsIndexFile(available_sections);

            let imageCdnUrl;
            let assetCdnUrl;
            let assetHash;

            if (buildData) {
                imageCdnUrl = buildData.imageCdnUrl;
                assetCdnUrl = buildData.assetCdnUrl;
                assetHash = buildData.assetHash;
            } else {
                imageCdnUrl = await Theme.getImageCdnBaseUrl();
                assetCdnUrl = await Theme.getAssetCdnBaseUrl();
                Theme.createVueConfig();
                assetHash = nanoid();
                Logger.info('Building Assets');
                // Building .js & .css bundles using vue-cli
                await build({
                    buildFolder: Theme.BUILD_FOLDER,
                    imageCdnUrl,
                    assetCdnUrl,
                    assetHash,
                });
            }
            // Check if build folder exists, as during build, vue fails with non-error code even when it errors out
            if (!fs.existsSync(path.join(process.cwd(), Theme.BUILD_FOLDER))) {
                throw new Error('Build Failed');
            }

            Logger.info('Uploading theme assets/images');
            await Theme.assetsImageUploader();

            Logger.info('Uploading theme assets/fonts');
            await Theme.assetsFontsUploader();

            // Remove temp source folder
            rimraf.sync(path.join(process.cwd(), Theme.SRC_FOLDER));
            Logger.info('Creating theme source code zip file');
            await Theme.copyFolders(path.join(process.cwd()), Theme.SRC_FOLDER);
            await archiveFolder({
                srcFolder: Theme.SRC_FOLDER,
                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                zipFileName: Theme.ZIP_FILE_NAME,
            });

            Logger.info('Uploading theme source code zip file');
            let srcCdnUrl = await Theme.uploadThemeSrcZip();

            Logger.info('Uploading bundle files');
            let pArr = await Theme.uploadThemeBundle({ assetHash });
            let [cssUrls, commonJsUrl, umdJsUrls] = await Promise.all(pArr);

            // extract page level settings schema
            Logger.info('Updating Available pages');
            const { pagesToSave, allowedDefaultProps } =
                await Theme.updateAvailablePages({
                    assetHash,
                });

            // Set new theme data
            const newTheme = await Theme.setThemeData(
                theme,
                cssUrls,
                commonJsUrl,
                umdJsUrls,
                srcCdnUrl,
                available_sections,
                allowedDefaultProps,
            );

            Logger.info('Updating theme');
            await ThemeService.updateTheme(newTheme);

            Logger.info('Theme syncing DONE');
            var b5 = Box(
                chalk.green.bold('Your Theme was pushed successfully\n') +
                    chalk.white('\n') +
                    chalk.white('View your theme:\n') +
                    chalk.green(
                        terminalLink(
                            '',
                            `https://${currentContext.domain}/?themeId=${currentContext.theme_id}&preview=true`,
                        ),
                    ) +
                    chalk.white('\n') +
                    chalk.white('\n') +
                    chalk.white('Customize this theme in Theme Editor:\n') +
                    chalk.green(
                        terminalLink(
                            '',
                            `${getPlatformUrls().platform}/company/${
                                currentContext.company_id
                            }/application/${
                                currentContext.application_id
                            }/themes/${
                                currentContext.theme_id
                            }/edit?preview=true`,
                        ),
                    ),
                {
                    padding: 1,
                    margin: 1,
                    borderColor: 'green',
                },
            );
            Logger.info(b5.toString());
        } catch (error) {
            throw new CommandError(error.message, error.code);
        } finally {
            rimraf.sync(path.join(process.cwd(), Theme.SRC_FOLDER));
        }
    };
    public static serveTheme = async (options) => {
        try {
            const currentContext = getActiveContext();
            switch (currentContext.theme_type) {
                case THEME_TYPE.react:
                    await Theme.serveReactTheme(options);
                    break;
                case THEME_TYPE.vue2:
                    await Theme.serveVueTheme(options);
                    break;
                default:
                    await Theme.serveVueTheme(options);
                    break;
            }
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    private static commonSetup = async (options) => {
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
                    `PORT: ${serverPort} is busy, Switching to PORT: ${port}`,
                ),
            );
        let { data: appInfo } =
            await ConfigurationService.getApplicationDetails();
        let domain = Array.isArray(appInfo.domains)
            ? `https://${appInfo.domains.filter((d) => d.is_primary)[0].name}`
            : `https://${appInfo.domain.name}`;

        // Todo: remove this, added for locally testing
        let host = getBaseURL();
        return {
            domain,
            port,
            host,
        };
    };
    public static serveVueTheme = async (options) => {
        try {
            const { port, domain, host } = await Theme.commonSetup(options);

            const isSSR =
                typeof options['ssr'] === 'boolean'
                    ? options['ssr']
                    : options['ssr'] == 'true'
                    ? true
                    : false;
            !isSSR ? Logger.warn('Disabling SSR') : null;

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
            Logger.info(chalk.bold.green(`Watching files for changes`));
            let watcher = chokidar.watch(path.resolve(process.cwd(), 'theme'), {
                persistent: true,
            });
            watcher.on('change', async () => {
                Logger.info(chalk.bold.green(`building`));
                await devBuild({
                    buildFolder: Theme.BUILD_FOLDER,
                    imageCdnUrl: urlJoin(
                        getFullLocalUrl(port),
                        'assets/images',
                    ),
                    isProd: isSSR,
                });
                reload();
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    public static serveReactTheme = async (options) => {
        try {
            const { port, domain, host } = await Theme.commonSetup(options);

            const isHMREnabled =
                typeof options['hmr'] === 'boolean'
                    ? options['hmr']
                    : options['hmr'] == 'true'
                    ? true
                    : false;

            // initial build
            Logger.info(`Locally building`);
            // Create index.js with section file imports
            await Theme.createReactSectionsIndexFile();

            await devReactBuild({
                buildFolder: Theme.BUILD_FOLDER,
                runOnLocal: true,
                localThemePort: port,
                isHMREnabled,
            });

            // start dev server
            Logger.info(chalk.bold.blueBright(`Starting server`));

            await startReactServer({
                domain,
                host,
                port,
                isHMREnabled,
            });

            Logger.info(chalk.bold.green(`Watching files for changes`));
            devReactWatch(
                {
                    buildFolder: Theme.BUILD_FOLDER,
                    runOnLocal: true,
                    localThemePort: port,
                    isHMREnabled,
                },
                () => {
                    Logger.info(chalk.bold.green(`reloading`));
                    reload();
                },
            );

            // open browser
            Logger.info(chalk.bold.green(`opening browser here`));
            await open(getFullLocalUrl(port));
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
            const zipFilePath = path.join(
                process.cwd(),
                './.fdk/pull-archive.zip',
            );
            await downloadFile(theme.src, zipFilePath);
            await extractArchive({
                zipPath: path.resolve(process.cwd(), './.fdk/pull-archive.zip'),
                destFolderPath: path.resolve(process.cwd()),
            });
            await fs.writeJSON(
                path.join(process.cwd(), '/config.json'),
                { theme: _.pick(theme, ['colors', 'styles', 'font']) },
                {
                    spaces: 2,
                },
            );
            let list = _.get(theme, 'config.list', []);
            let current = _.get(theme, 'config.current', 'default');
            let preset = _.get(theme, 'config.preset', {});
            await Theme.writeSettingJson(Theme.getSettingsDataPath(), {
                list,
                current,
                preset,
            });
            await Theme.writeSettingJson(
                Theme.getSettingsSchemaPath(),
                _.get(theme, 'config.global_schema', { props: [] }),
            );
            const packageJSON = await fs.readJSON(
                process.cwd() + '/package.json',
            );
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
    public static pullThemeConfig = async () => {
        try {
            const { data: theme } = await ThemeService.getThemeById(null);
            const { config } = theme;
            const newConfig: any = {};
            if (config) {
                newConfig.list = config.list;
                newConfig.current = config.current;
                newConfig.preset = config.preset;
            }
            await Theme.writeSettingJson(
                Theme.getSettingsDataPath(),
                newConfig,
            );
            Theme.createVueConfig();
            Logger.info('Config updated successfully');
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    };
    // private methods
    private static async copyTemplateFiles(
        templateDirectory,
        targetDirectory,
        isReactTheme?,
    ) {
        try {
            createDirectory(targetDirectory);
            if (isReactTheme) {
                await fs.copy(templateDirectory, targetDirectory);
            }
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
                .filter((o) => o != 'index.js');
        } catch (err) {}
        let settings = sectionsFiles.map((f) => {
            return Theme.extractSettingsFromFile(
                `${Theme.TEMPLATE_DIRECTORY}/theme/sections/${f}`,
            );
        });
        return settings;
    }
    private static async getAvailableSectionsForSync() {
        let sectionsFiles = fs
            .readdirSync(`${process.cwd()}/theme/sections`)
            .filter((o) => o != 'index.js');
        let settings = sectionsFiles.map((f) => {
            return Theme.extractSettingsFromFile(
                `${process.cwd()}/theme/sections/${f}`,
            );
        });
        return settings;
    }
    private static async getAvailableReactSectionsForSync() {
        const sectionPath = path.resolve(
            process.cwd(),
            Theme.BUILD_FOLDER,
            'sections/sections.commonjs.js',
        );

        const imported = require(sectionPath)?.sections?.default;

        if (!imported) {
            Logger.error('Error occured');
        }

        const allSections = Object.entries<{ settings: any; Component: any }>(
            imported,
        ).map(([name, sectionModule]) => ({
            name,
            ...(sectionModule.settings || {}),
        }));

        return allSections;
    }
    private static extractSettingsFromFile(path) {
        try {
            let $ = cheerio.load(readFile(path));
            let settingsText = $('settings').text();

            try {
                return settingsText ? JSON.parse(settingsText) : {};
            } catch (err) {
                throw new Error(
                    `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
                );
            }
        } catch (error) {
            throw new Error(
                `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
            );
        }
    }

    private static extractSettingsFromReactFile(path: string) {
        try {
            const data = findExportedVariable(path, 'settings');
            try {
                const settings = JSON.parse(data);
                return settings || {};
            } catch (error) {
                Logger.error(error);
                throw new Error(
                    `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
                );
            }
        } catch (error) {
            throw new Error(
                `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
            );
        }
    }
    private static extractSectionsFromReactFile(path: string) {
        try {
            const data = findExportedVariable(path, 'sections');
            try {
                const settings = JSON.parse(data);
                return settings || {};
            } catch (error) {
                Logger.error(error);
                throw new Error(
                    `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
                );
            }
        } catch (error) {
            throw new Error(
                `Invalid settings JSON object in ${path}. Validate JSON from https://jsonlint.com/`,
            );
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
                throw new Error(
                    `Duplication section name found. ${section.name}`,
                );
            }
            sectionNamesObject[`${section.name}`] = true;
        });
        return available_sections;
    }
    private static async createSectionsIndexFile(available_sections) {
        available_sections = available_sections || [];
        let fileNames = fs
            .readdirSync(`${process.cwd()}/theme/sections`)
            .filter((o) => o != 'index.js');
        let template = `
            ${fileNames
                .map((f, i) => `import * as component${i} from './${f}';`)
                .join('\n')}
            function exportComponents(components) {
            return [
                ${available_sections
                    .map((s, i) => {
                        return JSON.stringify({
                            name: s.name,
                            label: s.label,
                            component: '',
                        }).replace(
                            '"component":""',
                            `"component": components[${i}].default`,
                        );
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
    private static async createReactSectionsIndexFile() {
        let fileNames = fs
            .readdirSync(`${process.cwd()}/theme/sections`)
            .filter((o) => o != 'index.js');

        const importingTemplate = fileNames
            .map((fileName) => {
                const [SectionName] = transformSectionFileName(fileName);
                return `import * as ${SectionName} from './${fileName}';`;
            })
            .join('\n');

        const exportingTemplate = `export default {
            ${fileNames.map((fileName) => {
                const [SectionName, sectionKey] =
                    transformSectionFileName(fileName);
                return `'${sectionKey}': { ...${SectionName}, },`;
            }).join(`
            `)}
        }`;

        const content = importingTemplate + '\n\n' + exportingTemplate;

        rimraf.sync(`${process.cwd()}/theme/sections/index.js`);
        fs.writeFileSync(`${process.cwd()}/theme/sections/index.js`, content);
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
        const spinner = new Spinner('Cleaning up theme data');
        try {
            Logger.error('Cleaning up');
            spinner.start();
            if (fs.existsSync(targetDirectory)) {
                if (
                    fs.existsSync(
                        `${path.join(targetDirectory, '.fdk', 'context.json')}`,
                    )
                ) {
                    const contexts = await fs.readJSON(
                        `${path.join(targetDirectory, '.fdk', 'context.json')}`,
                    );
                    const activeContext = contexts.theme.active_context;
                    await ThemeService.deleteThemeById(
                        contexts.theme.contexts[activeContext],
                    );
                }
                rimraf.sync(targetDirectory);
            }
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message);
        }
    }
    private static sanitizeThemeName = (name) => {
        return name.replace(/ /g, '_');
    };
    private static unSanitizeThemeName = (name) => {
        return name.replace(/_/g, ' ');
    };
    private static getSettingsData = (theme) => {
        let newConfig;

        if (theme.config) {
            newConfig = {};
            newConfig.list = theme.config.list;
            newConfig.current = theme.config.current;
            newConfig.preset = theme.config.preset;
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
                throw new CommandError(
                    `vue.config.js is not supported, move its file content to fdk.config.js`,
                    ErrorCodes.NOT_KNOWN.code,
                );
            } else {
                fs.renameSync(oldVueConfigPath, fdkConfigPath);
                Logger.info('Renamed file from vue.config.js to fdk.config.js');
            }
        }
        rimraf.sync(path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH));
        if (!fs.existsSync(path.join(process.cwd(), '.fdk'))) {
            fs.mkdirSync('.fdk');
        }
        fs.writeFileSync(
            path.join(process.cwd(), Theme.VUE_CLI_CONFIG_PATH),
            themeVueConfigTemplate,
        );
        rimraf.sync(path.join(process.cwd(), Theme.SETTING_LOADER_FILE));
        fs.writeFileSync(
            path.join(process.cwd(), Theme.SETTING_LOADER_FILE),
            settingLoader,
        );
    }

    private static assetsImageUploader = async () => {
        try {
            const cwd = path.resolve(
                process.cwd(),
                Theme.BUILD_FOLDER,
                'assets',
                'images',
            );
            const images = glob.sync(path.join('**', '**.**'), { cwd });
            await asyncForEach(images, async (img) => {
                const assetPath = path.join(
                    process.cwd(),
                    Theme.BUILD_FOLDER,
                    'assets',
                    'images',
                    img,
                );
                await UploadService.uploadFile(
                    assetPath,
                    'application-theme-images',
                );
            });
        } catch (err) {
            throw new CommandError(
                err.message || `Failed to upload assets/images`,
                err.code,
            );
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
                await UploadService.startUpload(
                    startData,
                    'application-theme-images',
                )
            ).data;
            return (imageCdnUrl = path.dirname(startAssetData.cdn.url));
        } catch (err) {
            Logger.error(err);
            throw new CommandError(
                `Failed in getting image CDN base url`,
                err.code,
            );
        }
    };

    private static getAssetCdnBaseUrl = async () => {
        let assetCdnUrl = '';
        try {
            if (
                fs.existsSync(
                    path.join(process.cwd(), 'theme', 'assets', 'fonts'),
                )
            ) {
                let startData = {
                    file_name: 'test.ttf',
                    content_type: 'font/ttf',
                    size: '10',
                };
                let startAssetData = (
                    await UploadService.startUpload(
                        startData,
                        'application-theme-assets',
                    )
                ).data;
                return (assetCdnUrl = path.dirname(startAssetData.cdn.url));
            }
            return assetCdnUrl;
        } catch (err) {
            throw new CommandError(
                `Failed in getting assets CDN base url`,
                err.code,
            );
        }
    };
    private static assetsFontsUploader = async () => {
        try {
            if (
                fs.existsSync(
                    path.join(
                        process.cwd(),
                        Theme.BUILD_FOLDER,
                        'assets',
                        'fonts',
                    ),
                )
            ) {
                const cwd = path.join(
                    process.cwd(),
                    Theme.BUILD_FOLDER,
                    'assets',
                    'fonts',
                );
                const fonts = glob.sync('**/**.**', { cwd });
                await asyncForEach(fonts, async (font) => {
                    const assetPath = path.join(
                        Theme.BUILD_FOLDER,
                        'assets',
                        'fonts',
                        font,
                    );
                    await UploadService.uploadFile(
                        assetPath,
                        'application-theme-assets',
                    );
                });
            }
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    private static copyThemeSourceToFdkFolder = async () => {
        try {
            await fs.copy(
                path.join(process.cwd(), 'theme'),
                path.join(process.cwd(), Theme.SRC_FOLDER),
            );
            fs.copyFileSync(
                path.join(process.cwd(), 'package.json'),
                path.join(process.cwd(), Theme.SRC_FOLDER, 'package.json'),
            );
            await archiveFolder({
                srcFolder: Theme.SRC_FOLDER,
                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                zipFileName: Theme.ZIP_FILE_NAME,
            });
        } catch (err) {
            throw new CommandError(
                `Failed to copying theme files to .fdk folder`,
            );
        }
    };

    private static copyReactThemeSourceToFdkFolder = async () => {
        try {
            await fs.copy(
                path.join(process.cwd(), 'theme'),
                path.join(process.cwd(), Theme.SRC_FOLDER),
            );
            fs.copyFileSync(
                path.join(process.cwd(), 'package.json'),
                path.join(process.cwd(), Theme.SRC_FOLDER, 'package.json'),
            );

            if (fs.existsSync(path.join(process.cwd(), 'webpack.config.js'))) {
                fs.copyFileSync(
                    path.join(process.cwd(), 'webpack.config.js'),
                    path.join(
                        process.cwd(),
                        Theme.SRC_FOLDER,
                        'webpack.config.js',
                    ),
                );
            }
            if (fs.existsSync(path.join(process.cwd(), 'config.json'))) {
                fs.copyFileSync(
                    path.join(process.cwd(), 'config.json'),
                    path.join(process.cwd(), Theme.SRC_FOLDER, 'config.json'),
                );
            }

            await archiveFolder({
                srcFolder: Theme.SRC_FOLDER,
                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                zipFileName: Theme.ZIP_FILE_NAME,
            });
        } catch (err) {
            throw new CommandError(
                `Failed to copying theme files to .fdk folder`,
            );
        }
    };

    private static validateAvailableSections = async (available_sections) => {
        try {
            Logger.info('Validating Files');
            available_sections =
                await Theme.validateSections(available_sections);
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };
    private static uploadReactThemeBundle = async ({ buildPath }) => {
        try {
            const buildFiles = fs.readdirSync(buildPath);
            const cdnFiles = await Promise.all(
                buildFiles.reduce((promises, fileName) => {
                    const filepath = path.join(buildPath, fileName);
                    const { extension, componentName } =
                        parseBundleFilename(fileName);
                    if (!['js', 'css'].includes(extension)) {
                        return promises;
                    }
                    const promise = UploadService.uploadFile(
                        filepath,
                        'application-theme-assets',
                    ).then((response) => ({
                        fileName,
                        extension,
                        componentName,
                        cdnURL: response.complete.cdn.absolute_url,
                    }));
                    return [...promises, promise];
                }, []),
            );

            // update theme
            const cssLinks = [];
            const jsLinks = [];
            cdnFiles.forEach((current) => {
                const { extension, cdnURL } = current;
                if (extension === 'css') {
                    cssLinks.push(cdnURL);
                } else if (extension === 'js') {
                    jsLinks.push(cdnURL);
                }
            });
            return [cssLinks, jsLinks];
        } catch (err) {
            throw new CommandError(
                err.message || `Failed to upload theme bundle `,
                err.code,
            );
        }
    };
    private static uploadThemeBundle = async ({ assetHash }) => {
        try {
            Logger.info('Uploading commonJS');
            const commonJS = `${assetHash}_themeBundle.common.js`;
            const commonJsUrlRes = await UploadService.uploadFile(
                path.join(process.cwd(), Theme.BUILD_FOLDER, commonJS),
                'application-theme-assets',
            );
            const commonJsUrl = commonJsUrlRes.start.cdn.url;

            Logger.info('Uploading umdJS');
            const umdMinAssets = glob.sync(
                path.join(
                    process.cwd(),
                    Theme.BUILD_FOLDER,
                    `${assetHash}_themeBundle.umd.min.**.js`,
                ),
            );
            umdMinAssets.push(
                path.join(
                    process.cwd(),
                    Theme.BUILD_FOLDER,
                    `${assetHash}_themeBundle.umd.min.js`,
                ),
            );
            const umdJSPromisesArr = umdMinAssets.map((asset) => {
                const assetPath = asset;
                return UploadService.uploadFile(
                    assetPath,
                    'application-theme-assets',
                );
            });
            const umdJsUrls = await Promise.all(umdJSPromisesArr);
            Logger.info('Uploading css');
            let cssAssests = glob.sync(
                path.join(process.cwd(), Theme.BUILD_FOLDER, '**.css'),
            );
            let cssPromisesArr = cssAssests.map((asset) => {
                return UploadService.uploadFile(
                    asset,
                    'application-theme-assets',
                );
            });
            const cssUrls = await Promise.all(cssPromisesArr);
            return [
                cssUrls.map((res) => res.start.cdn.url),
                commonJsUrl,
                umdJsUrls.map((res) => res.start.cdn.url),
            ];
        } catch (err) {
            throw new CommandError(
                err.message || `Failed to upload theme bundle `,
                err.code,
            );
        }
    };
    private static setThemeData = async (
        theme,
        cssUrls,
        commonJsUrl,
        umdJsUrls,
        srcCdnUrl,
        available_sections,
        allowedDefaultProps,
    ) => {
        // Need to Verify The Use of These Four Values
        // desktopImages,
        //iosImages
        // androidImages,
        // thumbnailImages,
        try {
            let themeContent: any = readFile(
                path.join(process.cwd(), 'config.json'),
            );
            let packageJSON = JSON.parse(
                readFile(path.join(process.cwd(), 'package.json')),
            );
            if (!packageJSON.name) {
                throw new Error('package.json name can not be empty');
            }
            theme.src = srcCdnUrl;
            // TODO: clean up backward compatibility
            theme.assets = theme.assets || {};
            theme.assets.umd_js = theme.assets.umdJs || {};
            theme.assets.umd_js.links = umdJsUrls;
            theme.assets.umd_js.link = '';
            theme.assets.common_js = theme.assets.commonJs || {};
            theme.assets.common_js.link = commonJsUrl;
            // - start for backward compatibility, will be removed
            theme.assets.umdJs = theme.assets.umdJs || {};
            theme.assets.umdJs.links = umdJsUrls;
            theme.assets.umdJs.link = '';
            theme.assets.umd_js = theme.assets.umdJs || {};
            theme.assets.umd_js.links = umdJsUrls;
            theme.assets.umd_js.link = '';
            theme.assets.commonJs = theme.assets.commonJs || {};
            theme.assets.commonJs.link = commonJsUrl;
            theme.assets.common_js = theme.assets.commonJs || {};
            theme.assets.common_js.link = commonJsUrl;
            theme.assets.css = theme.assets.css || {};
            if (theme.theme_type === THEME_TYPE.react) {
                theme.assets.css.links = cssUrls; // theme_type = 'react'
            } else {
                theme.assets.css.links = cssUrls.filter((x) =>
                    x.endsWith('_themeBundle.css'),
                );
            }
            theme.assets.css.link = '';
            // TODO Issue here
            theme = {
                ...theme,
                ...themeContent.theme,
                available_sections,
            };
            _.set(theme, 'name', Theme.unSanitizeThemeName(packageJSON.name));
            let globalConfigSchema = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_schema.json',
                ),
            );
            let globalConfigData = await fs.readJSON(
                path.join(
                    process.cwd(),
                    'theme',
                    'config',
                    'settings_data.json',
                ),
            );
            theme.config = theme.config || {};
            theme.config.global_schema = globalConfigSchema;
            theme.config.current = globalConfigData.current || 'default';

            // Modify list to update deleted page's prop
            let newList = globalConfigData.list;
            if (
                globalConfigData.list &&
                Object.keys(allowedDefaultProps).length > 0
            ) {
                newList = globalConfigData.list.map((listItem) => {
                    if (!listItem.page) return listItem;

                    // delete extra props from all list (Default, Blue, Dark)
                    listItem.page.forEach((pageData) => {
                        // allowedDefaultProps object have deleted page name as key
                        // If current page is not deleted page, then no changes needed
                        if (!allowedDefaultProps[pageData.page])
                            return pageData;

                        Object.keys(pageData.settings.props).forEach((prop) => {
                            if (
                                !allowedDefaultProps[pageData.page].includes(
                                    prop,
                                )
                            ) {
                                delete pageData.settings.props[prop];
                            }
                        });
                    });
                    return listItem;
                });
            }
            theme.config.list = newList;
            theme.config.preset = globalConfigData.preset || [];
            theme.version = packageJSON.version;
            theme.customized = true;
            theme.is_private = true;
            return theme;
        } catch (err) {
            throw new CommandError(`Failed to set theme data `);
        }
    };
    // Remove extra param "newTheme"
    private static updateAvailablePages = async ({ assetHash }) => {
        const spinner = new Spinner('Adding/updating available pages');
        try {
            spinner.start();
            // Get all available pages before syncing
            const allPages = (await ThemeService.getAllAvailablePage()).data
                .pages;
            // All available System page
            const systemPagesDB = allPages.filter((x) => x.type == 'system');
            // All available Custom page
            const customPagesDB = allPages.filter((x) => x.type == 'custom');
            const pagesToSave = [];

            // extract system page level settings schema
            let systemPagesLocally = fs
                .readdirSync(
                    path.join(process.cwd(), 'theme', 'templates', 'pages'),
                )
                .filter((o) => o != 'index.js');

            // Check if any themefied system page is empty or not
            await asyncForEach(systemPagesLocally, async (fileName) => {
                let $ = cheerio.load(
                    readFile(
                        path.join(
                            process.cwd(),
                            'theme',
                            'templates',
                            'pages',
                            fileName,
                        ),
                    ),
                );
                let templateText = $('template').text();

                if (!templateText) {
                    throw new CommandError(
                        `${path.join(
                            'theme',
                            'templates',
                            'pages',
                            fileName,
                        )} file is empty. Either delete this page OR themefy it accordingly`,
                        ErrorCodes.NOT_KNOWN.code,
                    );
                }
            });

            await asyncForEach(systemPagesLocally, async (fileName) => {
                let pageName = fileName.replace('.vue', '');
                // SYSTEM Pages
                let systemPage = systemPagesDB.find((p) => p.value == pageName);

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
                    systemPage = (
                        await ThemeService.createAvailabePage(pageData)
                    ).data;
                }

                // Get page settings props
                systemPage.props =
                    (
                        Theme.extractSettingsFromFile(
                            path.join(
                                process.cwd(),
                                'theme',
                                'templates',
                                'pages',
                                fileName,
                            ),
                        ) || {}
                    ).props || [];

                // Check if any section tag available in file
                systemPage.sections_meta = Theme.extractSectionsFromFile(
                    path.join(
                        process.cwd(),
                        'theme',
                        'templates',
                        'pages',
                        fileName,
                    ),
                );
                // set page type to system page
                systemPage.type = 'system';
                pagesToSave.push(systemPage);
            });

            // remove .vue from file name
            const allLocalSystemPageNames = systemPagesLocally.map((name) =>
                name.replace('.vue', ''),
            );
            // Delete system pages that were available before sync but now deleted
            const systemPagesToDelete = systemPagesDB.filter(
                (x) => !allLocalSystemPageNames.includes(x.value),
            );

            const allowedDefaultProps = {};

            if (systemPagesToDelete.length > 0) {
                // Reseting props in system pages

                // Get default values of all deleted system pages
                const default_props_arr = await Promise.all(
                    systemPagesToDelete.map((page) =>
                        ThemeService.getDefaultPageDetails(page.value),
                    ),
                );

                const default_props = {};

                // Create object with page value as a `key` and page details as `value`
                default_props_arr.forEach((res) => {
                    default_props[res.data.value] = res.data;
                });

                /**
                 * Update deleted page props with default props. Also filter out
                 * default props from existing props to keep current values intact
                 */
                await Promise.all(
                    systemPagesToDelete.map(async (page) => {
                        // To fetch deleted system page details
                        const { data: deletedPage } =
                            await ThemeService.getAvailablePage(page.value);

                        // default page values for a system page
                        const defaultPage = default_props[page.value];
                        if (defaultPage) {
                            allowedDefaultProps[defaultPage.value] =
                                deletedPage.props.map((prop) => {
                                    // If both `id` and `type` values match for current prop and default prop we will confirm this is a default prop
                                    for (
                                        let i = 0;
                                        i < defaultPage.props.length;
                                        i++
                                    ) {
                                        if (
                                            prop.id ===
                                                defaultPage.props[i].id &&
                                            prop.type ===
                                                defaultPage.props[i].type
                                        )
                                            return prop.id;
                                    }
                                });
                            return ThemeService.updateAvailablePage(
                                defaultPage,
                            );
                        } else {
                            // show something in CLI
                        }
                    }),
                );
            }

            // extract custom page level settings schema
            const bundleFiles = await fs.readFile(
                path.join(
                    Theme.BUILD_FOLDER,
                    `${assetHash}_themeBundle.common.js`,
                ),
                'utf-8',
            );
            let customTemplates = [];
            const themeBundle = evaluateModule(bundleFiles);
            if (themeBundle && themeBundle.getCustomTemplates) {
                customTemplates = themeBundle.getCustomTemplates();
            }
            const customFiles = {};
            let settingProps;
            const customRoutes = (ctTemplates, parentKey = null) => {
                for (let key in ctTemplates) {
                    const routerPath =
                        (parentKey && `${parentKey}/${key}`) || `c/${key}`;
                    const value = routerPath.replace(/\//g, ':::');
                    if (
                        ctTemplates[key].component &&
                        ctTemplates[key].component.__settings
                    ) {
                        settingProps =
                            ctTemplates[key].component.__settings.props;
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
            const pagesToDelete = customPagesDB.filter(
                (x) => !customFiles[x.value],
            );
            await Promise.all(
                pagesToDelete.map((page) => {
                    return ThemeService.deleteAvailablePage(page.value);
                }),
            );
            for (let key in customFiles) {
                const customPageConfig = customFiles[key];
                let customPage = customPagesDB.find((p) => p.value == key);
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
                    customPage = (
                        await ThemeService.createAvailabePage(pageData)
                    ).data;
                }
                customPage.props = customPageConfig.fileSetting || [];
                customPage.sections_meta = [];
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
    private static updateAvailablePagesForReact = async () => {
        const spinner = new Spinner('Adding/updating available pages');
        try {
            spinner.start();
            const allPages = (await ThemeService.getAllAvailablePage()).data
                .pages;
            const systemPagesDB = allPages.filter((x) => x.type == 'system');
            const customPagesDB = allPages.filter((x) => x.type == 'custom');
            const pagesToSave = [];

            // extract system page level settings schema
            let systemPages = fs
                .readdirSync(path.join(process.cwd(), 'theme', 'pages'))
                .filter((o) => o != 'index.jsx');
            await asyncForEach(systemPages, async (fileName) => {
                let pageName = fileName.replace('.jsx', '');
                // SYSTEM Pages
                let systemPage = systemPagesDB.find((p) => p.value == pageName);
                if (!systemPage) {
                    const pageData = {
                        value: pageName,
                        props: [],
                        sections: [],
                        sections_meta: [],
                        type: 'system',
                        text: pageNameModifier(pageName),
                    };
                    try {
                        systemPage = (
                            await ThemeService.createAvailabePage(pageData)
                        ).data;
                    } catch (error) {
                        systemPage = {};
                        Logger.error(error);
                    }
                }
                systemPage.props =
                    Theme.extractSettingsFromReactFile(
                        path.join(process.cwd(), 'theme', 'pages', fileName),
                    ).props ||
                    [] ||
                    [];
                systemPage.sections_meta =
                    Theme.extractSectionsFromReactFile(
                        path.join(process.cwd(), 'theme', 'pages', fileName),
                    ) ||
                    [] ||
                    [];

                systemPage.type = 'system';
                pagesToSave.push(systemPage);
            });

            // remove .jsx from file name
            const allLocalSystemPageNames = systemPages.map((name) =>
                name.replace('.jsx', ''),
            );

            // Delete system pages that were available before sync but now deleted
            const systemPagesToDelete = systemPagesDB.filter(
                (x) => !allLocalSystemPageNames.includes(x.value),
            );

            const allowedDefaultProps = {};

            if (systemPagesToDelete.length > 0) {
                // Reseting props in system pages

                // Get default values of all deleted system pages
                const default_props_arr = await Promise.all(
                    systemPagesToDelete.map((page) =>
                        ThemeService.getDefaultPageDetails(page.value),
                    ),
                );

                const default_props = {};

                // Create object with page value as a `key` and page details as `value`
                default_props_arr.forEach((res) => {
                    default_props[res.data.value] = res.data;
                });

                /**
                 * Update deleted page props with default props. Also filter out
                 * default props from existing props to keep current values intact
                 */
                await Promise.all(
                    systemPagesToDelete.map(async (page) => {
                        // To fetch deleted system page details
                        const { data: deletedPage } =
                            await ThemeService.getAvailablePage(page.value);

                        // default page values for a system page
                        const defaultPage = default_props[page.value];
                        if (defaultPage) {
                            allowedDefaultProps[defaultPage.value] =
                                deletedPage.props.map((prop) => {
                                    // If both `id` and `type` values match for current prop and default prop we will confirm this is a default prop
                                    for (
                                        let i = 0;
                                        i < defaultPage.props.length;
                                        i++
                                    ) {
                                        if (
                                            prop.id ===
                                                defaultPage.props[i].id &&
                                            prop.type ===
                                                defaultPage.props[i].type
                                        )
                                            return prop.id;
                                    }
                                });
                            return ThemeService.updateAvailablePage(
                                defaultPage,
                            );
                        } else {
                            // show something in CLI
                        }
                    }),
                );
            }

            const sectionPath = path.resolve(
                process.cwd(),
                Theme.BUILD_FOLDER,
                'custom-templates/custom-templates.commonjs.js',
            );

            const customTemplates =
                require(sectionPath)?.customTemplates?.default;
            if (!customTemplates) {
                Logger.error('Custom Templates Not Available');
            }

            const customFiles = {};
            const customRoutes = (ctTemplates, parentKey = null) => {
                for (let key in ctTemplates) {
                    let settingProps;
                    const routerPath =
                        (parentKey && `${parentKey}/${key}`) || `c/${key}`;
                    const value = routerPath.replace(/\//g, ':::');
                    if (ctTemplates[key].settings) {
                        settingProps = ctTemplates[key].settings.props;
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
            const pagesToDelete = customPagesDB.filter(
                (x) => !customFiles[x.value],
            );
            await Promise.all(
                pagesToDelete.map((page) => {
                    return ThemeService.deleteAvailablePage(page.value);
                }),
            );
            for (let key in customFiles) {
                const customPageConfig = customFiles[key];
                let customPage = customPagesDB.find((p) => p.value == key);
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
                    customPage = (
                        await ThemeService.createAvailabePage(pageData)
                    ).data;
                }
                customPage.props = customPageConfig.fileSetting || [];
                customPage.sections_meta = [];
                customPage.type = 'custom';
                pagesToSave.push(customPage);
            }
            await ThemeService.updateAllAvailablePages({ pages: pagesToSave });
            spinner.succeed();
            return { pagesToSave, allowedDefaultProps };
        } catch (err) {
            spinner.fail();
            throw new CommandError(err.message, err.code);
        }
    };
    private static uploadThemeSrcZip = async () => {
        const zipFilePath = path.join(
            process.cwd(),
            Theme.SRC_ARCHIVE_FOLDER,
            Theme.ZIP_FILE_NAME,
        );
        try {
            let res = await UploadService.uploadFile(
                zipFilePath,
                'application-theme-src',
            );
            return res.start.cdn.url;
        } catch (err) {
            throw new CommandError(
                err.message || `Failed to upload src folder`,
                err.code,
            );
        }
    };

    private static matchWithLatestPlatformConfig = async (theme, isNew) => {
        try {
            const newConfig = Theme.getSettingsData(theme);
            const oldConfig = await Theme.readSettingsJson(
                Theme.getSettingsDataPath(),
            );
            const questions = [
                {
                    type: 'confirm',
                    name: 'pullConfig',
                    message: 'Do you wish to pull config from remote?',
                },
            ];
            if (!isNew && !_.isEqual(newConfig, oldConfig)) {
                await inquirer.prompt(questions).then(async (answers) => {
                    if (answers.pullConfig) {
                        await Theme.writeSettingJson(
                            Theme.getSettingsDataPath(),
                            newConfig,
                        );
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

    public static previewTheme = async () => {
        const currentContext = getActiveContext();
        try {
            await open(
                `https://${currentContext.domain}/?themeId=${currentContext.theme_id}&preview=true&upgrade=true`,
            );
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };
    public static copyFolders = async (from, to) => {
        try {
            await fs.mkdir(to);
            const files = await fs.readdir(from);
            const nonHiddenFiles = files.filter(
                (file) => !file.startsWith('.'),
            );

            for (let j = 0; j < nonHiddenFiles.length; j++) {
                const element = nonHiddenFiles[j];
                if (element === 'temp-theme') {
                    return;
                } else if (
                    fs.lstatSync(path.join(from, element)).isFile() &&
                    element != 'node_modules' &&
                    element != '.fdk'
                ) {
                    fs.copyFile(
                        path.join(from, element),
                        path.join(to, element),
                    );
                } else if (
                    fs.lstatSync(path.join(from, element)).isDirectory() &&
                    element != 'node_modules' &&
                    element != '.fdk'
                ) {
                    await Theme.copyFolders(
                        path.join(from, element),
                        path.join(to, element),
                    );
                }
            }
            // nonHiddenFiles.forEach( element => {
            //     if (element === 'temp-theme') {
            //         return;
            //     } else if (
            //         fs.lstatSync(path.join(from, element)).isFile() &&
            //         element != 'node_modules' &&
            //         element != '.fdk'
            //     ) {
            //         fs.copyFile(path.join(from, element), path.join(to, element));
            //     } else if (
            //         fs.lstatSync(path.join(from, element)).isDirectory() &&
            //         element != 'node_modules' &&
            //         element != '.fdk'
            //     ) {
            //       await Theme.copyFolders(path.join(from, element), path.join(to, element));
            //     }
            // });
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    public static generateAssetsVue = async () => {
        Theme.clearPreviousBuild();
        let available_sections = await Theme.getAvailableSectionsForSync();
        await Theme.validateAvailableSections(available_sections);
        const imageCdnUrl = await Theme.getImageCdnBaseUrl();
        const assetCdnUrl = await Theme.getAssetCdnBaseUrl();
        Theme.createVueConfig();
        const assetHash = nanoid();
        Logger.info('Building Assets for Vue Theme');
        // Building .js & .css bundles using vue-cli
        await build({
            buildFolder: Theme.BUILD_FOLDER,
            imageCdnUrl,
            assetCdnUrl,
            assetHash,
        });
        let pArr = await Theme.uploadThemeBundle({ assetHash });
        let [cssUrls, commonJsUrl, umdJsUrls] = await Promise.all(pArr);

        // tech debt: need to add this as a part of config.json file
        const assetsPath = path.join(process.cwd(), 'assets.json');
        const assetsData = {
            assets: {
                umd_js: {
                    links: umdJsUrls,
                },
                common_js: {
                    link: commonJsUrl,
                },
                css: {
                    links: cssUrls,
                },
            },
            available_sections: available_sections,
        };
        await fs.writeJson(assetsPath, assetsData, { spaces: 2 });
        await Theme.generateAvailablePages(assetHash);
    };

    public static generateAssetsReact = async () => {
        Theme.clearPreviousBuild();

        const imageCdnUrl = await Theme.getImageCdnBaseUrl();
        const assetCdnUrl = await Theme.getAssetCdnBaseUrl();

        Logger.info('Building Assets for React Theme');
        await devReactBuild({
            buildFolder: Theme.BUILD_FOLDER,
            runOnLocal: false,
            assetBasePath: assetCdnUrl,
            imageCdnUrl,
            isHMREnabled: false,
        });

        await Theme.createReactSectionsIndexFile();
        let available_sections = await Theme.getAvailableReactSectionsForSync();
        await Theme.validateAvailableSections(available_sections);

        const buildPath = path.join(process.cwd(), Theme.BUILD_FOLDER);
        let pArr = await Theme.uploadReactThemeBundle({ buildPath });

        let [cssUrls, umdJsUrls] = await Promise.all(pArr);

        // tech debt: need to add this as a part of config.json file
        const assetsPath = path.join(process.cwd(), 'assets.json');
        const assetsData = {
            assets: {
                umd_js: {
                    links: umdJsUrls,
                },
                common_js: {
                    link: '',
                },
                css: {
                    links: cssUrls,
                },
            },
            available_sections: available_sections,
        };
        await fs.writeJson(assetsPath, assetsData, { spaces: 2 });
        await Theme.generateAvailablePagesReact();
    };

    public static generateAvailablePages = async (
        assetHash,
        isCreate = false,
    ) => {
        try {
            // extract system page level settings schema
            const pagesToSave = [];
            let systemPages = fs
                .readdirSync(
                    path.join(process.cwd(), 'theme', 'templates', 'pages'),
                )
                .filter((o) => o != 'index.js');
            await asyncForEach(systemPages, async (fileName) => {
                let pageName = fileName.replace('.vue', '');
                // SYSTEM Pages
                Logger.info('Creating System Page: ', pageName);
                const pageData = {
                    value: pageName,
                    props: [],
                    sections: [],
                    sections_meta: [],
                    type: 'system',
                    text: pageNameModifier(pageName),
                };
                pageData.props =
                    (
                        Theme.extractSettingsFromFile(
                            path.join(
                                process.cwd(),
                                'theme',
                                'templates',
                                'pages',
                                fileName,
                            ),
                        ) || {}
                    ).props || [];
                pageData.sections_meta = Theme.extractSectionsFromFile(
                    path.join(
                        process.cwd(),
                        'theme',
                        'templates',
                        'pages',
                        fileName,
                    ),
                );
                pageData.type = 'system';
                pagesToSave.push(pageData);
            });

            // extract custom page level settings schema
            const bundleFiles = await fs.readFile(
                path.join(
                    Theme.BUILD_FOLDER,
                    `${assetHash}_themeBundle.common.js`,
                ),
                'utf-8',
            );
            let customTemplates = [];
            const themeBundle = evaluateModule(bundleFiles);
            if (themeBundle && themeBundle.getCustomTemplates) {
                customTemplates = themeBundle.getCustomTemplates();
            }
            const customFiles = {};
            let settingProps;
            const customRoutes = (ctTemplates, parentKey = null) => {
                for (let key in ctTemplates) {
                    const routerPath =
                        (parentKey && `${parentKey}/${key}`) || `c/${key}`;
                    const value = routerPath.replace(/\//g, ':::');
                    if (
                        ctTemplates[key].component &&
                        ctTemplates[key].component.__settings
                    ) {
                        settingProps =
                            ctTemplates[key].component.__settings.props;
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
            for (let key in customFiles) {
                const customPageConfig = customFiles[key];
                let pageData = {
                    value: customPageConfig.value,
                    text: customPageConfig.text,
                    path: customPageConfig.path,
                    props: [],
                    sections: [],
                    sections_meta: [],
                    type: 'custom',
                };
                pageData.props = customPageConfig.fileSetting || [];
                pageData.sections_meta = [];
                pageData.type = 'custom';
                pagesToSave.push(pageData);
            }
            const pageJson = path.join(process.cwd(), 'pages.json');
            if (isCreate) {
                return pagesToSave;
            }
            await fs.writeJson(pageJson, { pages: pagesToSave }, { spaces: 2 });
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    public static generateAvailablePagesReact = async (isNew = false) => {
        // extract system page level settings schema
        try {
            const pagesToSave = [];
            let systemPages = fs
                .readdirSync(path.join(process.cwd(), 'theme', 'pages'))
                .filter((o) => o != 'index.jsx');

            await asyncForEach(systemPages, async (fileName) => {
                let pageName = fileName.replace('.jsx', '');

                Logger.info('Creating System Page: ', pageName);
                const pageData = {
                    value: pageName,
                    props: [],
                    sections: [],
                    sections_meta: [],
                    type: 'system',
                    text: pageNameModifier(pageName),
                };
                pageData.props =
                    Theme.extractSettingsFromReactFile(
                        path.join(process.cwd(), 'theme', 'pages', fileName),
                    ).props ||
                    [] ||
                    [];
                pageData.sections_meta =
                    Theme.extractSectionsFromReactFile(
                        path.join(process.cwd(), 'theme', 'pages', fileName),
                    ) ||
                    [] ||
                    [];

                pageData.type = 'system';
                pagesToSave.push(pageData);
            });

            const sectionPath = path.resolve(
                process.cwd(),
                Theme.BUILD_FOLDER,
                'custom-templates/custom-templates.commonjs.js',
            );

            const customTemplates =
                require(sectionPath)?.customTemplates?.default;
            if (!customTemplates) {
                Logger.error(`Custom Templates Not Available`);
            }
            const customFiles = {};
            const customRoutes = (ctTemplates, parentKey = null) => {
                for (let key in ctTemplates) {
                    let settingProps;
                    const routerPath =
                        (parentKey && `${parentKey}/${key}`) || `c/${key}`;
                    const value = routerPath.replace(/\//g, ':::');
                    if (ctTemplates[key].settings) {
                        settingProps = ctTemplates[key].settings.props;
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

            for (let key in customFiles) {
                const customPageConfig = customFiles[key];
                const pageData = {
                    value: customPageConfig.value,
                    text: customPageConfig.text,
                    path: customPageConfig.path,
                    props: [],
                    sections: [],
                    sections_meta: [],
                    type: 'custom',
                };
                pageData.props = customPageConfig.fileSetting || [];
                pageData.sections_meta = [];
                pageData.type = 'custom';
                pagesToSave.push(pageData);
            }
            const pageJson = path.join(process.cwd(), 'pages.json');
            if (isNew) {
                return pagesToSave;
            }
            await fs.writeJson(pageJson, { pages: pagesToSave }, { spaces: 2 });
        } catch (err) {
            throw new CommandError(err.message, err.code);
        }
    };

    public static restructTheme = async () => {
        const destinationFolder = path.join(process.cwd(), 'theme');
        const sourceFolder = path.join(process.cwd());
        const babelFilePath = path.join(process.cwd(), 'babel.config.js');
        const fdkConfigFilePath = path.join(process.cwd(), 'fdk.config.js');
        const files = fs.readdirSync(sourceFolder);

        // Check if the destination folder exists, if not, create it
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }
        
        const outer_items = ["package.json", "package-lock.json", "debug.log", "assets.json", "pages.json", "theme", "babel.config.js", "fdk.config.js", ".fdk", ".git", ".gitignore", ".husky", "node_modules", "config.json"]
        const moved_files = []
        files.forEach((fileOrFolder) => {
            if (outer_items.includes(fileOrFolder)) return;
            const sourcePath = path.join(sourceFolder, fileOrFolder);
            const destinationPath = path.join(destinationFolder, fileOrFolder);
            // Move the file or folder to the destination directory
            fs.renameSync(sourcePath, destinationPath);
            moved_files.push(fileOrFolder);
        });
        Logger.info(
            `\n✔ ${moved_files.join(', ')} files are moved to theme folder`,
        );

        // Check if babal config exist
        if (!fs.existsSync(babelFilePath)) {
            const babelContent = fs.readFileSync(
                path.join(Theme.TEMPLATE_DIRECTORY, 'babel.config.js'),
            );
            fs.writeFileSync(babelFilePath, babelContent);
            Logger.info('✔ babel.config.js added');
        }

        // Check if fdk config exist
        if (!fs.existsSync(fdkConfigFilePath)) {
            const fdkConfigContent = fs.readFileSync(
                path.join(Theme.TEMPLATE_DIRECTORY, 'vue.config.js'),
            );
            fs.writeFileSync(fdkConfigFilePath, fdkConfigContent);
            Logger.info('✔ fdk.config.js added');
        }
    };

    public static generateThemeZip = async () => {
        // Generate production build so that we can get assets and available sections in config file while creating zip
        await Theme.ensureThemeTypeInPackageJson();
        const activeContext = getActiveContext();
        if (activeContext.theme_type === THEME_TYPE.react) {
            await Theme.generateAssetsReact();
        } else {
            await Theme.generateAssetsVue();
        }
        let content = { name: '' };
        let spinner;
        try {
            if (fs.existsSync(Theme.SRC_FOLDER)) {
                rimraf.sync(Theme.SRC_FOLDER);
            }
            spinner = new Spinner(
                chalk.yellow('CLI has started creating zip file...'),
            );
            spinner.start();
            let filepath = path.join(process.cwd(), 'package.json');
            let packageContent: any = readFile(filepath);
            let content = JSON.parse(packageContent) || {};
            process.on('SIGINT', () => {
                rimraf.sync(path.join(process.cwd(), '.fdk', 'temp-theme'));
                rimraf.sync(
                    path.join(
                        process.cwd(),
                        `${content.name}_${content.version}.zip`,
                    ),
                );
                spinner.fail('CLI has stopped creating zip file...');
                process.exit(0);
            });
            rimraf.sync(
                path.join(
                    process.cwd(),
                    `${content.name}_${content.version}.zip`,
                ),
            );
            await Theme.copyFolders(path.join(process.cwd()), Theme.SRC_FOLDER);
            await archiveFolder({
                srcFolder: path.join(process.cwd(), '.fdk', 'temp-theme'),
                destFolder: path.join(process.cwd()),
                zipFileName: `${content.name}_${content.version}.zip`,
            });
            rimraf.sync(path.join(process.cwd(), '.fdk', 'temp-theme'));
            spinner.succeed(
                `${content.name}_${content.version}.zip file created.`,
            );
        } catch (err) {
            if (spinner.isSpinning) {
                spinner.fail();
            }
            throw new CommandError(
                `Failed to generate .zip file of ${content?.name} theme`,
                err.code,
            );
        }
    };

    private static cloneTemplate = async (
        options,
        targetDirectory,
        appConfig,
    ) => {
        const defaultTheme = await ThemeService.getDefaultTheme({
            company_id: appConfig.company_id,
            application_id: appConfig._id,
        });
        if (!defaultTheme) {
            throw new CommandError(`Default Theme Not Available`);
        }
        const themeName = defaultTheme.name;
        const spinner = new Spinner(`Cloning template files`);
        // const url = options.url || Theme.TEMPLATE_THEME_URL;
        const url = `https://github.com/gofynd/${themeName}.git`;
        try {
            spinner.start();
            const git = simpleGit();
            await git.clone(url, targetDirectory);
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw new CommandError(
                `Failed to clone template files.\n ${err.message}`,
                err.code,
            );
        }
    };

    private static selectThemeType = async () => {
        try {
            const questions = [
                {
                    type: 'list',
                    name: 'themeType',
                    message:
                        'Select the framework for which you want to create theme',
                    choices: ['vue2', 'react'],
                },
            ];
            return await inquirer.prompt(questions).then((answers) => {
                return answers.themeType;
            });
        } catch (error) {
            throw new CommandError(error.message);
        }
    };

    private static ensureThemeTypeInPackageJson = async () => {
        try {
            const packageJsonPath = path.resolve(
                process.cwd(),
                './package.json',
            );
            const packageJsonData = require(packageJsonPath);
            // Parse the JSON content of package.json
            if (!packageJsonData.theme_metadata?.theme_type) {
                const context = getActiveContext();
                if (!context.theme_type) {
                    context.theme_type = THEME_TYPE.vue2 as any
                }
                if (!packageJsonData.theme_metadata) {
                    packageJsonData.theme_metadata = {};
                }

                packageJsonData.theme_metadata.theme_type = context.theme_type;
                await fs.promises.writeFile(
                    packageJsonPath,
                    JSON.stringify(packageJsonData, null, 2),
                    'utf8',
                );
            }
        } catch (err) {
            throw err;
        }
    };
}
