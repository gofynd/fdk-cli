const fs = require('fs-extra');
const axios = require('axios');

async function downloadFile(url, filePath) {
    fs.ensureFileSync(filePath);
    const writer = fs.createWriteStream(filePath)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

module.exports = {
    downloadFile
}