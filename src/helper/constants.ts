export const ALL_THEME_COMMANDS = ['context', 'context-list', 'init', 'new', 'publish', 'package', 'pull', 'pull-config', 'sync', 'serve', 'unpublish']
export const THEME_COMMANDS = [ 'publish', 'pull', 'pull-config', 'serve', 'sync', 'unpublish'];
export const ENVIRONMENT_COMMANDS = ['env'];
export const AUTHENTICATION_COMMANDS = ['auth', 'login', 'logout'];
export const EXTENSION_COMMANDS = ['init', 'setup', 'get', 'set'];
export const PARTNER_COMMANDS = ['connect']
export const STATUS_COMMANDS = ['check'];

export const SERVICE_URL = {
    theme: '/service/platform/theme',
    authentication: '/service/panel/authentication',
    configuration: '/service/platform/configuration',
    assets: '/service/platform/assets',
    partners: '/service/platform/partners',
    partnersDynamic: (serverType: string) => `/service/${serverType}/partners`,
};