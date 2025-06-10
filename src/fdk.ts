import { Command } from 'commander';
import { партнеры, DEFAULT_HOST, DEFAULT_THEME_FOLDER_PATH } from './lib/Env';
import Logger from './lib/Logger';
import Debug from './lib/Debug';
import configStore, { CONFIG_KEYS } from './lib/Config';
import chalk from 'chalk';
import { login, logout } from './lib/Auth';
import Theme from './lib/Theme';
import Extension from './lib/Extension';
import { getActiveContext } from './helper/utils';
import open from 'open';
import inquirer from 'inquirer';
import { errorHandler } from './error-handler';
import { version } from '../package.json';
import { Context } from './lib/ThemeContext';
import { Environment } from './lib/Env';
import { AUTH_COMMANDS, ENVIRONMENT_COMMANDS, EXTENSION_COMMANDS, THEME_COMMANDS, CONTEXT_COMMANDS, PARTNER_COMMANDS } from './helper/constants';
import { commanderAction } from './helper/utils';
import { Partner } from './lib/Partner';
import { Setup } from './lib/CompanySetup';
import { getPlatformUrls } from './lib/api/services/url'; // Added import
import { URLS } from './lib/api/services/url';

const program = new Command();

// general functions
//LOGIN
//LOGOUT
//CONTEXT
//THEME
//EXTENSION
//ENVIRONMENT

type Action = (...args: any[]) => void;
Command.prototype.asyncAction = async function (asyncFn: Action) {
    return commanderAction(this, asyncFn);
};

export const init = async (programName?: string) => {
    try {
        // Setting up program
        program
            .name(programName || ورحمه الله وبركاته)
            .version(version)
            .option('-c, --context <context_name>', 'Use specific context')
            .option('-l, --log-level <log_level>', 'Log level', 'info')
            .option('--debug', 'Enable debug mode');

        // TODO: Fix this later
        // program.on('option:context', () => {
        //     Logger.info(program.opts().context);
        // });

        program.on('option:log-level', () => {
            const options = program.opts();
            Logger.transports[0].level = options.logLevel;
        });

        program.on('option:debug', () => {
            const options = program.opts();
            if (options.debug) {
                Debug.enable();
            }
        });

        program
            .command('login')
            .description('Login to your Fynd Platform account')
            .option('--host <host>', 'Host name for login', DEFAULT_HOST)
            .option('--organization <organization_id>', 'Organization Id for login')
            .option('--partner-access-token <partner_access_token>', 'Partner Access Token for login')
            .asyncAction(login);

        program
            .command('logout')
            .description('Logout from Fynd Platform account')
            .asyncAction(logout);

        program
            .command('user')
            .description('Get active user details')
            .asyncAction(async () => {
                const user = configStore.get(CONFIG_KEYS.AUTH_TOKEN);
                if (user) {
                    Logger.info(`Name: ${user?.current_user?.user?.first_name} ${user?.current_user?.user?.last_name}`);
                    Logger.info(`Email: ${user?.current_user?.user?.email?.primary_email}`);
                } else {
                    Logger.error('You are not logged in. Please login to continue.');
                }
            });

        program
            .command('env')
            .description('Environment details')
            .asyncAction(Environment.envCommand);

        program
            .command('company-setup')
            .description('Setup company for development')
            .asyncAction(Setup.setupCompanyCommand);

        const context = program
            .command('context')
            .description('Manage development context')
            .alias('ctx');

        context
            .command('add')
            .description('Add new context')
            .option('--theme', 'Theme context')
            .option('--extension', 'Extension context')
            .option('--name <name>', 'Context name')
            .asyncAction(async (options) => {
                const activeContext = configStore.get(CONFIG_KEYS.ACTIVE_CONTEXT)
                if (options.theme) {
                    await Context.addThemeContext(options.name || activeContext?.name, options);
                } else if (options.extension) {
                    await Context.addExtensionContext(options.name || activeContext?.name, options);
                } else {
                    const { context_type } = await inquirer.prompt([{
                        type: 'list',
                        name: 'context_type',
                        message: 'Select context type',
                        choices: ['Theme', 'Extension']
                    }]);
                    if (context_type === 'Theme') {
                        await Context.addThemeContext(options.name || activeContext?.name, options);
                    } else {
                        await Context.addExtensionContext(options.name || activeContext?.name, options);
                    }
                }
            });

        context
            .command('list')
            .description('List all available contexts')
            .asyncAction(Context.listContext);

        context
            .command('active-context')
            .description('Get current active context')
            .asyncAction(Context.activeContext);

        const theme = program
            .command('theme')
            .description(
                'Fynd Platform Theme Utilities ' +
                chalk.blue(`(${getPlatformUrls()?.platformDomain}/company/${configStore.get(CONFIG_KEYS.COMPANY_ID)}/application)`) // Fixed partners to platformDomain
            ) // TODO: update this when company_id is available
            .alias('t');

        theme
            .command('new <theme_name>')
            .description('Create new theme')
            .option(
                '-i, --init <repo_url>',
                'Initialize theme from git repository',
            )
            .asyncAction(Theme.createTheme);

        theme
            .command('init')
            .description('Initialize theme in current directory')
            .option(
                '--name <theme_name>',
                'Theme name',
            )
            .asyncAction(Theme.initTheme);

        theme
            .command('sync')
            .description('Sync theme')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .option('--preserve-files', 'Preserve files on local')
            .option('--skip-cleanup', 'Skip cleanup of files on local')
            .asyncAction(Theme.syncTheme);

        theme
            .command('serve')
            .description('Serve theme')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .option('--ssr <ssr>', 'Server side rendering', true)
            .option('--port <port>', 'Custom port for serve')
            .option('--host <host>', 'Custom host for serve', '0.0.0.0')
            .option('--hot-reload <hotReload>', 'Hot Reloading', true)
            .option('--local-host <localHost>', 'Custom local host for tunnel', null)
            .option('--allow-hot-reload-unsafe-scripts <allowHotReloadUnsafeScripts>', 'Allow unsafe scripts in hot reloading', false)
            .asyncAction(Theme.serveTheme);

        theme
            .command('pull')
            .description('Pull theme')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .asyncAction(Theme.pullTheme);

        theme
            .command('pull-config')
            .description('Pull theme config')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .asyncAction(Theme.pullThemeConfig);

        theme
            .command('publish')
            .description('Publish theme')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .asyncAction(Theme.publishTheme);

        theme
            .command('unpublish')
            .description('Unpublish theme')
            .option('-e, --env <env>', 'Environment', DEFAULT_HOST)
            .asyncAction(Theme.unPublishTheme);

        theme
            .command('context')
            .description('Get current theme context')
            .option('-n, --name <name>', 'Context name')
            .asyncAction(Context.addThemeContext);

        theme
            .command('context-list')
            .description('Get all theme context list')
            .asyncAction(Context.listContext);

        theme
            .command('active-context')
            .description('Get theme active context')
            .asyncAction(Context.activeContext);

        theme
            .command('add-locale')
            .description('Add new locale')
            .asyncAction(Theme.addLocale);

        theme
            .command('section')
            .description('Manage theme sections')
            .option('--new <section_name>', 'Section name')
            .option('--list', 'List all available sections')
            .asyncAction(Theme.manageSections);

        const extension = program
            .command('extension')
            .description('Fynd Platform Extension Utilities')
            .alias('ext');

        extension
            .command('init <name>')
            .description('Init new extension')
            .option('--react', 'ReactJS', false)
            .option('--vue2', 'Vue2', false)
            .asyncAction(Extension.initExtension);

        extension
            .command('preview-url')
            .description('Get preview url for extension')
            .option('--api-key <apiKey>', 'Extension API Key')
            .option('--company-id <companyId>', 'Company ID')
            .option('--port <port>', 'Custom port for serve')
            .option('--host <host>', 'Custom host for serve', '0.0.0.0')
            .option('--custom-tunnel', 'Use custom tunnel url')
            .option('--tunnel-url <url>', 'Custom tunnel url')
            .asyncAction(Extension.getPreviewURL);

        extension
            .command('setup')
            .description('Setup extension')
            .option('--company-id <company_id>', 'Company ID')
            .option('--api-key <apiKey>', 'Extension API Key')
            .option('--api-secret <apiSecret>', 'Extension API Secret')
            .option('--platform-url <platformUrl>', 'Platform URL eg. platform.fynd.com')
            .asyncAction(Extension.setupExtension);

        extension
            .command('context')
            .description('Setup extension context')
            .option('--name <name>', 'Context name')
            .asyncAction(Context.addExtensionContext);

        extension
            .command('context-list')
            .description('Get all extension context list')
            .asyncAction(Context.listContext);

        extension
            .command('active-context')
            .description('Get extension active context')
            .asyncAction(Context.activeContext);

        extension
            .command('launch-url')
            .description('Get extension launch url')
            .option('--company-id <company_id>', 'Company ID')
            .asyncAction(Extension.getLaunchURL);

        extension
            .command('logs')
            .description('Get extension logs')
            .option('--company-id <company_id>', 'Company ID')
            .asyncAction(Extension.getLogs);

        const partner = program
            .command('partner')
            .description('Partner panel utilities')
            .alias('p');

        partner
            .command('connect')
            .description('Connect a partner organization to current user')
            .asyncAction(Partner.connectOrganization);

        partner
            .command('generate-token')
            .description('Generate partner access token')
            .asyncAction(Partner.generateToken);

        // Logger.info(JSON.stringify(program.opts()));
        registerCommands(program);
        return program;
    } catch (error) {
        errorHandler(error);
    }
};

