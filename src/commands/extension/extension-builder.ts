import { Command } from 'commander';
import Extension from '../../lib/Extension';
import ExtensionLaunchURL from '../../lib/ExtensionLaunchURL';
import ExtensionPreviewURL from '../../lib/ExtensionPreviewURL';

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
        .option(
            '-p, --port <port>',
            'Port on which extension is running',
            '8080',
        )
        .option('--api-key <api-key>', 'Extension API Key')
        .option('--company-id <id>', 'Company ID')
        .option('--access-token <access-token>', 'Partner Access Token')
        .option(
            '--use-tunnel <tunnel-tool>',
            'Pass which tunneling tool you want to use, currently available options are ngrok and cloudflared',
        )
        .option(
            '--update-authtoken',
            'When --use-tunnel is ngrok, you can pass this option to update ngrok auth token',
        )
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
        .option('--access-token <access-token>', 'Partner Access Token')
        .asyncAction(ExtensionLaunchURL.setLaunchURLHandler);

    extension.addCommand(launch_url);

    return extension;
}
