const ERROR_PREFIX = 'Error: ';
const ENOENT_PREFIX = 'ENOENT: '
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
    code: 'FDK-0006'
  },
  INVALID_PARTNER_TOKEN: {
    message: 'Invalid of Expired Partner access token',
    code: 'FDK-0007'
  },
  NO_DEVELOPMENT_COMPANY: {
    message: "Development account not found",
    code: 'FDK-0008'
  },
  NETWORK_ERROR: {
    message: "Network issue",
    code: 'FDK-0009'
  }
};

export default class CommandError extends Error {
  code: string;
  constructor(message?: string, code?: string, ...args: any[]) {
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
    process.exitCode = 1;
  }
}
