import CommandError from './CommandError';
import path from 'path';
import fs from 'node:fs';
import fsExtra from 'fs-extra';
import { promisify } from 'node:util';
import Logger from './Logger';
import Spinner from '../helper/spinner';
import { installNpmPackages } from '../helper/utils';
import { extensionWebpackConfig } from '../helper/extension.react.config';
import { webpack } from 'webpack';
import uploadService from './api/services/upload.service';
import Configstore, { CONFIG_KEYS } from './Config';
import extensionService from './api/services/extension.service';
import { getPort, startExtensionServer } from '../helper/serve.utils';
import chalk from 'chalk';
import ngrok from 'ngrok';
import boxen from 'boxen';

const readDirectories = promisify(fs.readdir);

type ExtensionSectionOptions = {
    name: string;
};

const extensionId = "64b3dc661a1b16dea7fadc22";
const organisationId = "65f94f498f7d44c70fcb9026";
const domain = "http://karanraina.sandbox.fynd.engineering";

export default class ExtensionSection {
    static SECTIONS_DIR = 'sections';

    public static async initExtensionSection(options: ExtensionSectionOptions) {
        try {
            const sectionName = options['name'];

            if (!sectionName) {
                throw new Error('Section Name not provided!');
            }

            ExtensionSection.createSectionsDirectoryIfNotExists();

            const sectionExists =
                await ExtensionSection.sectionExists(sectionName);

            if (sectionExists) {
                throw new Error('Section Already Exists!');
            }

            await ExtensionSection.createDefaultSectionWithName(sectionName);
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static createSectionsDirectoryIfNotExists(): void {
        const sectionPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR,
        );

        if (!fs.existsSync(sectionPath)) {
            fs.mkdirSync(sectionPath);
        }
    }

    static async sectionExists(name: string): Promise<Boolean> {
        const sectionPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR,
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

    static async createDefaultSectionWithName(name: string) {
        const sourceCodePath = path.resolve(
            __dirname,
            '../../extension-section',
        );
        const sectionDirPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR,
            name,
        );

        await fsExtra.copy(sourceCodePath, sectionDirPath);

        process.chdir(path.join(process.cwd(), 'sections', name));

        await ExtensionSection.installNpmPackages();
    }

    public static async syncExtensionBinding(options: ExtensionSectionOptions) {

        const bundleName = options.name;
        Logger.info(`c ${bundleName} section updated`);

        const sectionExists = await ExtensionSection.sectionExists(bundleName);

        if (!sectionExists) {
            throw new Error('Section Does Not Exist!');
        }

        process.chdir(path.join(process.cwd(), 'sections', options.name));

        await ExtensionSection.buildExtensionCode(bundleName).catch(
            console.log,
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
            extension_id: extensionId,
            bundle_name: bundleName,
            organization_id: organisationId,
            sections,
            assets: uploadURLs,
          };

          console.log(data)

        await ExtensionSection.publishExtensionBindings(data);

        // const sections = await extensionService.uploadBindingSections(extensionId, sectionName);
    }

    public static async syncExtensionBindings() {

        const sectionDirectory = path.resolve(process.cwd(), 'sections');
        const bundleNames = fs.readdirSync(sectionDirectory);

        const data = [];

        for (const bundleName of bundleNames) {
            const sectionData = await ExtensionSection.extractSectionsData(bundleName);
            data.push(sectionData);
        }
       
        console.log(data);

        await ExtensionSection.publishExtensionBindings(data);

        // const sections = await extensionService.uploadBindingSections(extensionId, sectionName);
    }

    static async extractSectionsData(bundleName): Promise<any> {
        const currentRoot = process.cwd();
        process.chdir(path.join(currentRoot, 'sections', bundleName));

        await ExtensionSection.buildExtensionCode(bundleName).catch(console.error);

        const uploadURLs = await ExtensionSection.uploadSectionFiles(bundleName);

        const availableSections = await ExtensionSection.getAvailableSections();
        
        //TO DO : remove extra data.
        const sections = [];
        for (const key in availableSections) {
            if (availableSections.hasOwnProperty(key)) {
                sections.push(availableSections[key]['settings']);
            }
        }

        const data = {
            extension_id: extensionId,
            bundle_name: bundleName,
            organization_id: organisationId,
            sections,
            assets: uploadURLs,
          };

          process.chdir(currentRoot);
          return data;
    }

    static async buildExtensionCode(
        sectionName: string,
        isLocal: Boolean = false,
    ): Promise<{jsFile: string, cssFile: string}> {
        let spinner = new Spinner('Building Extension Code');
        try {
            spinner.start();
            const webpackConfig = extensionWebpackConfig({
                isLocal,
                sectionName,
            });

            return new Promise((resolve, reject) => {
                webpack(webpackConfig, (err, stats) => {
                    console.log(err);
                    if (err || stats.hasErrors()) {
                        console.log(err);
                        reject();
                    }
                    spinner.succeed();
                    console.log('resolvinggggg', stats.stats[0].compilation.outputOptions.filename);
                    const jsFile = stats.stats[0].compilation.outputOptions.filename.toString();
                    const cssFile = stats.stats[0].compilation.outputOptions.cssFilename.toString();
                    resolve({jsFile, cssFile});
                });
            });
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

        const files = [
            ['js', `${sectionName}.umd.min.js`],
            ['css', `${sectionName}.css`],
        ];
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

        console.log(uploadURLs);
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
            console.log(error);
            throw new Error(
                'Cannot read section data from bundled file : ',
                error.message,
            );
        }

        return sectionsMeta?.sections?.default ?? {};
    }

    public static async getAllSections(options: any) {
        const extensionId = '6095e29a35e3992e9a0d0794';
        try {
            const sections = await extensionService.getAllSections(extensionId);
            console.log(sections);
        } catch (error) {
            console.log(error);
        }
    }
    public static async publishExtensionBindings(data: any) {
        try {
            const sections = await extensionService.publishExtensionBindings(
                extensionId,
                organisationId,
                data,
            );
            console.log(sections);
        } catch (error) {
            console.log(error);
        }
    }

    public static async serveExtensionSections(options: any) {
        try {
            console.log(options);
            const { name: bundleName } = options;
            const rootPath = process.cwd();
            process.chdir(path.join(process.cwd(), 'sections', bundleName));
            Logger.info('Building Extension Code ...');
            const { jsFile, cssFile } = await ExtensionSection.buildExtensionCode(bundleName, true);
            process.chdir(rootPath);
            const serverPort =
            typeof options['port'] === 'string'
                ? parseInt(options['port'])
                : typeof options['port'] === 'number'
                ? options['port']
                : 5502;
            const port = await getPort(serverPort);
            if (port !== serverPort)
                Logger.warn(
                    chalk.bold.yellowBright(
                        `PORT: ${serverPort} is busy, Switching to PORT: ${port}`,
                    ),
            );

            const bundleDist = path.resolve(rootPath, 'sections', bundleName, 'dist');
            console.log({port, bundleDist}, { jsFile, cssFile })
            Logger.info('Starting Local Extension Server ...');
            await startExtensionServer({ bundleDist, port });
            
            
            Logger.info('Starting Ngrok Tunnel ...');
            const url = await ngrok.connect(port);
            
                        const assetUrls = {
                            js: `${url}/${jsFile}`, 
                            css: `${url}/${cssFile}`
                        };
            
            console.log(assetUrls);

            console.log({ url });
            const data = {
                bundle: bundleName,
                assets: assetUrls,
            };

            const encoded = encodeURI(JSON.stringify(data));
            console.log({encoded});

            const previewURL = `${domain}?extensionHash=${encoded}`;

            console.log(
                boxen(
                    chalk.bold.black(
                        `PREVIEW URL: \n\n${previewURL}`,
                    ),
                    {
                        borderStyle: {
                            topLeft: ' ',
                            topRight: ' ',
                            bottomLeft: ' ',
                            bottomRight: ' ',
                            horizontal: ' ',
                            vertical: ' ',
                        },
                        backgroundColor: 'greenBright',
                    },
                ),
            );

        } catch (error) {
            console.log(error);
        }
    }
}
