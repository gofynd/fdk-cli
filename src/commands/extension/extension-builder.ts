import { Command } from 'commander';
import Extension from '../../lib/Extension';
import ExtensionLaunchURL from '../../lib/ExtensionLaunchURL';
import ExtensionPreviewURL from '../../lib/ExtensionPreviewURL';
import ExtensionSection from '../../lib/ExtensionSection';

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
        .option('--access-token <access-token>', 'Partner Access Token')
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

    const binding = new Command('binding').description(
        'Extension Binding Commands',
    );
    binding
        .command('init')
        .description('Create a new section binding boilerplate')
        .option('-n, --name [name]', 'Bundle Name')
        .option('-i, --interface [interface]', 'Interface')
        .requiredOption('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.initExtensionBinding);

    binding
        .command('draft')
        .description('Draft extension section')
        .requiredOption('-id, --extensionId [extensionId]', 'Extension ID')
        .requiredOption('-org, --organisationId [organisationId]', 'Organisation ID')
        .requiredOption('-n, --name [name]', 'Bundle Name')
        .requiredOption('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.draftExtensionBindings);

    binding
        .command('publish')
        .description('Publish extension section')
        .requiredOption('-id, --extensionId [extensionId]', 'Extension ID')
        .requiredOption('-org, --organisationId [organisationId]', 'Organisation ID')
        .requiredOption('-n, --name [name]', 'Bundle Name')
        .requiredOption('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.publishExtensionBindings);

    binding
        .command('preview')
        .description('Serve extension sections')
        .requiredOption('-id, --extensionId [extensionId]', 'Extension ID')
        .requiredOption('-org, --organisationId [organisationId]', 'Organisation ID')
        .requiredOption('-n, --name [name]', 'Bundle Name')
        .requiredOption('-p, --port [port]', 'Server Port')
        .requiredOption('-u, --url [url]', 'Tunnel Url')
        .requiredOption('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.previewExtension);

    extension.addCommand(binding);

    return extension;
}
