import { getActiveContext } from '../../../helper/utils';
import CommandError from '../../CommandError';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime';
export default {
    startUpload: (data, namespace) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions()
            );
            return ApiClient.post(
                URLS.START_UPLOAD_FILE(
                    activeContext.application_id,
                    activeContext.company_id,
                    namespace
                ),
                axiosOption
            );
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    },
    uploadFile: async (filepath, namespace) => {
        console.log('namespace in uploadfile', namespace);
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
            file_name: path.basename(filepath),
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
            URLS.START_UPLOAD_FILE(
                activeContext.application_id,
                activeContext.company_id,
                namespace
            ),
            axiosOption
        );
        console.log('res1',res1);
        const startResponse = res1 ? res1.data : res1;

        let s3Url = startResponse.upload.url;
        // srcCdnUrl = startResponse.cdn.url;

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
    },
};
