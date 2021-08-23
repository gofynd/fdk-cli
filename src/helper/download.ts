import fs from 'fs-extra'
import axios from 'axios'
export async function downloadFile(url: string, filePath: string) {
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
