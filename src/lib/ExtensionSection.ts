import CommandError from './CommandError';
import path from 'path';
import fs from 'node:fs';
import detect from 'detect-port';
import fsExtra from 'fs-extra';
import { promisify } from 'node:util';
import { tunnel as startCloudflareTunnel, bin, install } from 'cloudflared';

import Logger from './Logger';
import Spinner from '../helper/spinner';
import { installNpmPackages } from '../helper/utils';
import { readFile } from '../helper/file.utils';
import { extensionWebpackConfig } from '../helper/extension.react.config';
import { webpack } from 'webpack';
import uploadService from './api/services/upload.service';
import Configstore, { CONFIG_KEYS } from './Config';
import extensionService from './api/services/extension.service';
import {
    startExtensionServer,
    reload,
    getPort,
} from '../helper/serve.utils';
import chalk from 'chalk';
import Theme from './Theme';
import configurationService from './api/services/configuration.service';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import * as cheerio from 'cheerio';
import chokidar from 'chokidar';
import { v4 as uuidv4 } from 'uuid';
import themeService from './api/services/theme.service';
import { getPlatformUrls } from './api/services/url';
import Tunnel from './Tunnel';

const readDirectories = promisify(fs.readdir);

type BindingInterface = 'Web Theme' | 'Platform';

export type SupportedFrameworks = 'react' | 'vue2';

type AppliedThemeData = {
    applicationId: string;
    companyId: string;
    themeId: string;
    companyType: 'live' | 'development';
};

type ContextData = {
    organisationId: string;
    extensionId: string;
    name: string;
    framework: SupportedFrameworks;
    interface: BindingInterface;
    appliedTheme: AppliedThemeData;
    url?: string;
    port?: number;
};

type ExtensionSectionOptions = {
    name: string;
    interface: BindingInterface;
    framework: SupportedFrameworks;
};

interface SyncExtensionBindingsOptions extends ContextData { };

type ExtensionContext = {
    extensionId: string;
    organisationId: string;
    domain: string;
    interface: string;
};

type CommandType = 'init' | 'draft' | 'publish' | 'preview';

export default class ExtensionSection {
    static BINDINGS_DIR_REACT = 'bindings/theme/react';
    static BINDINGS_DIR_VUE = 'bindings/theme/vue';
    static CONTEXT_FILENAME = 'context.json';
    static CONTEXT_DIR_PATH = '.fdk';

