import { Command } from 'commander';
import ExtensionSection from '../../lib/ExtensionSection';

export default function bindingCommandBuilder() {
    const binding = new Command('binding').description(
        'Extension Binding Commands',
    );
    binding
        .command('init')
        .description('Create a new section binding boilerplate')
        .option('-n, --name [name]', 'Bundle Name')
        .option('-i, --interface [interface]', 'Interface')
        .option('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.initExtensionBinding);

    binding
        .command('draft')
        .description('Draft extension section')
        .option('-id, --extensionId [extensionId]', 'Extension ID')
        .option('-org, --organisationId [organisationId]', 'Organisation ID')
        .option('-n, --name [name]', 'Bundle Name')
        .option('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.draftExtensionBindings);

    binding
        .command('publish')
        .description('Publish extension section')
        .option('-id, --extensionId [extensionId]', 'Extension ID')
        .option('-org, --organisationId [organisationId]', 'Organisation ID')
        .option('-n, --name [name]', 'Bundle Name')
        .option('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.publishExtensionBindings);

    binding
        .command('preview')
        .description('Serve extension sections')
        .option('-id, --extensionId [extensionId]', 'Extension ID')
        .option('-org, --organisationId [organisationId]', 'Organisation ID')
        .option('-n, --name [name]', 'Bundle Name')
        .option('-p, --port [port]', 'Server Port')
        .option('-u, --url [url]', 'Tunnel Url')
        .option('-f, --framework [framework]', 'Compatible Framework')
        .asyncAction(ExtensionSection.previewExtension);

    binding
        .command('clear-context')
        .description('Clear Extension Sections Context')
        .asyncAction(ExtensionSection.clearContext);

    binding
        .command('show-context')
        .description('Show Extension Sections Context')
        .asyncAction(ExtensionSection.logContext);

    return binding;
}