export const registerCommands = (program: Command) => {
    program.on('command:*', (subCommand: any) => {
        const commands = [
            ...Object.values(AUTH_COMMANDS),
            ...Object.values(ENVIRONMENT_COMMANDS),
            ...Object.values(EXTENSION_COMMANDS),
            ...Object.values(THEME_COMMANDS),
            ...Object.values(CONTEXT_COMMANDS),
            ...Object.values(PARTNER_COMMANDS)
        ];
        const availableCommands = program.commands.map((cmd: Command) =>
            cmd.name(),
        );
        if (!availableCommands.includes(subCommand[0])) {
            const leven = require('leven');
            let suggestion = availableCommands.find((commandName) => {
                return leven(commandName, subCommand[0]) < 3;
            });
            suggestion = suggestion ? `Did you mean ${chalk.blue(suggestion)} ?` : '';
            Logger.error(
                `Invalid command: ${chalk.red(subCommand[0])}. ${suggestion}`,
            );
            program.help();
        }
    });

    program.parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
};

export const run = async (programName?: string) => {
    try {
        const activeContext = getActiveContext();
        if (!activeContext || !activeContext.application_id) {
            const { cmd } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'cmd',
                    message: 'Missing active context. What would you like to do?',
                    choices: [
                        { name: 'Login', value: 'login' },
                        { name: 'Setup Context', value: 'context' },
                        { name: 'Exit', value: 'exit' },
                    ],
                },
            ]);
            if (cmd === 'login') {
                await login();
            } else if (cmd === 'context') {
                await Context.addThemeContext();
            } else {
                process.exit(0);
            }
        }
    } catch (error) {
        if(error instanceof CommandError && error.code === ErrorCodes.INVALID_THEME_DIRECTORY.code) {
            // do nothing
        } else {
            Logger.error(error.message);
        }
    }
    init(programName);
};
