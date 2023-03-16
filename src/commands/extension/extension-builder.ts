import { Command } from "commander";
import Extension from "../../lib/Extension";
import ExtensionLaunchURL from "../../lib/ExtensionLaunchURL";
import ExtensionPreviewURL from "../../lib/ExtensionPreviewURL";


export default function extensionCommandBuilder() {
    const extension = new Command('extension').description('Extension Commands');
    extension
        .command('init')
        .description('Initialize extension')
        .option('--target-dir <path>', 'Target directory for creating extension repository')
        .option('--context-name <name>', 'Context name')
        .asyncAction(Extension.initExtensionHandler);


    extension
        .command('setup')
        .description('Setup development environment for extension')
        .option('--target-dir <path>', 'Target directory for creating extension repository')
        .option('--context-name <name>', 'Context name')
        .asyncAction(Extension.setupExtensionHandler);

    extension
        .command('preview-url')
        .description('Get extension preview url to launch the extension')
        .requiredOption('--port <port>', 'port on which extension is running')
        .option('--company-id <id>', 'Company ID')
        .option('--update-authtoken', 'Update Ngrok Authtoken')
        .asyncAction(ExtensionPreviewURL.previewUrlExtensionHandler);


    const launch_url = new Command('launch-url').description('launch url commands');
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
    return extension;
}