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


    const section = new Command('section').description(
        'Extension Section Commands',
    );
    section
        .command('init')
        .description('Create a new section boilerplate')
        .requiredOption('-n, --name [name]', 'Section Name')
        .asyncAction(ExtensionSection.initExtensionSection);

    section
        .command('pub')
        .description('Sync extension section')
        // .requiredOption('-n, --name [name]', 'Section Name')
        .asyncAction(ExtensionSection.syncExtensionBindings);

    section
        .command('ls')
        .description('List extension sections')
        // .requiredOption('-id, --id [id]', 'extensionID')
        .asyncAction(ExtensionSection.getAllSections);
    section
        .command('run')
        .description('Serve extension sections')
        .requiredOption('-n, --name [name]', 'Bundle Name')
        .option('-p, --port [port]', 'Server Port')
        .asyncAction(ExtensionSection.serveExtensionSections);

    extension.addCommand(section);

    return extension;
}
