import CommandError from './CommandError';
import path from 'path';
import fs from 'node:fs';
import fsExtra from 'fs-extra';
import { promisify } from 'node:util';
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
    getPort,
    startExtensionServer,
    reload,
    startExtensionServerVue,
} from '../helper/serve.utils';
import chalk from 'chalk';
import ngrok from 'ngrok';
import Theme from './Theme';
import configurationService from './api/services/configuration.service';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import cheerio from 'cheerio';
import chokidar from 'chokidar';

const readDirectories = promisify(fs.readdir);

type ExtensionSectionOptions = {
    name: string;
    interface: 'theme' | 'platform';
    engine: 'react' | 'vue2';
};
type SyncExtensionBindingsOptions = {
    extensionId?: string;
    organisationId?: string;
    name: string;
    type: string;
};

type ExtensionContext = {
    extensionId: string;
    organisationId: string;
    domain: string;
};


export default class ExtensionSection {
    static BINDINGS_DIR_REACT = 'bindings/theme/react';
    static BINDINGS_DIR_VUE = 'bindings/theme/vue';
    static CONTEXT_FILENAME = 'context.json';
    static CONTEXT_DIR_PATH = '.fdk';

    public static async initExtensionBinding(options: ExtensionSectionOptions) {
        try {
            const requiredOptions = ['name', 'interface', 'engine'];

            const passedOptions = Object.keys(options);

            const missingOptions = requiredOptions.filter(
                (param) => !passedOptions.includes(param),
            );

            const questions = [
                {
                    type: 'text',
                    name: 'name',
                    message: 'Enter Binding Name.',
                },
                {
                    type: 'list',
                    name: 'engine',
                    message: 'Select Runtime Engine.',
                    choices: ['react', 'vue'],
                },
                {
                    type: 'list',
                    name: 'interface',
                    message: 'Select Interface.',
                    choices: ['platform', 'theme'],
                },
            ].filter(({ name }) => missingOptions.includes(name));

            const answers = questions.length
                ? await inquirer.prompt(questions)
                : {};

            const finalOptions: ExtensionSectionOptions = {
                ...options,
                ...answers,
            };

            const { interface: bindingInterface, engine } = finalOptions;

            if (bindingInterface === 'theme' && engine === 'react') {
                await ExtensionSection.initExtensionSectionBindingForReact(
                    finalOptions,
                );
            } else if (bindingInterface === 'theme' && engine === 'vue2') {
                await ExtensionSection.initExtensionSectionBindingForVue(
                    finalOptions,
                );
            } else {
                throw new CommandError('Unsupported interface or engine!');
            }
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static async initExtensionSectionBindingForVue(
        options: ExtensionSectionOptions,
    ) {
        try {
            const sectionName = options['name'];
            const engine = options['engine'];

            if (!sectionName) {
                throw new Error('Section Name not provided!');
            }

            ExtensionSection.createSectionsDirectoryIfNotExists(engine);

            const sectionExists = await ExtensionSection.sectionExists(
                sectionName,
                engine,
            );

            if (sectionExists) {
                throw new Error('Section Already Exists!');
            }

            await ExtensionSection.createDefaultSectionWithNameVue(sectionName);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static async initExtensionSectionBindingForReact(
        options: ExtensionSectionOptions,
    ) {
        try {
            const sectionName = options['name'];
            const engine = options['engine'];

            if (!sectionName) {
                throw new Error('Section Name not provided!');
            }

            ExtensionSection.createSectionsDirectoryIfNotExists(engine);

            const sectionExists = await ExtensionSection.sectionExists(
                sectionName,
                engine,
            );

            if (sectionExists) {
                throw new Error('Section Already Exists!');
            }

            await ExtensionSection.createDefaultSectionWithName(sectionName);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static createSectionsDirectoryIfNotExists(engine: string): void {
        const directories =
            engine === 'react'
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

    static async sectionExists(name: string, engine: string): Promise<Boolean> {
        const sectionPath = path.resolve(
            process.cwd(),
            engine === 'react'
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

    static async createDefaultSectionWithNameVue(name: string) {
        const sourceCodePath = path.resolve(
            __dirname,
            '../../extension-section-vue',
        );
        const sectionDirPath = path.resolve(
            process.cwd(),
            ExtensionSection.BINDINGS_DIR_VUE,
            name,
        );

        await fsExtra.copy(sourceCodePath, sectionDirPath);

        const packageJsonPath = path.join(sectionDirPath, 'package.json');
        const packageJson = await fsExtra.readJson(packageJsonPath);
        packageJson.scripts.build = `vue-cli-service build --target lib src/main.js --name ${name}`;
        await fsExtra.writeJson(packageJsonPath, packageJson, {
            spaces: 4,
        });

        process.chdir(
            path.join(process.cwd(), ExtensionSection.BINDINGS_DIR_VUE, name),
        );

        await ExtensionSection.installNpmPackages();
    }

    static async createDefaultSectionWithName(name: string) {
        const sourceCodePath = path.resolve(
            __dirname,
            '../../extension-section',
        );
        const sectionDirPath = path.resolve(
            process.cwd(),
            ExtensionSection.BINDINGS_DIR_REACT,
            name,
        );

        await fsExtra.copy(sourceCodePath, sectionDirPath);

        process.chdir(
            path.join(process.cwd(), ExtensionSection.BINDINGS_DIR_REACT, name),
        );

        await ExtensionSection.installNpmPackages();
    }

    static isValidSyncOptions(options: SyncExtensionBindingsOptions): Boolean {
        return (
            options.extensionId &&
            options.organisationId &&
            options.name &&
            options.type &&
            typeof options.extensionId === 'string' &&
            typeof options.organisationId === 'string' &&
            typeof options.name === 'string' &&
            typeof options.type === 'string'
        );
    }

    public static async publishExtensionBindings(
        options: SyncExtensionBindingsOptions,
    ) {
        const context = ExtensionSection.isValidSyncOptions(options)
            ? options
            : await ExtensionSection.getContextData({ serve: false });

        Logger.info(`Publishing Extension Sections`);

        if (context.type === 'react') {
            ExtensionSection.publishExtensionBindingsReact(context);
        } else {
            ExtensionSection.publishExtensionBindingsVue(context);
        }

        Logger.info('Code published ...');
    }

    static async publishExtensionBindingsReact(context) {
        let sectionData;
        sectionData = await ExtensionSection.extractSectionsData(
            context.name,
            context,
        );
        sectionData.status = 'published';

        await ExtensionSection.savingExtensionBindings(sectionData, context, sectionData.status);
    }

    static async draftExtensionBindingsReact(context) {

        const sectionData = await ExtensionSection.extractSectionsData(
            context.name,
            context,
        );

        sectionData.status = 'draft';

        await ExtensionSection.savingExtensionBindings(sectionData, context, sectionData.status);
    }

    static async publishExtensionBindingsVue(context) {
        let sectionData = await ExtensionSection.extractSectionsDataVue(context);
        
        sectionData.status = 'published';

        await ExtensionSection.savingExtensionBindings(sectionData, context, sectionData.status);
    }
    static async draftExtensionBindingsVue(context) {
        let sectionData = await ExtensionSection.extractSectionsDataVue(context);

        sectionData.status = 'draft';

        await ExtensionSection.savingExtensionBindings(sectionData, context);
    }

    static async extractSectionsDataVue(
        context: SyncExtensionBindingsOptions,
    ): Promise<any> {
        const currentRoot = process.cwd();

        process.chdir(
            path.join(
                currentRoot,
                ExtensionSection.BINDINGS_DIR_VUE,
                context.name,
            ),
        );

        const res = await ExtensionSection.buildExtensionCodeVue({
            bundleName: context.name,
        }).catch(console.error);

        const uploadURLs = await ExtensionSection.uploadSectionFiles(
            context.name,
        );

        let sectionsFiles = [];
        try {
            sectionsFiles = fs
                .readdirSync(
                    path.join(
                        currentRoot,
                        `/${ExtensionSection.BINDINGS_DIR_VUE}/${context.name}/src/sections`,
                    ),
                )
                .filter((o) => o != 'index.js');
        } catch (err) {
            console.log(err);
        }
        let sections = sectionsFiles.map((f) => {
            return ExtensionSection.extractSettingsFromFile(
                path.join(
                    currentRoot,
                    `/${ExtensionSection.BINDINGS_DIR_VUE}/${context.name}/src/sections/${f}`,
                ),
            );
        });

        const data = {
            extension_id: context.extensionId,
            bundle_name: context.name,
            organization_id: context.organisationId,
            sections,
            assets: uploadURLs,
            type: 'vue2',
        };

        process.chdir(currentRoot);
        return data;
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
            let settingsText = $('settings').text()

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

    static async extractSectionsData(
        bundleName: string,
        context: SyncExtensionBindingsOptions,
    ): Promise<any> {
        const currentRoot = process.cwd();

        process.chdir(
            path.join(
                currentRoot,
                ExtensionSection.BINDINGS_DIR_REACT,
                bundleName,
            ),
        );

        

        await ExtensionSection.buildExtensionCode({ bundleName }).catch(
            console.error,
        );

        const uploadURLs =
            await ExtensionSection.uploadSectionFiles(bundleName);

        const availableSections = await ExtensionSection.getAvailableSections();

        //TO DO : remove extra data.
        const sections = [];
        for (const key in availableSections) {
            if (availableSections.hasOwnProperty(key)) {
                sections.push(availableSections[key]['settings']);
            }
        }

        const data = {
            extension_id: context.extensionId,
            bundle_name: bundleName,
            organization_id: context.organisationId,
            sections,
            assets: uploadURLs,
            type: 'react',
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
            const webpackConfig = extensionWebpackConfig({
                isLocal,
                bundleName,
                port,
                context,
            });

            return new Promise((resolve, reject) => {
                webpack(webpackConfig, (err, stats) => {
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
        const context = ExtensionSection.isValidSyncOptions(options)
            ? options
            : await ExtensionSection.getContextData({ serve: false });

        Logger.info(`Drafting Extension Sections`, context.type);

        if (context.type === 'react') {
            await ExtensionSection.draftExtensionBindingsReact(context);
        } else {
            await ExtensionSection.draftExtensionBindingsVue(context);
        }

        Logger.info('Code drafted ...');
    }

    static watchExtensionCodeBuild(
        bundleName: string,
        port: number = 5502,
        callback: Function,
    ) {
        let spinner = new Spinner('Building Extension Code');
        try {
            spinner.start();

            const context = process.cwd();
            const webpackConfig = extensionWebpackConfig({
                isLocal: true,
                bundleName,
                port,
                context,
            });

            const compiler = webpack(webpackConfig);

            compiler.watch(
                {
                    aggregateTimeout: 1500,
                    ignored: /node_modules/,
                    poll: undefined,
                },
                (err, stats) => {
                    if (err) {
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

    static async savingExtensionBindings(data: any, context: ExtensionContext, type: 'draft' | 'published' = 'draft') {
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

    static async promptExtensionDetails() {
        const questions = [
            {
                type: 'text',
                name: 'extensionId',
                message: 'Enter Extension ID.',
            },
            {
                type: 'text',
                name: 'organisationId',
                message: 'Enter Organisation ID.',
            },
            {
                typer: 'text',
                name: 'name',
                message: 'Enter Binding Name.',
            },
            {
                typer: 'text',
                name: 'type',
                message: 'Enter type of your extension (react/vue).',
            },
        ];

        const answers = await inquirer.prompt(questions);
        return answers;
    }

    static async promptUrl() {
        const questions = [
            {
                type: 'text',
                name: 'url',
                message: 'Enter serving url.',
            },
        ];

        const answer = await inquirer.prompt(questions);
        return answer;
    }

    static async getContextData(options?: { serve: Boolean }) {
        try {
            const dirPath = path.resolve(
                process.cwd(),
                ExtensionSection.CONTEXT_DIR_PATH,
            );
            const filePath = path.resolve(
                dirPath,
                ExtensionSection.CONTEXT_FILENAME,
            );
            try {
                const contextFileExists = fs.statSync(filePath);
                if (contextFileExists) {
                    const contextData = fsExtra.readJSONSync(filePath);
                    return contextData;
                }
            } catch (error) {
                console.log(error.message);
            }

            const applicationConfig: {
                domain: string;
            } = {
                domain: '',
            };

            let url = {};
            if (options.serve) {
                const configObj = await Theme.selectCompanyAndStore();
                const { data: appConfig } =
                    await configurationService.getApplicationDetails(configObj);

            }

            const answers = await ExtensionSection.promptExtensionDetails();

            const context = {
                ...answers,
                ...url,
                ...(options.serve ? applicationConfig : {}),
            };

            fs.mkdirSync(dirPath, { recursive: true });

            fsExtra.writeJSONSync(filePath, context);

            return context;
        } catch (error) {
            console.log(error);
        }
    }

    public static async previewExtension(options: any) {
        if (options.type === 'react') {
            return ExtensionSection.serveExtensionSections(options);
        } else {
            return ExtensionSection.serveExtensionSectionsVue(options);
        }
    }
    public static async serveExtensionSections(options: any) {
        try {
            const { name: bundleName } = options;
            // const context = await ExtensionSection.getContextData({
                //     serve: true,
                // });
                
            const configObj = await Theme.selectCompanyAndStore();
            const { data: appConfig } = await configurationService.getApplicationDetails(configObj);
            options.domain = 'http://karanraina.sandbox4.fynd.engineering:8087/company/1/application/6628a03255b099d9357b75de/themes/6641d8a0695cd39f717f278e/edit'

            const port = options['port'];
            const tunnelUrl = options['url'];

            const rootPath = process.cwd();
            process.chdir(
                path.join(
                    process.cwd(),
                    ExtensionSection.BINDINGS_DIR_REACT,
                    bundleName,
                ),
            );
            Logger.info('Building Extension Code ...');
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
            process.chdir(rootPath);
            const bundleDist = path.resolve(
                rootPath,
                ExtensionSection.BINDINGS_DIR_REACT,
                bundleName,
                'dist',
            );
            Logger.info('Starting Local Extension Server ...', bundleDist);
            await startExtensionServer({ bundleDist, port });

            // Logger.info('Starting Ngrok Tunnel ...');
            // const url = await ngrok.connect(port);

            const assetUrls = {
                js: `${tunnelUrl}/${jsFile}`,
                css: `${tunnelUrl}/${cssFile}`,
            };

            const data = {
                extensionId: options.extensionId,
                bundle: bundleName,
                assets: assetUrls,
            };

            const encoded = encodeURI(JSON.stringify(data));

            const previewURL = `${options.domain}?extensionHash=${encoded}`;

            console.log(`PREVIEW URL :\n\n ${previewURL}\n\n`);
        } catch (error) {
            console.log(error);
        }
    }

    public static async serveExtensionSectionsVue(options: any) {
        try {
            const { name: bundleName, url: tunnelUrl, extensionId } = options;
            const port = options.port;

            const rootPath = process.cwd();
            process.chdir(
                path.join(
                    process.cwd(),
                    ExtensionSection.BINDINGS_DIR_VUE,
                    bundleName,
                ),
            );
            Logger.info('Building Extension Code ...');

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

            // process.chdir(rootPath);
            const bundleDist = path.resolve(
                rootPath,
                ExtensionSection.BINDINGS_DIR_VUE,
                bundleName,
                'dist',
            );
            Logger.info('Starting Local Extension Server ...', bundleDist);
            await startExtensionServerVue({ bundleDist, port });

            // todo: use URL to genereate url
            const assetUrls = {
                js: `${tunnelUrl}/${bundleName}.umd.js`,
                css: `${tunnelUrl}/${bundleName}.css`,
            };

            const data = {
                extensionId: extensionId,
                bundle: bundleName,
                assets: assetUrls,
            };

            const encoded = encodeURI(JSON.stringify(data));

            const previewURL = `${options.domain}?extensionHash=${encoded}`;

            console.log(`PREVIEW URL :\n\n ${previewURL}\n\n`);
        } catch (error) {
            console.log(error);
        }
    }
}
