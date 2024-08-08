import { Command } from 'commander';
import Extension from '../../lib/Extension';
import ExtensionLaunchURL from '../../lib/ExtensionLaunchURL';
import ExtensionPreviewURL from '../../lib/ExtensionPreviewURL';
import ExtensionTunnel from '../../lib/ExtensionTunnel';

export default function extensionCommandBuilder() {
    const extension = new Command('extension')
        .aliases(['ext'])
        .description('Extension Commands');
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
        .aliases(['preview'])
        .description('Get extension preview url to launch the extension')
        .option('--api-key <api-key>', 'Extension API Key')
        .option('--company-id <id>', 'Company ID')
        .option('--tunnel-url <tunnel-url>', 'Tunnel URL')
        .option('--no-auto-update', 'Auto update tunnel URL as extension launch url on partners panel')
        .option('--access-token <access-token>', 'Partner Access Token')
        .option('--reset', 'Reset extension.context file and start fresh')
        .asyncAction(ExtensionPreviewURL.previewUrlExtensionHandler);

    extension
        .command('tunnel')
        .description('Start local tunnel for extension preview')
        .requiredOption('--port <port>', 'Port number')
        .asyncAction(ExtensionTunnel.tunnelHandler);

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
        .option('--access-token <access-token>', 'Partner Access Token')
        .asyncAction(ExtensionLaunchURL.setLaunchURLHandler);

    extension.addCommand(launch_url);
    return extension;
}
