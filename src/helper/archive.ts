import fs from 'fs';
import path from 'path'
import archiver from 'archiver';
import extract from 'extract-zip';
import { createDirectory } from './file.utils'
import Logger from '../lib/Logger';
export function archiveFolder({ srcFolder, destFolder, zipFileName }) {
    console.log("Archiving");
    return new Promise((resolve, reject) => {
        let filePath = path.resolve(process.cwd(), destFolder, zipFileName);
        // clear previous build archive
        const archiveExists = fs.existsSync(filePath);

        if (archiveExists) {
            fs.unlinkSync(filePath);
        }

        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder)
        }

        const output = fs.createWriteStream(filePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        archive.on('warning', function (err) {
            console.log(err);
            Logger.warn(err.message)
            if (err.code === 'ENOENT') {

                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        output.on('close', function () {
            resolve(true);
        });

        archive.on('error', function (err) {
            console.log(err);
            Logger.error(err.message)
            reject(err);
        });

        archive.pipe(output);
        archive.directory(srcFolder, false);
        archive.finalize();
    });
}

export function extractArchive({ zipPath, destFolderPath }) {
    return new Promise(async (resolve, reject) => {
        try {
            createDirectory(destFolderPath);
            await extract(zipPath, { dir: destFolderPath })
            resolve(true)
        } catch (e) {
            Logger.error(e.message)
            reject(e)
        }
    });
}
