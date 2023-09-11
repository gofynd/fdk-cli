import { getActiveContext } from '../../../helper/utils';
import ApiClient, { uninterceptedApiClient } from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime';
import Spinner from '../../../helper/spinner';
export default {
    startUpload: async (data, namespace) => {
        try {
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions(),
            );
            const res = await ApiClient.post(
                URLS.START_UPLOAD_FILE(namespace),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    uploadFile: async (filepath, namespace, file_name = null) => {
        let spinner = new Spinner();
        let textMessage;
        try {
            let stats = fs.statSync(filepath);
            textMessage = `Uploading file ${path.basename(
                filepath,
            )}  [${Math.round(stats.size / 1024)} KB]`;
            spinner.start(textMessage);
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
                getCommonHeaderOptions(),
            );
            const res1 = await ApiClient.post(
                URLS.START_UPLOAD_FILE(namespace),
                axiosOption,
            );
            const startResponse = res1 ? res1.data : res1;

            let s3Url = startResponse.upload.url;

            // upload file to s3
            // using uninterceptedApiClient to skip curl
            const res2 = await uninterceptedApiClient.put(s3Url, {
                data: fs.readFileSync(filepath),
                headers: { 'Content-Type': contentType },
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
                getCommonHeaderOptions(),
            );
            const res3 = await ApiClient.post(
                URLS.COMPLETE_UPLOAD_FILE(namespace),
                axiosOption,
            );
            let completeResponse = res3 ? res3.data : res3;
            spinner.succeed(textMessage);
            return {
                start: startResponse,
                upload: uploadResponse,
                complete: completeResponse,
            };
        } catch (error) {
            spinner.fail(textMessage);
            throw error;
        } finally {
            spinner.stop();
        }
    },
};
