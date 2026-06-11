import { getActiveContext } from '../../../helper/utils';
import ApiClient, { uninterceptedApiClient } from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime';
import Spinner from '../../../helper/spinner';
import Logger from '../../Logger';
import {
    STORAGE_PUT_MAX_ATTEMPTS,
    STORAGE_PUT_RETRY_DELAY_MS,
    STORAGE_PUT_RETRY_ERROR_CODES,
    STORAGE_PUT_RETRY_STATUS_CODES,
    UPLOAD_API_MAX_ATTEMPTS,
    UPLOAD_API_RETRY_DELAY_MS,
    UPLOAD_API_RETRY_STATUS_CODES,
    UPLOAD_CONCURRENCY,
} from '../../../helper/constants';

let activeUploadSlots = 0;
const uploadQueue: Array<() => void> = [];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getNumberFromEnv = (
    key: string,
    fallback: number,
    allowZero = false,
) => {
    const value = Number(process.env[key]);
    if (!Number.isFinite(value)) return fallback;
    return allowZero ? (value >= 0 ? value : fallback) : value > 0 ? value : fallback;
};

const acquireUploadSlot = () =>
    new Promise<void>((resolve) => {
        const acquire = () => {
            const limit = getNumberFromEnv(
                'FDK_CLI_UPLOAD_CONCURRENCY',
                UPLOAD_CONCURRENCY,
            );
            if (activeUploadSlots < limit) {
                activeUploadSlots++;
                resolve();
                return;
            }
            uploadQueue.push(acquire);
        };
        acquire();
    });

const releaseUploadSlot = () => {
    activeUploadSlots = Math.max(0, activeUploadSlots - 1);
    const next = uploadQueue.shift();
    if (next) next();
};

const getUploadApiRetryDelay = (attempt: number) =>
    Math.min(
        getNumberFromEnv(
            'FDK_CLI_UPLOAD_API_RETRY_DELAY_MS',
            UPLOAD_API_RETRY_DELAY_MS,
            true,
        ) * attempt,
        5000,
    );

const getStoragePutRetryDelay = (attempt: number) =>
    Math.min(
        getNumberFromEnv(
            'FDK_CLI_STORAGE_PUT_RETRY_DELAY_MS',
            STORAGE_PUT_RETRY_DELAY_MS,
            true,
        ) * attempt,
        5000,
    );

const isRetryableUploadApiError = (error) =>
    UPLOAD_API_RETRY_STATUS_CODES.indexOf(error?.response?.status) !== -1;

const isRetryableStoragePutError = (error) =>
    STORAGE_PUT_RETRY_STATUS_CODES.indexOf(error?.response?.status) !== -1 ||
    STORAGE_PUT_RETRY_ERROR_CODES.indexOf(error?.code) !== -1;

const redactSignedUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch (error) {
        return url;
    }
};

const postUploadApiWithRetry = async ({
    stage,
    endpoint,
    axiosOption,
    debugId,
    startData,
    namespace,
}) => {
    for (let attempt = 1; attempt <= UPLOAD_API_MAX_ATTEMPTS; attempt++) {
        try {
            return await ApiClient.post(endpoint, axiosOption);
        } catch (error) {
            if (
                attempt >= UPLOAD_API_MAX_ATTEMPTS ||
                !isRetryableUploadApiError(error)
            ) {
                throw error;
            }

            const delayMs = getUploadApiRetryDelay(attempt);
            Logger.debug(
                `[uploadFile:${debugId}] ${stage} retry attempt=${attempt + 1}/${UPLOAD_API_MAX_ATTEMPTS} endpoint=${endpoint} file=${startData.file_name} namespace=${namespace} status=${error?.response?.status} message=${error?.message} delay_ms=${delayMs}`,
            );
            await wait(delayMs);
        }
    }
};

const putStorageWithRetry = async ({
    s3Url,
    data,
    contentType,
    debugId,
    startData,
    namespace,
}) => {
    const endpoint = redactSignedUrl(s3Url);
    for (let attempt = 1; attempt <= STORAGE_PUT_MAX_ATTEMPTS; attempt++) {
        try {
            return await uninterceptedApiClient.put(s3Url, {
                data,
                headers: { 'Content-Type': contentType },
            });
        } catch (error) {
            if (
                attempt >= STORAGE_PUT_MAX_ATTEMPTS ||
                !isRetryableStoragePutError(error)
            ) {
                throw error;
            }

            const delayMs = getStoragePutRetryDelay(attempt);
            Logger.debug(
                `[uploadFile:${debugId}] storage-put retry attempt=${attempt + 1}/${STORAGE_PUT_MAX_ATTEMPTS} endpoint=${endpoint} file=${startData.file_name} namespace=${namespace} code=${error?.code} status=${error?.response?.status} message=${error?.message} delay_ms=${delayMs}`,
            );
            await wait(delayMs);
        }
    }
};

export default {

    uploadFile: async (filepath, namespace, file_name = null, mimeType = null) => {
        await acquireUploadSlot();
        let spinner
        if(process.env.DEBUG == 'fdk') {
            spinner = new Spinner();
        }
        let textMessage;
        const debugId = `${Date.now()}-${path.basename(filepath)}`;
        try {
            let stats = fs.statSync(filepath);
            textMessage = `Uploading file ${path.basename(
                filepath,
            )}  [${Math.round(stats.size / 1024)} KB]`;
            spinner && spinner.start(textMessage);
            let contentType = mimeType || mime.getType(path.extname(filepath));

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
            const startEndpoint = URLS.START_UPLOAD_FILE(namespace);
            const res1 = await postUploadApiWithRetry({
                stage: 'upload/start',
                endpoint: startEndpoint,
                axiosOption,
                debugId,
                startData,
                namespace,
            });
            const startResponse = res1 ? res1.data : res1;

            let s3Url = startResponse.upload.url;

            // upload file to s3
            // using uninterceptedApiClient to skip curl
            const res2 = await putStorageWithRetry({
                s3Url,
                data: fs.readFileSync(filepath),
                contentType,
                debugId,
                startData,
                namespace,
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
            const completeEndpoint = URLS.COMPLETE_UPLOAD_FILE(namespace);
            const res3 = await postUploadApiWithRetry({
                stage: 'upload/complete',
                endpoint: completeEndpoint,
                axiosOption,
                debugId,
                startData,
                namespace,
            });
            let completeResponse = res3 ? res3.data : res3;
            spinner && spinner.succeed(textMessage);
            return {
                start: startResponse,
                upload: uploadResponse,
                complete: completeResponse,
            };
        } catch (error) {
            spinner && spinner.fail(textMessage);
            throw error;
        } finally {
            releaseUploadSlot();
            spinner && spinner.stop();
        }
    },
};
