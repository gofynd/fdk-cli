import { FOLDER_NAME } from "../helper/functions.utils";

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

    //ngrok
    NGROK_CONNECTION_ISSUE: {
        message: "Unable to establish ngrok tunnel",
        code: 'FDK-0011'
    },

    // functions
    INVALID_FUNCTION_NAME: {
        message: (reason: string): string => `Invalid Function name: ${reason}`,
        code: 'FDK-0021'
    },
    INVALID_FUNCTION_TYPE: {
        message: `Invalid Function type`,
        code: 'FDK-0022'
    },
    FUNCTION_WITH_SLUG_ALREADY_EXIST:{
        message: (slug: string): string => `Function with slug ${slug} already exists please change your function name`,
        code: 'FDK-0023'
    },
    NO_EXTENSION_FOUND:{
        message: `No Extension found in your organization please create an extension to start with functions`,
        code: 'FDK-0024'
    },
    FOLDER_ALREADY_EXISTS:{
        message: (folderName: string): string => `Folder with name ${folderName} already exists in your functions folder so please update your folder name or create function with new name` ,
        code: 'FDK-0025'  
    },
    INVALID_EXTENSION_DIRECTORY: {
        message: 'Current directory is not an Extension directory. Make sure its an extension directory if its then try after adding the extension context',
        code: 'FDK-0026',
    },
    MISMATCH_ORGANIZATION_ID: {
        message:(currentOrganization, contextOrganization) => `Organization mismatch please update login through correct organization current organization is ${currentOrganization} and extension organization is ${contextOrganization}`,
        code: 'FDK-0027',
    },
    INVALID_FUNCTION_SLUG: {
        message:(availableSlugs: string) => `Invalid Slug. Please provide valid function slug${ availableSlugs ? `, available slugs are ${availableSlugs}` : ''}`,
        code: 'FDK-0028',
    },
    NO_FUNCTION_FOUND_IN_EXTENSION: {
        message: `No Functions found in Extension please create an function to proceed with init`,
        code: 'FDK-0029',       
    },
    INVALID_FUNCTION_EVENTS_ARRAY: {
        message: 'Duplicate events are found in events array',
        code: 'FDK-0030'
    },
    FUNCTION_SLUG_MISMATCH: {
        message: 'Slug mismatch in config file',
        code: 'FDK-0031'
    },
    NO_CHANGES: {
        message: 'No changes to sync',
        code: 'FDK-0032'
    },
    NO_FUNCTIONS_FOLDER: {
        message: `${FOLDER_NAME} folder does not exists at current directory`,
        code: 'FDK-0033'
    },
    NO_FUNCTIONS_IN_FOLDER: {
        message: `No functions found inside ./${FOLDER_NAME} directory`,
        code: 'FDK-0034'
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