    static async getContextData(
        optionsPassed: any,
        commandType: CommandType,
    ): Promise<ContextData> {
        const commonRequiredOptions = [
            'extensionId',
            'organisationId',
            'name',
            'framework',
            'interface',
        ] as const;
        const allOptions = [
            ...commonRequiredOptions,
            'port',
            'url',
            'appliedTheme',
        ] as const;

        type AllOptions = (typeof allOptions)[number];

        type PromptUserOption = {
            type: string;
            name: string;
            message: string;
            choices?: string[];
        };

        async function promptUser(options: PromptUserOption) {
            const questions = [options];

            const answers = await inquirer.prompt(questions);

            return answers[options.name];
        }

        async function getOption(key: (typeof allOptions)[number]) {
            try {
                switch (key) {
                    case 'framework':
                        return promptUser({
                            type: 'list',
                            name: 'framework',
                            message: 'Please select your framework: ',
                            choices: ['react', 'vue2'],
                        });

                    case 'extensionId':
                        let extensionId;
                        try {
                            const extensionsList =
                                await extensionService.getExtensionList(1, 500);

                            const extensions = extensionsList?.items.map(
                                ({ name }) => name,
                            );

                            if (!extensions?.length) {
                                throw new Error(
                                    'No installed extensions found!',
                                );
                            }
                            const selectedExtensionName = await promptUser({
                                type: 'list',
                                name: 'extensionId',
                                message: 'Please select your extension: ',
                                choices: extensions,
                            });
                            extensionId = extensionsList?.items.find(
                                ({ name }) => name === selectedExtensionName,
                            )?._id;
                        } catch (error) {
                            Logger.error(
                                'Could not fetch the list of extensions',
                            );
                            extensionId = await promptUser({
                                type: 'text',
                                name: 'extensionId',
                                message: 'Please Enter your extensionId: ',
                            });
                        } finally {
                            Configstore.set(
                                'extensionSections.extensionId',
                                extensionId,
                            );
                            return extensionId;
                        }

                    case 'name':
                        return promptUser({
                            type: 'text',
                            name: 'name',
                            message: 'Please enter your binding name: ',
                        });

                    case 'port':
                        return promptUser({
                            type: 'text',
                            name: 'port',
                            message: 'Please enter server port: ',
                        });

                    case 'url':
                        return promptUser({
                            type: 'text',
                            name: 'url',
                            message: 'Please enter tunnel url: ',
                        });

                    case 'interface':
                        return promptUser({
                            type: 'list',
                            name: 'interface',
                            message: 'Please select your extension interface: ',
                            choices: ['Web Theme', 'Platform', 'Store OS'],
                        });

                    case 'appliedTheme':
                        let themeDetails = {
                            applicationId: undefined,
                            companyId: undefined,
                            themeId: undefined,
                            companyType: 'live',
                        };
                        try {
                            const configObj =
                                await Theme.selectCompanyAndStore();
                            const { data: appConfig } =
                                await configurationService.getApplicationDetails(
                                    configObj,
                                );

                            const themeData =
                                await themeService.getAppliedTheme({
                                    company_id: appConfig.company_id,
                                    application_id: appConfig.id,
                                });

                            themeDetails = {
                                applicationId: appConfig['id'],
                                companyId: appConfig['company_id'],
                                themeId: themeData['_id'],
                                companyType: configObj['accountType'],
                            };
                        } catch (error) {
                            Logger.error('Could not fetch the applied!');
                            for (let lkey in themeDetails) {
                                themeDetails[lkey] = await promptUser({
                                    type: 'text',
                                    name: lkey,
                                    message: `Please enter ${lkey}: `,
                                });
                            }
                        } finally {
                            Configstore.set(
                                'extensionSections.appliedTheme',
                                themeDetails,
                            );
                            return themeDetails;
                        }

                    default:
                        return null;
                }
            } catch (error) { }
        }

        if (!Configstore.all.extensionSections) {
            Configstore.set('extensionSections', {});
        }

        Configstore.set(
            'extensionSections.organisationId',
            Configstore.all.current_env.organization,
        );

        const requiredKeys: {
            [key in CommandType]: ReadonlyArray<AllOptions>;
        } = {
            init: [...commonRequiredOptions],
            draft: [...commonRequiredOptions],
            publish: [...commonRequiredOptions],
            preview: [...commonRequiredOptions, 'appliedTheme'],
        };
        try {
            const requiredOptions = requiredKeys[commandType];
            const existingContext = Configstore.all.extensionSections;

            const mergedConfig = Object.assign(
                {},
                existingContext,
                optionsPassed,
            );

            const missingKeys = requiredOptions.filter(
                (key) =>
                    !Object.prototype.hasOwnProperty.call(mergedConfig, key),
            );

            const userInput = {};
            for (let val in missingKeys) {
                const result = await getOption(missingKeys[val]);
                userInput[missingKeys[val]] = result;
            }

            const finalContext = Object.assign(mergedConfig, userInput);

            return finalContext;
        } catch (error) {
            console.log(error);
        }
    }

    public static clearContext() {
        Configstore.set('extensionSections', {});
    }

    static async startTunnel() {

        try {
            const port = await getPort(5500);

            const tunnelInstance = new Tunnel({
                port,
            })

            const tunnelUrl = await tunnelInstance.startTunnel();

            console.log(`
                Started cloudflare tunnel at ${port}: ${tunnelUrl}`)
            return {
                url: tunnelUrl,
                port,
            };
        } catch (error) {
            Logger.error('Error during starting cloudflare tunnel: ' + error.message);
            return;
        }
    }

    public static logContext() {
        console.table(Configstore.get('extensionSections'));
    }

