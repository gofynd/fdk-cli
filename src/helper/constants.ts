export const ALL_THEME_COMMANDS = [
    'context',
    'context-list',
    'init',
    'new',
    'package',
    'pull',
    'pull-config',
    'sync',
    'serve',
];
export const THEME_COMMANDS = ['pull', 'pull-config', 'serve', 'sync'];
export const ENVIRONMENT_COMMANDS = ['env'];
export const AUTHENTICATION_COMMANDS = ['auth', 'login', 'logout'];
export const EXTENSION_COMMANDS = ['init', 'get', 'set', 'pull-env'];
export const MAX_RETRY = 5;
export const THEME_TYPE = {
    vue2: 'vue2',
    react: 'react',
};

// todo: We will change this later, as of now we don't want to show the deprecation warning
// export const DEPRECATED_THEME_COMMANDS = ['publish', 'unpublish', 'context', 'init', 'new', ];
// export const DEPRECATED_AUTHENTICATION_COMMANDS = ['login', 'auth']

// TODO: Add all env here
export const ALLOWD_ENV = {
    fyndx1: 'https://partners.fyndx1.de',
    fyndx5: 'https://partners.fyndx5.de',
    fynd: 'https://partners.fynd.com',
};

export const TEMP_DIR_NAME = 'temp'

export const EXTENSION_CONTEXT_FILE_NAME = 'extension.context.json'

export const EXTENSION_CONTEXT = {    
    EXTENSION_API_KEY: 'EXTENSION_API_KEY',
    EXTENSION_API_SECRET: 'EXTENSION_API_SECRET',
    EXTENSION_BASE_URL: 'EXTENSION_BASE_URL',
    DEVELOPMENT_COMPANY: 'DEVELOPMENT_COMPANY',
    CURRENT_ENV: 'CURRENT_ENV'
}