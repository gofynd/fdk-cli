const ERROR_PREFIX = 'Error: ';
const ENOENT_PREFIX = 'ENOENT: ';
export const ErrorCodes = {
    INVALID_THEME_DIRECTORY: {
        message: 'Current directory is not a theme directory',
        code: 'FDK-0001',
    },
    INVALID_CONTEXT: {
        message: 'Context not set',
        code: 'FDK-0002',
    },
    API_ERROR: {
        message: 'API server error',
        code: 'FDK-0003',
    },
    NOT_KNOWN: {
        message: 'Something went wrong',
        code: 'FDK-0004',
    },
    INVALID_INPUT: {
        message: 'Invalid options passed',
        code: 'FDK-0005',
    },

    // Extension
    INVALID_KEYS: {
        message: 'Invalid API Key/API Secret passed',
        code: 'FDK-0006',
    },
    NO_DEVELOPMENT_COMPANY: {
        message: 'Development account not found',
        code: 'FDK-0008',
    },
    NO_COMPANY_FOUND: {
        message: (company_type = 'live', domain) => {
            if (company_type === 'live')
                return `No live company found, please request live company access from partners panel under your selected organization.  For more details, refer to the documentation link: ${domain}/help/docs/guide/partner-panel/accounts#requesting-access-to-a-live-account-of-client`;
            return `No development company found, please create development company from partners panel under your selected organization. For more details, refer to the documentation link: ${domain}/help/docs/guide/partner-panel/accounts#creating-and-managing-development-accounts`;
        },
        code: 'FDK-0009',
    },
    NO_APP_FOUND: {
        message: (domain) =>
            `No sales channel found, Please create a sales channel under development/live account. For more details, refer to the documentation link: ${domain}/help/docs/manage-website/create-website`,
        code: 'FDK-00010',
    },
    NO_THEME_FOUND: {
        message: (domain) =>
            `No themes are created, Please create/add a theme under the sales channel. For more details, refer to the documentation link: ${domain}/help/docs/partners/themes/vuejs/overview`,
        code: 'FDK-00011',
    },
    DOWNGRADE_CLI_VERSION: {
        message:
            'Seems like current Fynd Platform version is not compatible with installed CLI version.\n\nIn order to continue with current FP version, Please use previous version of CLI `npm install -g @gofynd/fdk-cli@3.0.4` command.',
        code: 'FDK-00012',
    },

    // generic
    ECONN_RESET: {
        message: 'Connection is reset by the client',
        code: 'FDK-0009',
    },
    LARGE_PAYLOAD: {
        message: 'File is too large to upload, please optimize it and retry!',
        code: 'FDK-0010',
    },
    NETWORK_ERROR: {
        message: 'Network issue',
        code: 'FDK-0009',
    },
    IN_COMPATIBLE_THEME_VERSION: {
        message: (currentVersion)=> {
         return `Your Fyndplatform version is currently ${currentVersion}. For compatibility, this fdk/cli requires Fyndplatform version 1.9.1 or newer. To align with your current Fynd Platform version, please downgrade your fdk/cli to any of the latest versions less than 5.0.0.`
        },
        code: 'FDK-002'
    },
    FP_VERSION_NOT_AVAILABLE: {
       message: 'Fyndplatform version not available please add the version with a variable PLATFORM_VERSION in your cluster or sandbox',
       code: 'FDK-002'
    }
};

export default class CommandError extends Error {
    code: string;
    response?: any;
    constructor(message?: string, code?: string, response?: any, ...args: any[]) {
        super(message);
        // If e.toString() was called to get `message` we don't want it to look
        // like "Error: Error:".
        if (message && message.startsWith(ERROR_PREFIX)) {
            message = message.substring(ERROR_PREFIX.length);
        }
        if (message && message.startsWith(ENOENT_PREFIX)) {
            message = message.substring(ENOENT_PREFIX.length);
        }
        Object.setPrototypeOf(this, CommandError.prototype);
        this.code = code || 'FDK-0004';
        this.message = message || 'Something went wrong';
        this.response = response || "Response not Received";
        process.exitCode = 1;
    }
}
