import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import fs from 'fs-extra';
import path from 'path';
import UploadService from '../lib/api/services/upload.service';
import { URLS } from '../lib/api/services/url';
import { uninterceptedApiClient } from '../lib/api/ApiClient';

const assetsUploadData = require('./fixtures/assetsUploadData.json');
const assetsCompleteUpload = require('./fixtures/assetsCompleteUpload.json');

describe('UploadService', () => {
    let mock: MockAdapter;
    let uploadMock: MockAdapter;
    let tmpDir: string;
    let filePath: string;
    let previousApiRetryDelay: string;
    let previousStorageRetryDelay: string;
    let previousUploadConcurrency: string;

    beforeEach(() => {
        previousApiRetryDelay = process.env.FDK_CLI_UPLOAD_API_RETRY_DELAY_MS;
        previousStorageRetryDelay =
            process.env.FDK_CLI_STORAGE_PUT_RETRY_DELAY_MS;
        previousUploadConcurrency = process.env.FDK_CLI_UPLOAD_CONCURRENCY;
        process.env.FDK_CLI_UPLOAD_API_RETRY_DELAY_MS = '0';
        process.env.FDK_CLI_STORAGE_PUT_RETRY_DELAY_MS = '0';
        mock = new MockAdapter(axios);
        uploadMock = new MockAdapter(uninterceptedApiClient.axiosInstance);
        tmpDir = fs.mkdtempSync(path.join(__dirname, 'upload-service-'));
        filePath = path.join(tmpDir, 'themeBundle.css');
        fs.writeFileSync(filePath, 'body { color: #111; }');
    });

    afterEach(() => {
        mock.restore();
        uploadMock.restore();
        fs.removeSync(tmpDir);
        restoreEnv('FDK_CLI_UPLOAD_API_RETRY_DELAY_MS', previousApiRetryDelay);
        restoreEnv(
            'FDK_CLI_STORAGE_PUT_RETRY_DELAY_MS',
            previousStorageRetryDelay,
        );
        restoreEnv('FDK_CLI_UPLOAD_CONCURRENCY', previousUploadConcurrency);
    });

    it('retries transient upload/start 503 responses', async () => {
        const namespace = 'application-theme-assets';
        const startUpload = buildStartUpload('https://upload.example.test/one.css');

        mock.onPost(URLS.START_UPLOAD_FILE(namespace)).replyOnce(
            503,
            'upstream connect error or disconnect/reset before headers. reset reason: connection timeout',
            { 'content-type': 'text/plain' },
        );
        mock.onPost(URLS.START_UPLOAD_FILE(namespace)).replyOnce(200, startUpload);
        uploadMock.onPut(startUpload.upload.url).reply(200, '');
        mock.onPost(URLS.COMPLETE_UPLOAD_FILE(namespace)).reply(
            200,
            assetsCompleteUpload,
        );

        const response = await UploadService.uploadFile(filePath, namespace);

        expect(response.complete).toEqual(assetsCompleteUpload);
        expect(
            mock.history.post.filter(
                (request) => request.url === URLS.START_UPLOAD_FILE(namespace),
            ),
        ).toHaveLength(2);
    });

    it('retries transient Google Storage PUT DNS failures', async () => {
        const namespace = 'application-theme-assets';
        const startUpload = buildStartUpload(
            'https://storage.googleapis.com/themeBundle.css',
        );
        const dnsError: any = new Error(
            'getaddrinfo ENOTFOUND storage.googleapis.com',
        );
        dnsError.code = 'ENOTFOUND';
        dnsError.request = {};
        dnsError.config = {};

        mock.onPost(URLS.START_UPLOAD_FILE(namespace)).replyOnce(200, startUpload);
        uploadMock.onPut(startUpload.upload.url).replyOnce(() =>
            Promise.reject(dnsError),
        );
        uploadMock.onPut(startUpload.upload.url).replyOnce(200, '');
        mock.onPost(URLS.COMPLETE_UPLOAD_FILE(namespace)).reply(
            200,
            assetsCompleteUpload,
        );

        const response = await UploadService.uploadFile(filePath, namespace);

        expect(response.complete).toEqual(assetsCompleteUpload);
        expect(uploadMock.history.put).toHaveLength(2);
    });

    it('retries transient upload/complete 503 responses', async () => {
        const namespace = 'application-theme-assets';
        const startUpload = buildStartUpload('https://upload.example.test/one.css');

        mock.onPost(URLS.START_UPLOAD_FILE(namespace)).replyOnce(200, startUpload);
        uploadMock.onPut(startUpload.upload.url).reply(200, '');
        mock.onPost(URLS.COMPLETE_UPLOAD_FILE(namespace)).replyOnce(
            503,
            'upstream connect error or disconnect/reset before headers. reset reason: connection timeout',
            { 'content-type': 'text/plain' },
        );
        mock.onPost(URLS.COMPLETE_UPLOAD_FILE(namespace)).replyOnce(
            200,
            assetsCompleteUpload,
        );

        const response = await UploadService.uploadFile(filePath, namespace);

        expect(response.complete).toEqual(assetsCompleteUpload);
        expect(
            mock.history.post.filter(
                (request) => request.url === URLS.COMPLETE_UPLOAD_FILE(namespace),
            ),
        ).toHaveLength(2);
    });

    it('limits concurrent upload operations', async () => {
        process.env.FDK_CLI_UPLOAD_CONCURRENCY = '1';
        const namespace = 'application-theme-assets';
        const secondFilePath = path.join(tmpDir, 'themeBundleTwo.css');
        fs.writeFileSync(secondFilePath, 'body { color: #222; }');
        let activePuts = 0;
        let maxActivePuts = 0;

        mock.onPost(URLS.START_UPLOAD_FILE(namespace)).reply((config) => {
            const data =
                typeof config.data === 'string'
                    ? JSON.parse(config.data)
                    : config.data;
            return [
                200,
                buildStartUpload(
                    `https://storage.googleapis.com/${data.file_name}`,
                    data.file_name,
                ),
            ];
        });
        uploadMock.onPut(/https:\/\/storage\.googleapis\.com\/.+/).reply(
            async () => {
                activePuts++;
                maxActivePuts = Math.max(maxActivePuts, activePuts);
                await new Promise((resolve) => setTimeout(resolve, 10));
                activePuts--;
                return [200, ''];
            },
        );
        mock.onPost(URLS.COMPLETE_UPLOAD_FILE(namespace)).reply(
            200,
            assetsCompleteUpload,
        );

        await Promise.all([
            UploadService.uploadFile(filePath, namespace, 'one.css'),
            UploadService.uploadFile(secondFilePath, namespace, 'two.css'),
        ]);

        expect(uploadMock.history.put).toHaveLength(2);
        expect(maxActivePuts).toBe(1);
    });
});

const buildStartUpload = (uploadUrl: string, fileName = 'themeBundle.css') => ({
    ...assetsUploadData,
    file_name: fileName,
    upload: {
        ...assetsUploadData.upload,
        url: uploadUrl,
    },
});

const restoreEnv = (key: string, value: string) => {
    if (value === undefined) {
        delete process.env[key];
        return;
    }
    process.env[key] = value;
};
