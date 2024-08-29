import { Command } from 'commander';
import Extension from '../../lib/Extension';
import ExtensionLaunchURL from '../../lib/ExtensionLaunchURL';
import ExtensionPreviewURL from '../../lib/ExtensionPreviewURL';
import ExtensionEnv from '../../lib/ExtensionEnv';

export default function extensionCommandBuilder() {
    const extension = new Command('extension')
        .aliases(['ext'])
        .description('Extension Commands');
    extension
        .command('init')
        .description('Initialize extension')
        .option('--template <template-name>', 'Create extension from specific template')
        .option(
            '--target-dir <path>',
            'Target directory for creating extension repository',
        )
        .asyncAction(Extension.initExtensionHandler);

    extension
        .command('preview-url')
        .aliases(['preview'])
        .description('Get extension preview url to launch the extension')
        .option('--api-key <api-key>', 'Extension API Key')
        .option('--company-id <id>', 'Company ID')
        .option('--tunnel-url <tunnel-url>', 'Tunnel URL')
        .option('--no-auto-update', 'Auto update tunnel URL as extension launch url on partners panel')
        .option('--access-token <access-token>', 'Partner Access Token')
        .option('--reset', 'Reset extension.context file and start fresh')
        .asyncAction(ExtensionPreviewURL.previewUrlExtensionHandler);

    const launch_url = new Command('launch-url').description(
        'launch url commands',
    );
    launch_url
        .command('get')
        .description('Get current launch url for extension')
        .option('--api-key <api-key>', 'Extension API key')
        .asyncAction(ExtensionLaunchURL.getLaunchURLHandler);

    launch_url
        .command('set')
        .description('Set a launch url for extension')
        .option('--api-key <api-key>', 'Extension API key')
        .option('--url <launch-url>', 'Launch url')
        .option('--access-token <access-token>', 'Partner Access Token')
        .asyncAction(ExtensionLaunchURL.setLaunchURLHandler);

    extension.addCommand(launch_url);


    extension
        .command('pull-env')
        .description('Pull environment variable for the extension from partners panel')
        .option('--api-key <api-key>', 'Extension API key')
        .asyncAction(ExtensionEnv.extensionEnvPullHandler);

    return extension;
}