    public static async initExtensionBinding(options: ExtensionSectionOptions) {
        try {
            const context = await ExtensionSection.getContextData(
                options,
                'init',
            );

            const { interface: bindingInterface, framework, name: bindingName } = context;

            if (bindingInterface === 'Web Theme') {

                if (!bindingName) {
                    throw new Error('Section Name not provided!');
                }

                ExtensionSection.createSectionsDirectoryIfNotExists(framework);

                const sectionExists = await ExtensionSection.sectionExists(
                    bindingName,
                    framework,
                );

                if (sectionExists) {
                    throw new Error('Section Already Exists!');
                }

                if (framework === 'react' || framework === 'vue2') {

                    const isReact = framework === 'react';
                    const sourcePath = path.resolve(
                        __dirname,
                        isReact ? '../../extension-section' : '../../extension-section-vue',
                    );

                    const destinationPath = path.resolve(
                        process.cwd(),
                        isReact ? ExtensionSection.BINDINGS_DIR_REACT : ExtensionSection.BINDINGS_DIR_VUE,
                        bindingName,
                    )

                    await fsExtra.copy(sourcePath, destinationPath);

                    process.chdir(
                        path.join(destinationPath),
                    );

                    await ExtensionSection.installNpmPackages();
                    Logger.info('Binding created with default sections!')
                } else {
                    throw new CommandError('Unsupported framework!');
                }
            }


        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static createSectionsDirectoryIfNotExists(framework: string): void {
        const directories =
            framework === 'react'
                ? ExtensionSection.BINDINGS_DIR_REACT.split(path.sep)
                : ExtensionSection.BINDINGS_DIR_VUE.split(path.sep);
        let currentPath = process.cwd();

        directories.forEach((directory) => {
            currentPath = path.join(currentPath, directory);
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
        });
    }

    static async sectionExists(
        name: string,
        framework: string,
    ): Promise<Boolean> {
        const sectionPath = path.resolve(
            process.cwd(),
            framework === 'react'
                ? ExtensionSection.BINDINGS_DIR_REACT
                : ExtensionSection.BINDINGS_DIR_VUE,
        );

        if (!fs.existsSync(sectionPath)) {
            return false;
        }

        const dirents = await readDirectories(sectionPath);

        const sectionExists = dirents.some((dirent) => {
            const direntFullPath = path.resolve(sectionPath, dirent);
            return fs.statSync(direntFullPath).isDirectory() && dirent === name;
        });

        return sectionExists;
    }

    static isValidSyncOptions(options: SyncExtensionBindingsOptions): Boolean {
        return (
            options.extensionId &&
            options.organisationId &&
            options.name &&
            options.framework &&
            typeof options.extensionId === 'string' &&
            typeof options.organisationId === 'string' &&
            typeof options.name === 'string' &&
            typeof options.framework === 'string'
        );
    }

    public static async publishExtensionBindings(
        options: SyncExtensionBindingsOptions,
    ) {
        const context = await ExtensionSection.getContextData(
            options,
            'publish',
        );
        const { interface: bindingInterface, framework, name } = context;

        if (bindingInterface === 'Web Theme') {
            if (framework === 'react' || framework === 'vue2') {
                Logger.info(`Publishing Extension Bindings`);

                const sectionData = await ExtensionSection.buildAndExtractSections(
                    context,
                );
                sectionData.status = 'published';

                await ExtensionSection.savingExtensionBindings(
                    sectionData,
                    context,
                    sectionData.status,
                );
            } else {
                throw new CommandError(
                    'Unsupported Framework! Only react and vue2 are supported',
                );
            }
        } else {
            throw new CommandError(
                'Unsupported Interface! Only Web Themes are supported',
            );
        }

        Logger.info('Code published ...');
    }

    static async buildExtensionCodeVue({ bundleName }) {
        const VUE_CLI_PATH = path.join(
            '.',
            'node_modules',
            '@vue',
            'cli-service',
            'bin',
            'vue-cli-service.js',
        );
        const spinner = new Spinner('Building sections using vue-cli-service');
        return new Promise((resolve, reject) => {
            spinner.start();
            const isNodeVersionIsGreaterThan18 =
                +process.version.split('.')[0].slice(1) >= 18;
            let b = exec(
                `node ${VUE_CLI_PATH} build --target lib src/index.js --name ${bundleName}`,
                {
                    cwd: process.cwd(),
                    env: {
                        ...process.env,
                        NODE_ENV: 'production',
                        VUE_CLI_SERVICE_CONFIG_PATH: path.join(
                            process.cwd(),
                            Theme.VUE_CLI_CONFIG_PATH,
                        ),
                        ...(isNodeVersionIsGreaterThan18 && {
                            NODE_OPTIONS: '--openssl-legacy-provider',
                        }),
                    },
                },
            );

            b.stdout.pipe(process.stdout);
            b.stderr.pipe(process.stderr);
            b.on('exit', function (code) {
                if (!code) {
                    spinner.succeed();
                    return resolve(true);
                }
                spinner.fail();
                reject({ message: 'Extension Build Failed' });
            });
        });
    }

    static extractSettingsFromFile(path) {
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

    static async buildAndExtractSections(
        context: SyncExtensionBindingsOptions,
    ): Promise<any> {
        const { name: bundleName, framework } = context;
        const isReact = framework === 'react';
        const currentRoot = process.cwd();

        const destinationPath = path.join(
            currentRoot,
            isReact ? ExtensionSection.BINDINGS_DIR_REACT : ExtensionSection.BINDINGS_DIR_VUE,
            bundleName,
        )

        process.chdir(destinationPath);

        if (isReact) {
            await ExtensionSection.buildExtensionCode({ bundleName }).catch(
                console.error,
            );
        } else {
            await ExtensionSection.buildExtensionCodeVue({
                bundleName: context.name,
            }).catch(console.error);
        }

        const uploadURLs = await ExtensionSection.uploadSectionFiles(bundleName);

        let sections = [];

        if (isReact) {
            const availableSections = await ExtensionSection.getAvailableSections();

            for (const key in availableSections) {
                if (availableSections.hasOwnProperty(key)) {
                    sections.push(availableSections[key]['settings']);
                }
            }
        } else {
            try {
                const sectionsFiles = fs
                    .readdirSync(
                        path.join(
                            currentRoot,
                            `/${ExtensionSection.BINDINGS_DIR_VUE}/${context.name}/src/sections`,
                        ),
                    )
                    .filter((o) => o != 'index.js');
                sections = sectionsFiles.map((f) => {
                    return ExtensionSection.extractSettingsFromFile(
                        path.join(
                            currentRoot,
                            `/${ExtensionSection.BINDINGS_DIR_VUE}/${context.name}/src/sections/${f}`,
                        ),
                    );
                });
            } catch (err) {
                console.log(err);
            }

        }

        const data = {
            extension_id: context.extensionId,
            bundle_name: bundleName,
            organization_id: context.organisationId,
            sections,
            assets: uploadURLs,
            type: framework,
        };

        process.chdir(currentRoot);
        return data;
    }

    static async buildExtensionCode({
        bundleName,
        isLocal = false,
        port = 5502,
    }): Promise<{ jsFile: string; cssFile: string }> {
        let spinner = new Spinner('Building Extension Code');
        try {
            spinner.start();
            const context = process.cwd();
            let webpackConfigFromBinding = {};
            const webpackExtendedPath = path.join(
                context,
                'webpack.config.js'
            );

            if (fs.existsSync(webpackExtendedPath)) {
                ({ default: webpackConfigFromBinding } = await import(
                    webpackExtendedPath
                ));
            }

            const webpackConfig = extensionWebpackConfig({
                isLocal,
                bundleName,
                port,
                context,
            }, webpackConfigFromBinding);

            return new Promise((resolve, reject) => {
                webpack(webpackConfig, (err, stats) => {
                    console.log(stats.toString());
                    if (err || stats.hasErrors()) {
                        reject();
                    }
                    spinner.succeed();
                    const jsFile =
                        stats.stats[0].compilation.outputOptions.filename.toString();
                    const cssFile =
                        stats.stats[0].compilation.outputOptions.cssFilename.toString();
                    resolve({ jsFile, cssFile });
                });
            });
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message);
        }
    }

    public static async draftExtensionBindings(
        options: SyncExtensionBindingsOptions,
    ) {
        const context = await ExtensionSection.getContextData(options, 'draft');

        const { interface: bindingInterface, framework, name } = context;

        if (bindingInterface === 'Web Theme') {
            if (framework === 'react' || framework === 'vue2') {
                Logger.info(`Creating drafts for Extension Bindings`);

                const sectionData = await ExtensionSection.buildAndExtractSections(
                    context,
                );
                sectionData.status = 'draft';

                await ExtensionSection.savingExtensionBindings(
                    sectionData,
                    context,
                    sectionData.status,
                );
            } else {
                throw new CommandError(
                    'Unsupported Framework! Only react and vue2 are supported',
                );
            }
        } else {
            throw new CommandError(
                'Unsupported Interface! Only Web Themes are supported',
            );
        }

        Logger.info('Draft successful!');
    }

    static async watchExtensionCodeBuild(
        bundleName: string,
        port: number = 5502,
        callback: Function,
    ) {
        let spinner = new Spinner('Building Extension Code');
        try {
            spinner.start();

            const context = process.cwd();

            let webpackConfigFromBinding = {};
            const webpackExtendedPath = path.join(
                context,
                'webpack.config.js'
            );

            if (fs.existsSync(webpackExtendedPath)) {
                ({ default: webpackConfigFromBinding } = await import(
                    webpackExtendedPath
                ));
            }

            const webpackConfig = extensionWebpackConfig({
                isLocal: true,
                bundleName,
                port,
                context,
            }, webpackConfigFromBinding);

            const compiler = webpack(webpackConfig);

            compiler.watch(
                {
                    aggregateTimeout: 1500,
                    ignored: /node_modules/,
                    poll: undefined,
                },
                (err, stats) => {
                    if (err || stats.hasErrors()) {
                        console.log(stats.toString());
                        throw err;
                    }
                    callback(stats);
                },
            );
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message);
        }
    }

    static async installNpmPackages() {
        let spinner = new Spinner('Installing npm packages');
        try {
            spinner.start();
            await installNpmPackages();
            spinner.succeed();
        } catch (error) {
            spinner.fail();
            throw new CommandError(error.message);
        }
    }

    static async uploadSectionFiles(sectionName: string) {
        const BUNDLE_DIR = path.join(process.cwd(), path.join('dist'));
        const User = Configstore.get(CONFIG_KEYS.AUTH_TOKEN);

        let isReact = process
            .cwd()
            .includes(ExtensionSection.BINDINGS_DIR_REACT);
        let files;
        if (!isReact) {
            files = [
                ['js', `${sectionName}.umd.min.js`],
                ['css', `${sectionName}.css`],
            ];
        } else {
            files = [
                ['js', `${sectionName}.umd.min.js`],
                ['css', `${sectionName}.umd.min.css`],
            ];
        }

        const uploadURLs = {};
        const promises = files.map(([fileExtension, fileName]) => {
            return uploadService
                .uploadFile(
                    path.join(BUNDLE_DIR, fileName),
                    'fdk-cli-dev-files',
                    User.current_user._id,
                )
                .then((response) => {
                    const url = response.complete.cdn.url;
                    uploadURLs[fileExtension] = url;
                });
        });

        await Promise.all(promises);

        return uploadURLs;
    }

    static async getAvailableSections() {
        const BUNDLE_DIR = path.join(process.cwd(), path.join('dist'));

        const sectionFileName = 'sections.commonjs.js';
        const sectionFilePath = path.resolve(BUNDLE_DIR, sectionFileName);

        let sectionsMeta = undefined;

        try {
            sectionsMeta = require(sectionFilePath);
        } catch (error) {
            throw new Error(
                'Cannot read section data from bundled file : ',
                error.message,
            );
        }

        return sectionsMeta?.sections?.default ?? {};
    }

    static async savingExtensionBindings(
        data: any,
        context: SyncExtensionBindingsOptions,
        type: 'draft' | 'published' = 'draft',
    ) {
        try {
            const functionMap = {
                draft: 'draftExtensionBindings',
                published: 'publishExtensionBindings',
            };
            await extensionService[functionMap[type]](
                context.extensionId,
                context.organisationId,
                data,
            );
        } catch (error) {
            console.log(error);
        }
    }
    public static async previewExtension(options: any) {
        const context = await ExtensionSection.getContextData(
            options,
            'preview',
        );

        const { interface: bindingInterface, framework } = context;

        if (bindingInterface === 'Web Theme') {
            if (framework === 'react' || framework === 'vue2') {
                Logger.info(`Previewing Extension Binding`);
                try {
                    const {
                        name: bundleName,
                        appliedTheme,
                        extensionId,
                        organisationId,
                        framework,
                    } = context;

                    const { port, url: tunnelUrl } = await ExtensionSection.startTunnel();

                    const {
                        companyId,
                        applicationId,
                        themeId
                    } = appliedTheme;

                    const isReact = framework === 'react';

                    const { _id: extensionSectionId } =
                        await extensionService.getExtensionBindings(
                            extensionId,
                            organisationId,
                            bundleName,
                            appliedTheme.companyType,
                            framework
                        );

                    const { platform } = getPlatformUrls();

                    const domain = `${platform}/company/${companyId}/application/${applicationId}/themes/${themeId}/edit`;

                    const rootPath = process.cwd();

                    const destinationPath = path.join(
                        process.cwd(),
                        isReact ? ExtensionSection.BINDINGS_DIR_REACT : ExtensionSection.BINDINGS_DIR_VUE,
                        bundleName,
                    )
                    process.chdir(destinationPath);

                    let data;

                    Logger.info('Building Extension Code ...');

                    if (isReact) {
                        const { jsFile, cssFile } =
                            await ExtensionSection.buildExtensionCode({
                                bundleName,
                                port,
                                isLocal: true,
                            });
                        ExtensionSection.watchExtensionCodeBuild(
                            bundleName,
                            port,
                            (stats) => {
                                reload();
                            },
                        );
                        const bundleDist = path.resolve(
                            rootPath,
                            ExtensionSection.BINDINGS_DIR_REACT,
                            bundleName,
                            'dist',
                        );
                        Logger.info('Starting Local Extension Server ...', bundleDist);
                        await startExtensionServer({ bundleDist, port, framework });

                        const assetUrls = {
                            js: `${tunnelUrl}/${jsFile}`,
                            css: `${tunnelUrl}/${cssFile}`,
                        };

                        data = {
                            id: extensionSectionId,
                            assets: assetUrls,
                        };

                    } else {
                        const res = await ExtensionSection.buildExtensionCodeVue({
                            bundleName,
                        });

                        let watcher = chokidar.watch(path.resolve(process.cwd(), 'src'), {
                            persistent: true,
                        });
                        watcher.on('change', async () => {
                            Logger.info(chalk.bold.green(`building`));
                            await ExtensionSection.buildExtensionCodeVue({
                                bundleName,
                            });
                        });

                        const bundleDist = path.resolve(
                            rootPath,
                            ExtensionSection.BINDINGS_DIR_VUE,
                            bundleName,
                            'dist',
                        );
                        Logger.info('Starting Local Extension Server ...', bundleDist);
                        await startExtensionServer({ bundleDist, port, framework });

                        const assetUrls = {
                            js: `${tunnelUrl}/${bundleName}.umd.js`,
                            css: `${tunnelUrl}/${bundleName}.css`,
                        };

                        data = {
                            id: extensionSectionId,
                            assets: assetUrls,
                        };
                    }

                    const sectionPreviewHash = await uuidv4();

                    const urls = await extensionService.previewExtensionBindings(
                        extensionSectionId,
                        organisationId,
                        {
                            application_id: applicationId,
                            section_preview_hash: sectionPreviewHash,
                            ...data,
                        }
                    );

                    const previewURL = `${domain}?section_preview_hash=${sectionPreviewHash}`;

                    console.log(`PREVIEW URL :\n\n ${previewURL}\n\n`);


                    // Register a process termination listener here
                    process.on('SIGINT', async function deleteRedisSession() {
                        const data = await extensionService.deleteExtensionBindings(
                            extensionSectionId,
                            organisationId,
                            {
                                application_id: applicationId,
                                sectionPreviewHash,
                            }
                        );
                        Logger.info('Preview Session Closed');
                        process.exit(0);
                    })
                } catch (error) {
                    Logger.error(error);
                }
            } else {
                throw new CommandError(
                    'Unsupported Framework! Only react and vue2 are supported',
                );
            }
        } else {
            throw new CommandError(
                'Unsupported Interface! Only Web Themes are supported',
            );
        }


    }

}
