import fs from 'fs-extra';
import { uninterceptedApiClient } from '../lib/api/ApiClient';

export async function downloadFile(url: string, filePath: string): Promise<void> {
  // Ensure the file exists before attempting to write to it
  fs.ensureFileSync(filePath);

  // Create a writable stream to save the downloaded file
  const writer = fs.createWriteStream(filePath);

  // Fetch the file as a stream
  const response = await uninterceptedApiClient.get(url, {
    responseType: 'stream',
  });

  // Pipe the data stream to the file writer
  response.data.pipe(writer);

  // Return a promise that resolves when the download is finished or rejects if an error occurs
  return new Promise<void>((resolve, reject) => {
    writer.on('finish', () => resolve()); // Ensure resolve is called without any arguments
    writer.on('error', (error) => reject(error)); // Directly pass the error to the reject function
  });
}
