/// <reference types="jest" />
import { addSignatureFn } from '../lib/api/helper/interceptors';
import ConfigStore, { CONFIG_KEYS } from '../lib/Config';

const packageJSON = require('../../package.json');

describe('API request interceptor', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds fdk cli version header before service requests are signed', async () => {
        const interceptor = addSignatureFn({});
        const config: any = {
            url: 'https://api.fyndx1.de/service/panel/authentication/v1.0/oauth/token',
            method: 'get',
            headers: {},
        };

        const signedConfig = await interceptor(config);

        expect(signedConfig.headers['x-fp-cli']).toBe(`${packageJSON.version}`);
        expect(signedConfig.headers['x-fp-date']).toBeDefined();
        expect(signedConfig.headers['x-fp-signature']).toBeDefined();
    });

    it('adds stored region header before fynd service requests are signed', async () => {
        jest.spyOn(ConfigStore, 'get').mockImplementation((key: string) => {
            if (key === CONFIG_KEYS.REGION) return 'asia-south1';
            return undefined;
        });
        const interceptor = addSignatureFn({});
        const config: any = {
            url: 'https://api.fyndx1.de/service/panel/authentication/v1.0/oauth/token',
            method: 'get',
            headers: {},
        };

        const signedConfig = await interceptor(config);

        expect(signedConfig.headers['x-region']).toBe('asia-south1');
        expect(signedConfig.headers['x-fp-signature']).toBeDefined();
    });

    it('does not add stored region header to third-party requests', async () => {
        jest.spyOn(ConfigStore, 'get').mockImplementation((key: string) => {
            if (key === CONFIG_KEYS.REGION) return 'asia-south1';
            return undefined;
        });
        const interceptor = addSignatureFn({});
        const config: any = {
            url: 'https://storage.googleapis.com/fdk-upload/signed-url',
            method: 'put',
            headers: {},
        };

        const signedConfig = await interceptor(config);

        expect(signedConfig.headers['x-region']).toBeUndefined();
        expect(signedConfig.headers['x-fp-signature']).toBeUndefined();
    });
});
