import { getActiveContext } from '../../../helper/utils';
import { consolidateErrorMessage } from '../../../helper/error.utils';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime';
export default {
  startUpload: async (data, namespace) => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      const res = await ApiClient.post(
        URLS.START_UPLOAD_FILE(activeContext.application_id, activeContext.company_id, namespace),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  uploadFile: async (filepath, namespace, file_name = null) => {
    try {
      const activeContext = getActiveContext();
    let stats;
    // start
    try {
      stats = fs.statSync(filepath);
    } catch (err) {
      // if the file does not exist, just return
      console.log(err);
      return;
    }
    let contentType = mime.getType(path.extname(filepath));
    if (contentType === 'image/jpg') {
      contentType = 'image/jpeg';
    }
    const startData = {
      file_name: file_name || path.basename(filepath),
      content_type: contentType,
      size: stats.size,
    };
    let axiosOption = Object.assign(
      {},
      {
        data: startData,
      },
      getCommonHeaderOptions()
    );
    const res1 = await ApiClient.post(
      URLS.START_UPLOAD_FILE(activeContext.application_id, activeContext.company_id, namespace),
      axiosOption
    );
    const startResponse = res1 ? res1.data : res1;

    let s3Url = startResponse.upload.url;

    //upload file to s3
    const res2 = await ApiClient.put(s3Url, {
        data: fs.readFileSync(filepath),
        headers: { 'Content-type': contentType },
    });
    let uploadResponse = res2 ? res2.data : res2;

    // complete
    axiosOption = Object.assign(
        {},
        {
            data: {
                response: startResponse,
                ...startData,
            },
        },
        getCommonHeaderOptions()
    );
    const res3 = await ApiClient.post(
        URLS.COMPLETE_UPLOAD_FILE(
            activeContext.application_id,
            activeContext.company_id,
            namespace
        ),
        axiosOption
    );
    let completeResponse = res3 ? res3.data : res3;

    return {
        start: startResponse,
        upload: uploadResponse,
        complete: completeResponse,
      };
    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  }
};
