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
export const EXTENSION_COMMANDS = ['init', 'setup', 'get', 'set'];
export const PARTNER_COMMANDS = ['connect']
export const STATUS_COMMANDS = ['check'];

export const SERVICE_URL = {
    theme: '/service/partner/theme',
    authentication: '/service/panel/authentication',
    configuration: '/service/partner/partners',
    assets: '/service/partner/assets',
    partners: '/service/platform/partners',
    blitzkriegPanel: '/service/panel/theme',
    partnersDynamic: (serverType: string) => `/service/${serverType}/partners`,
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
