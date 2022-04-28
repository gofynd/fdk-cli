"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var Theme_1 = __importDefault(require("../../lib/Theme"));
var ThemeContext_1 = __importDefault(require("../../lib/ThemeContext"));
function themeCommandBuilder() {
    var theme = new commander_1.default.Command('theme').description('Theme Commands');
    theme
        .command('add')
        .alias('new')
        .description('Create Theme')
        .requiredOption('-t, --token [token]', 'Token')
        .requiredOption('-n, --name [name]', 'Theme name')
        .asyncAction(Theme_1.default.createTheme);
    theme
        .command('init')
        .description('Initialize existing theme')
        .requiredOption('-t, --token [token]', 'Token')
        .asyncAction(Theme_1.default.initTheme); // todo
    theme.command('sync').description('Sync theme').asyncAction(Theme_1.default.syncThemeWrapper);
    theme
        .command('serve')
        .description('Serve theme')
        .option('--ssr <boolean>', 'Server side rendering', true)
        .option('--port <number>', 'Custom port')
        .asyncAction(Theme_1.default.serveTheme);
    theme.command('publish').description('Publish theme').asyncAction(Theme_1.default.publishTheme);
    theme.command('unpublish').description('Unpublish theme').asyncAction(Theme_1.default.unPublishTheme);
    theme.command('pull').description('Pull theme').asyncAction(Theme_1.default.pullTheme);
    theme
        .command('pull-config')
        .description('Pull theme config')
        .asyncAction(Theme_1.default.pullThemeConfig);
    theme
        .command('context')
        .description('Add context')
        .requiredOption('-t, --token [token]', 'Token')
        .requiredOption('-n, --name [name]', 'Context name')
        .asyncAction(ThemeContext_1.default.addThemeContext);
    theme.command('context-list').description('List all contexts').asyncAction(ThemeContext_1.default.listThemeContext);
    return theme;
}
exports.default = themeCommandBuilder;
