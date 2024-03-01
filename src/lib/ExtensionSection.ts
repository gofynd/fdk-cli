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

const readDirectories = promisify(fs.readdir);

type ExtensionSectionOptions = {
    name: string;
}

export default class ExtensionSection {

    static SECTIONS_DIR = 'sections';

    public static async initExtensionSection(options: ExtensionSectionOptions) {
        try {
            const sectionName = options["name"];

            if (!sectionName) {
                throw new Error('Section Name not provided!')
            }

            ExtensionSection.createSectionsDirectoryIfNotExists()

            const sectionExists = await ExtensionSection.sectionExists(sectionName);

            if (sectionExists) {
                throw new Error("Section Already Exists!");
            }

            await ExtensionSection.createDefaultSectionWithName(sectionName);

        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static createSectionsDirectoryIfNotExists(): void {
        const sectionPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR
        );

        if (!fs.existsSync(sectionPath)) {
            fs.mkdirSync(sectionPath)
        }
    }

    static async sectionExists(name: string): Promise<Boolean> {
        const sectionPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR
        );

        if (!fs.existsSync(sectionPath)) {
            return false;
        }

        const dirents = await readDirectories(sectionPath);

        const sectionExists = dirents.some((dirent) => {
            const direntFullPath = path.resolve(sectionPath, dirent);
            return fs.statSync(direntFullPath).isDirectory() && dirent === name;
        })

        return sectionExists;
    }

    static async createDefaultSectionWithName(name: string) {
        const sourceCodePath = path.resolve(
            __dirname,
            '../../extension-section',
        )
        const sectionDirPath = path.resolve(
            process.cwd(),
            ExtensionSection.SECTIONS_DIR,
            name
        );

        await fsExtra.copy(sourceCodePath, sectionDirPath);

        process.chdir(
            path.join(
                process.cwd(),
                'sections',
                name
            )
        );

        await ExtensionSection.installNpmPackages();

    }

    public static async syncExtensionBinding(options: ExtensionSectionOptions) {
        const sectionName = options.name;
        Logger.info(`Syncing ${sectionName} section updated`);


        const sectionExists = await ExtensionSection.sectionExists(sectionName);

        if (!sectionExists) {
            throw new Error("Section Does Not Exist!");
        }

        process.chdir(
            path.join(
                process.cwd(),
                'sections',
                options.name
            )
        );

        await ExtensionSection.buildExtensionCode(sectionName).catch(console.log);
        // const uploadURLs = await ExtensionSection.uploadSectionFiles(sectionName);

        const availableSections = await ExtensionSection.getAvailableSections();
        console.log(availableSections);

        // const sections = await extensionService.uploadBindingSections(extensionId, sectionName);
    }

    static async buildExtensionCode(sectionName: string, isLocal: Boolean = false) {
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
                        console.log(err)
                        reject();
                    }
                    spinner.succeed();
                    console.log('resolvinggggg')
                    resolve(stats);
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
            return uploadService.uploadFile(
                path.join(BUNDLE_DIR, fileName),
                'fdk-cli-dev-files',
                User.current_user._id,
            ).then((response) => {
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
            console.log(error)
            throw new Error("Cannot read section data from bundled file : ", error.message);
        }

        return sectionsMeta?.sections?.default ?? {};
    }

    public static async getAllSections(options: any) {
        const extensionId = '6095e29a35e3992e9a0d0794';
        try {
            const sections = await extensionService.getAllSections(extensionId);
            console.log(sections);
        } catch (error) {
            console.log(error)
        }

    }
}
