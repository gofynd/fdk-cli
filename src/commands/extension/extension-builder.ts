import { Command } from 'commander';
import Extension from '../../lib/Extension';
import ExtensionLaunchURL from '../../lib/ExtensionLaunchURL';
import ExtensionPreviewURL from '../../lib/ExtensionPreviewURL';
import FunctionCommands from '../../lib/Function';

export default function extensionCommandBuilder() {
    const extension = new Command('extension').description(
        'Extension Commands',
    );
    extension
        .command('init')
        .description('Initialize extension')
        .option(
            '--target-dir <path>',
            'Target directory for creating extension repository',
        )
        .asyncAction(Extension.initExtensionHandler);

    extension
        .command('setup')
        .description('Setup development environment for extension')
        .option(
            '--target-dir <path>',
            'Target directory for creating extension repository',
        )
        .asyncAction(Extension.setupExtensionHandler);

    extension
        .command('preview-url')
        .description('Get extension preview url to launch the extension')
        .requiredOption(
            '-p, --port <port>',
            'port on which extension is running',
        )
        .option('--api-key <api-key>', 'Extension API Key')
        .option('--company-id <id>', 'Company ID')
        .option('--update-authtoken', 'Update Ngrok Authtoken')
        .asyncAction(ExtensionPreviewURL.previewUrlExtensionHandler);

    const launch_url = new Command('launch-url').description(
        'launch url commands',
    );
    launch_url
        .command('get')
        .description('Get current launch url for extension')
        .requiredOption('--api-key <api-key>', 'Extension API key')
        .asyncAction(ExtensionLaunchURL.getLaunchURLHandler);

    launch_url
        .command('set')
        .description('Set a launch url for extension')
        .requiredOption('--api-key <api-key>', 'Extension API key')
        .requiredOption('--url <launch-url>', 'Launch url')
        .asyncAction(ExtensionLaunchURL.setLaunchURLHandler);

    extension.addCommand(launch_url);
    

    // function commands
    const function_commands = new Command('function').description(
        'Extension Function commands'
    );
    function_commands
        .command('sync')
        .description('Sync function')
        .requiredOption(
            '-n, --name <function-name>',
            'function name'
        )
        .asyncAction(FunctionCommands.syncHandler);

    function_commands
        .command('create')
        .description('Create Extension Function')
        .option(
            '-n, --name <function-name>',
            'function name'
        )
        .option(
            '-t, --type <function-type>',
            'function type'
        )
        .asyncAction(FunctionCommands.createHandler);
    extension.addCommand(function_commands);


    return extension;
}
