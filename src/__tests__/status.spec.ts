import MockAdapter from 'axios-mock-adapter';
import path from 'path';

import { init } from '../fdk';
import { SERVICE_URL } from '../helper/constants';
import { createDirectory } from '../helper/file.utils';
import { getBaseURL } from '../lib/api/services/utils';
import { axiosInstance } from '../lib/api/services/status.service';

let program;
let mock;

// Create a new mock of the ora library before each test case
const oraMock = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    // add any other methods that you need to mock here
};

const response = {
    ok: 'ok',
};

// Replace the actual ora library with the mock
jest.mock('ora', () => jest.fn(() => oraMock));

describe('Status Commands', () => {
    beforeAll(async () => {
        mock = new MockAdapter(axiosInstance);
    });

    afterAll(async () => {
        // restore console log mock so it does not affect other test cases
    });

    beforeEach(async () => {
        program = await init('fdk');
    });

    afterEach(() => {
        // Clear the mock implementation after each test case
        jest.clearAllMocks();
    });

    // afterAll(() => {});

    it('should all services running', async () => {
        // Set mock
        Object.keys(SERVICE_URL).forEach((name, index) => {
            if (typeof SERVICE_URL[name] === 'string') {
                mock.onGet(`${getBaseURL() + SERVICE_URL[name]}/_healthz`).reply(200, response);
            }
        });

        await program.parseAsync(['ts-node', './src/fdk.ts', 'status', 'check']);
        // Check if the succeed function was called on the ora mock
        expect(oraMock.succeed).toHaveBeenCalledTimes(1);
        expect(oraMock.succeed).toBeCalledWith('All services are working fine.');

        // Reset
        mock.reset();
        Object.keys(SERVICE_URL).forEach((name, index) => {
            if (typeof SERVICE_URL[name] === 'string') {
                mock.onGet(`${getBaseURL() + SERVICE_URL[name]}/_healthz`).reply(
                    index % 2 == 0 ? 503 : 200,
                    index % 2 == 0 ? undefined : response
                );
            }
        });
    });

    it('some of the service should not work', async () => {
        await program.parseAsync(['ts-node', './src/fdk.ts', 'status', 'check']);
        expect(oraMock.fail).toHaveBeenCalledTimes(1);

        // Check mock API logic above
        // We are sending 503 for even services
        const notWorkingServices = Object.keys(SERVICE_URL)
            .filter((_, index) => index % 2 == 0)
            .map(serviceName => serviceName[0].toUpperCase() + serviceName.slice(1))
            .join(', ');
        expect(oraMock.fail).toBeCalledWith(`${notWorkingServices} are not working.`);
    });
});
