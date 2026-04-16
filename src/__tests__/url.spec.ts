jest.mock('../lib/Config', () => {
    const actual = jest.requireActual<typeof import('../lib/Config')>(
        '../lib/Config',
    );
    const { CONFIG_KEYS } = actual;
    return {
        __esModule: true,
        default: {
            get: (key: string) => {
                if (key === CONFIG_KEYS.API_VERSION) return '1.0';
                if (key === CONFIG_KEYS.CURRENT_ENV_VALUE) {
                    return 'api.test.example.com';
                }
                return undefined;
            },
        },
        CONFIG_KEYS: actual.CONFIG_KEYS,
    };
});

import { URLS } from '../lib/api/services/url';

describe('URLS OAuth (device flow)', () => {
    const authBase =
        'https://api.test.example.com/service/panel/authentication/v1.0';

    it('OAUTH_CLIENT_CONFIG builds panel client-config URL', () => {
        expect(URLS.OAUTH_CLIENT_CONFIG()).toBe(
            `${authBase}/oauth/client-config`,
        );
    });

    it('OAUTH_DEVICE_AUTHORIZATION builds device authorization URL', () => {
        expect(URLS.OAUTH_DEVICE_AUTHORIZATION()).toBe(
            `${authBase}/oauth/device_authorization`,
        );
    });

    it('OAUTH_DEVICE_TOKEN builds OAuth token URL', () => {
        expect(URLS.OAUTH_DEVICE_TOKEN()).toBe(`${authBase}/oauth/token`);
    });
});
