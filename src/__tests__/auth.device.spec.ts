/// <reference types="jest" />
import rimraf from 'rimraf';
import Auth from '../lib/Auth';
import ApiClient from '../lib/api/ApiClient';
import Env from '../lib/Env';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import OrganizationService from '../lib/api/services/organization.service';
import CommandError from '../lib/CommandError';
import Logger from '../lib/Logger';

const openMock = jest.fn();

jest.mock('open', () => ({
    __esModule: true,
    default: (...args) => openMock(...args),
}));

jest.mock('../helper/formatter', () => ({
    OutputFormatter: {
        link: (value: string) => value,
        command: (value: string) => value,
    },
    successBox: ({ text }: { text: string }) => text,
}));

jest.mock('configstore', () => {
    const Store = jest.requireActual('configstore');
    return class MockConfigstore {
        store = new Store('test-cli', undefined, {
            configPath: './auth-device-test-cli.json',
        });
        get(key: string) {
            return this.store.get(key);
        }
        set(key: string, value) {
            this.store.set(key, value);
        }
        delete(key) {
            this.store.delete(key);
        }
        clear() {
            this.store.clear();
        }
    };
});

describe('Auth device flow', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        configStore.clear();
        process.exitCode = 0;

        jest.spyOn(Env, 'verifyAndSanitizeEnvValue').mockResolvedValue('api.fyndx1.de');
        jest.spyOn(Env, 'getEnvValue').mockReturnValue('api.fyndx1.de');
        jest.spyOn(Logger, 'info').mockImplementation(() => {});
        jest.spyOn(OrganizationService, 'getOrganizationDetails').mockResolvedValue({
            data: { _id: 'org-1', name: 'Test Org' },
        } as any);
        openMock.mockResolvedValue(undefined);
    });

    afterEach(() => {
        process.exitCode = 0;
    });

    afterAll(() => {
        rimraf.sync('./auth-device-test-cli.json');
    });

    it('uses device flow and appends missing URL params', async () => {
        const getSpy = jest.spyOn(ApiClient, 'get').mockResolvedValue({
            data: {
                client_id: 'fdk-cli',
                auth_mode: 'device_code',
                min_cli_version: '8.0.6',
            },
        } as any);

        const postSpy = jest.spyOn(ApiClient, 'post');
        postSpy
            .mockResolvedValueOnce({
                data: {
                    device_code: 'device-code-1',
                    user_code: 'ABCD-EFGH',
                    verification_uri_complete: 'https://partners.fyndx1.de/activate-with-code',
                    interval: 0,
                    expires_in: 10,
                },
            } as any)
            .mockResolvedValueOnce({
                data: {
                    auth_token: {
                        access_token: 'token-1',
                        expires_in: 3600,
                        current_user: { first_name: 'A', last_name: 'B', emails: [] },
                    },
                    organization: { _id: 'org-1', name: 'Test Org' },
                },
            } as any);

        await Auth.login({ host: 'api.fyndx1.de' });

        expect(getSpy).toHaveBeenCalled();
        expect(postSpy).toHaveBeenCalledTimes(2);
        expect(openMock).toHaveBeenCalledTimes(1);
        const openedUrl = openMock.mock.calls[0][0] as string;
        expect(openedUrl).toContain('user_code=ABCD-EFGH');
        expect(openedUrl).toContain('device_flow=true');
        expect(configStore.get(CONFIG_KEYS.AUTH_TOKEN).access_token).toBe('token-1');
    });

    it('maps expired_token polling response to CommandError', async () => {
        jest.spyOn(ApiClient, 'get').mockResolvedValue({
            data: {
                client_id: 'fdk-cli',
                auth_mode: 'device_code',
                min_cli_version: '8.0.6',
            },
        } as any);

        const postSpy = jest.spyOn(ApiClient, 'post');
        postSpy
            .mockResolvedValueOnce({
                data: {
                    device_code: 'device-code-2',
                    user_code: 'WXYZ-2345',
                    verification_uri_complete:
                        'https://partners.fyndx1.de/activate-with-code?user_code=WXYZ-2345&device_flow=true',
                    interval: 0,
                    expires_in: 10,
                },
            } as any)
            .mockRejectedValueOnce({
                response: { data: { error: 'expired_token' } },
            });

        try {
            await Auth.login({ host: 'api.fyndx1.de' });
            fail('Expected Auth.login to throw for expired_token');
        } catch (error) {
            expect(error).toBeInstanceOf(CommandError);
            expect(error.message).toBe('Device code expired. Please run `fdk login` again.');
            expect(error.code).toBe('400');
        }
    });
});

