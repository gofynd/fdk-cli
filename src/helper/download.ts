import fs from 'fs-extra';
import { uninterceptedApiClient } from '../lib/api/ApiClient';
export async function downloadFile(url: string, filePath: string) {
    fs.ensureFileSync(filePath);
    const writer = fs.createWriteStream(filePath);

    const response = await uninterceptedApiClient.get(url, {
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
