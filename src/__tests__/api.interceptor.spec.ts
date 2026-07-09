/// <reference types="jest" />
import { addSignatureFn } from '../lib/api/helper/interceptors';

const packageJSON = require('../../package.json');

describe('API request interceptor', () => {
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
});
