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
    INVALID_PARTNER_TOKEN: {
        message: 'Invalid of Expired Partner access token',
        code: 'FDK-0007',
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
    NO_EXTENSION_FOUND: {
        message:
            'Extension not found',
        code: 'FDK-0016',
    },
    MISSING_FDK_CONFIG_FILE: {
        message:
            'fdk.ext.config.json or fdk.ext.config.yml file not found',
        code: 'FDK-0017',
    },
    INVALID_FDK_CONFIG_FILE: {
        message:
            'fdk.ext.config.json or fdk.ext.config.yml file is in invalid format',
        code: 'FDK-0018',
    },
    INVALID_EXTENSION_LAUNCH_TYPE: {
        message: 'Invalid extension launch type',
        code: 'FDK-0019',
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
    ClOUDFLARE_CONNECTION_ISSUE: {
        message:
            'Something wrong with cloudflare tunnel, please pass --debug flag to get more details',
        code: 'FDK-0015',
    },
    VPN_ISSUE: {
        message:
            'This can be caused due to VPN or Firewall, please contact your network administrator or disable and retry.',
        code: 'FDK-0013',
    },
    MISSING_PORT_OPTION: {
        message: 'The port option is required when tunnel URL is specified.',
        code: 'FDK-0019',
    },
    INVALID_TUNNEL_URL: {
        message: 'Invalid tunnel url',
        code: 'FDK-0020',
    },
    INVALID_PORT_NUMBER: {
        message: 'Invalid port number',
        code: 'FDK-0021',
    },
};

export default class CommandError extends Error {
    code: string;
    response?: any;
    constructor(
        message?: string,
        code?: string,
        response?: any,
        ...args: any[]
    ) {
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
        this.response = response || 'Response not Received';
        process.exitCode = 1;
    }
}
