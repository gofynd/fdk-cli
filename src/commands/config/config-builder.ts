import { Command } from 'commander';
import Configstore, { CONFIG_KEYS } from '../../lib/Config';
import fs from 'fs-extra';
import chalk from 'chalk';

export default function extensionCommandBuilder() {
    const configCommander = new Command('config').description(
        'Config Commands',
    );
    const setCommander = new Command('set').description(
        'set config items',
    );

    setCommander
        .command('cafile <ca-file-path>')
        .description('To set CA file')
        .action((caFilePath: string) => {
            if (fs.existsSync(caFilePath)) {
                Configstore.set(CONFIG_KEYS.CA_FILE, caFilePath);
            } else {
                console.log(chalk.red("Provided file path does not exist."));
            }
        })

    setCommander
        .command('strict-ssl <boolean>')
        .description('To set CA file')
        .action((value: boolean) => {
            Configstore.set(CONFIG_KEYS.SSL, Boolean(value));
        })

    configCommander.addCommand(setCommander);

    const getCommander = new Command('get').description(
        'set config items',
    );

    getCommander
        .command('cafile')
        .description('To set CA file')
        .action(() => {
            console.log(Configstore.get(CONFIG_KEYS.CA_FILE) || "");
        })

    getCommander
        .command('strict-ssl')
        .description('To set strict-ssl')
        .action(() => {
            console.log(Configstore.get(CONFIG_KEYS.SSL) || "");
        })

    configCommander.addCommand(getCommander);

    const deleteCommander = new Command('delete').alias('rm').description(
        'delete config items',
    );

    deleteCommander
        .command('cafile')
        .description('To delete CA file')
        .action(() => {
            Configstore.delete(CONFIG_KEYS.CA_FILE)
        })

    deleteCommander
        .command('strict-ssl')
        .description('To reset strict-ssl')
        .action(() => {
            Configstore.delete(CONFIG_KEYS.SSL)
        })

    configCommander.addCommand(deleteCommander);

    return configCommander;
}
