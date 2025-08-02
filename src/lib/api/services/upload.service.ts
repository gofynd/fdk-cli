import fs from 'fs-extra';
import path from 'path';
import mime from 'mime';
// import { getActiveContext } from '../../../helper/utils';
import ApiClient, { uninterceptedApiClient } from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import Spinner from '../../../helper/spinner';

export default {

  uploadFile: async (filepath, namespace, file_name = null, mimeType = null) => {
    let spinner;
    if (process.env.DEBUG == 'fdk') {
      spinner = new Spinner();
    }
    let textMessage;
    try {
      const stats = fs.statSync(filepath);
      textMessage = `Uploading file ${path.basename(
        filepath,
      )}  [${Math.round(stats.size / 1024)} KB]`;
      if (spinner) spinner.start(textMessage);
      let contentType = mimeType || mime.getType(path.extname(filepath));

      if (contentType === 'image/jpg') {
        contentType = 'image/jpeg';
      }
      const startData = {
        file_name: file_name || path.basename(filepath),
        content_type: contentType,
        size: stats.size,
      };
      let axiosOption = {

        data: startData,
        ...getCommonHeaderOptions(),
      };
      const res1 = await ApiClient.post(
        URLS.START_UPLOAD_FILE(namespace),
        axiosOption,
      );
      const startResponse = res1 ? res1.data : res1;

      const s3Url = startResponse.upload.url;

      // upload file to s3
      // using uninterceptedApiClient to skip curl
      const res2 = await uninterceptedApiClient.put(s3Url, {
        data: fs.readFileSync(filepath),
        headers: { 'Content-Type': contentType },
      });
      const uploadResponse = res2 ? res2.data : res2;

      // complete
      axiosOption = {

        data: {
          response: startResponse,
          ...startData,
        } as any,
        ...getCommonHeaderOptions(),
      };
      const res3 = await ApiClient.post(
        URLS.COMPLETE_UPLOAD_FILE(namespace),
        axiosOption,
      );
      const completeResponse = res3 ? res3.data : res3;
      if (spinner) spinner.succeed(textMessage);
      return {
        start: startResponse,
        upload: uploadResponse,
        complete: completeResponse,
      };
    } catch (error) {
      if (spinner) spinner.fail(textMessage);
      throw error;
    } finally {
      if (spinner) spinner.stop();
    }
  },
};
