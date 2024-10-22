import commander from 'commander';
import Theme from '../../lib/Theme';
import ThemeContext from '../../lib/ThemeContext';
export default function themeCommandBuilder() {
    const theme = new commander.Command('theme').description('Theme Commands');
    theme
        .command('new')
        .alias('add')
        .description('Create Theme')
        .requiredOption('-n, --name [name]', 'Theme name')
        .option('-t, --type [type]', 'Theme type', 'react')
        .asyncAction(Theme.createTheme);

    theme
        .command('init')
        .description('Initialize existing theme')
        .asyncAction(Theme.initTheme);

    theme
        .command('sync')
        .description('Sync theme')
        .asyncAction(Theme.syncThemeWrapper);

    theme
        .command('serve')
        .description('Serve theme')
        .option('--ssr <boolean>', 'Server side rendering', true)
        .option('--hmr <boolean>', 'Enable HMR Support', true)
        .option('--port <number>', 'Custom port')
        .asyncAction(Theme.serveTheme);

    theme
        .command('pull')
        .description('Pull theme')
        .asyncAction(Theme.pullTheme);

    // TODO: tech debt update message when both config are same
    theme
        .command('pull-config')
        .description('Pull theme config')
        .asyncAction(Theme.pullThemeConfig);

    theme
        .command('context')
        .description('Add context')
        .requiredOption('-n, --name [name]', 'Context name')
        .asyncAction(ThemeContext.addThemeContext);

    theme
        .command('context-list')
        .description('List all contexts')
        .asyncAction(ThemeContext.listThemeContext);

    theme
        .command('active-context')
        .description('print active_context')
        .asyncAction(ThemeContext.activeContext);

    theme
        .command('open')
        .description('preview theme')
        .asyncAction(Theme.previewTheme);

    // TODO: Improve this to remove hidden files
    theme
        .command('package')
        .description('generate zip file of theme')
        .asyncAction(Theme.generateThemeZip);

    return theme;
}
