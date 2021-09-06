import commander from 'commander';
import Theme from '../../lib/Theme';
import ThemeContext from '../../lib/ThemeContext';
export default function themeCommandBuilder() {
    const theme = new commander.Command('theme').description('Theme Commands');
    theme
        .command('add')
        .alias('create')
        .description('Create Theme')
        .requiredOption('-t, --token [token]', 'Token')
        .requiredOption('-n, --name [name]', 'Theme name')
        .asyncAction(Theme.createTheme);

    theme
        .command('init')
        .description('Initialize existing theme')
        .requiredOption('-t, --token [token]', 'Token')
        .asyncAction(Theme.initTheme); // todo

    theme.command('sync').description('Sync theme').asyncAction(Theme.syncThemeWrapper);

    theme
        .command('serve')
        .description('Serve theme')
        .option('--ssr <boolean>', 'Server side rendering', true)
        .asyncAction(Theme.serveTheme);

    theme.command('publish').description('Publish theme').asyncAction(Theme.publishTheme);

    theme.command('unpublish').description('Unpublish theme').asyncAction(Theme.unPublishTheme);

    theme.command('pull').description('Pull theme').asyncAction(Theme.pullTheme);

    theme
        .command('pull-config')
        .description('Pull theme config')
        .asyncAction(Theme.pullThemeConfig);

    theme
        .command('context')
        .description('Add context')
        .requiredOption('-t, --token [token]', 'Token')
        .requiredOption('-n, --name [name]', 'Context name')
        .asyncAction(ThemeContext.addThemeContext);

    theme.command('context-list').description('List all contexts').asyncAction(ThemeContext.listThemeContext);

    return theme;
}
