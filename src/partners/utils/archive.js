const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const { createDirectory } = require('./file-utlis');

function archiveFolder({ srcFolder, destFolder, zipFileName }) {
    return new Promise((resolve, reject) => {
        let filePath = path.resolve(destFolder, zipFileName);
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
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        output.on('close', function () {
            resolve();
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        archive.directory(srcFolder, false);
        archive.finalize();
    });
}

function extractArchive({ zipPath, destFolderPath }) {
    return new Promise((resolve, reject) => {
        try {
            createDirectory(destFolderPath);
            extract(zipPath, { dir: destFolderPath }, function (err) {
                // extraction is complete. make sure to handle the err
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        } catch (e) {
            console.log(e);
        }
    });
}

module.exports = {
    archiveFolder,
    extractArchive
}