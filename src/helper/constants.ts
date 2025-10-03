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

export const DEFAULT_LOCALE = "en"

export const EXTENSION_BRANCH = 'main';

export const TEMPLATES = {
    'node-vue': {
        name: 'Node + Vue 3 + SQLite',
        repo: 'https://github.com/gofynd/example-extension-javascript',
        launchTypes: ['Company', 'Application']
    },
    'node-react': {
        name: 'Node + React.js + SQLite',
        repo: 'https://github.com/gofynd/example-extension-javascript-react',
        launchTypes: ['Company', 'Application']
    },
    'payment-node-react': {
        name: 'Node + React.js + SQLite(Payment)',
        repo: 'https://github.com/gofynd/payment-extension-boilerplate',
        launchTypes: ['Payment']
    }
};

export const INIT_ACTIONS = {
    create_extension: "create_extension",
    select_extension: "select_extension"
};

export const LAUNCH_TYPES = {
    COMPANY: 'Company',
    APPLICATION: 'Application',
    PAYMENT: 'Payment'
};

export function getRepoUrlForTemplate(templateName: string) {
    const template = Object.values(TEMPLATES).find(t => t.name === templateName);
    return template?.repo;
}

export function getTemplateChoices(launchType: string) {
    const type = launchType.toLowerCase();
    if (type === LAUNCH_TYPES.COMPANY.toLowerCase()) {
        return Object.entries(TEMPLATES)
            .filter(([_, template]) => template.launchTypes.some(t => t.toLowerCase() === type))
            .map(([_, template]) => template.name);
    } else if (type === LAUNCH_TYPES.APPLICATION.toLowerCase()) {
        return Object.entries(TEMPLATES)
            .filter(([_, template]) => template.launchTypes.some(t => t.toLowerCase() === type))
            .map(([_, template]) => template.name);
    } else if (type === LAUNCH_TYPES.PAYMENT.toLowerCase()) {
        return Object.entries(TEMPLATES)
            .filter(([_, template]) => template.launchTypes.some(t => t.toLowerCase() === type))
            .map(([_, template]) => template.name);
    }
    // Default to COMPANY if not matched
    return Object.entries(TEMPLATES)
        .filter(([_, template]) => template.launchTypes.some(t => t.toLowerCase() === LAUNCH_TYPES.COMPANY.toLowerCase()))
        .map(([_, template]) => template.name);
}

export const INIT_ACTION_LIST = [
    { name: 'Create new extension', value: INIT_ACTIONS.create_extension },
    { name: 'Select existing extension', value: INIT_ACTIONS.select_extension }
];

export const PROJECT_REPOS = {
    [TEMPLATES['node-vue'].name]: TEMPLATES['node-vue'].repo,
    [TEMPLATES['node-react'].name]: TEMPLATES['node-react'].repo,
    [TEMPLATES['payment-node-react'].name]: TEMPLATES['payment-node-react'].repo
};