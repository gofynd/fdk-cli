import commander from 'commander';
import Status from '../../lib/Status';

export default function statusCommandBuilder() {
    const status = new commander.Command('status').description('Theme Commands');
    status
        .command('check')
        .alias('verify')
        .description('Check service status')
        // .requiredOption('-t, --token [token]', 'Token')
        // .requiredOption('-n, --name [name]', 'Theme name')
        .option('-n, --name [name]', 'Service name')
        .asyncAction(Status.checkServiceStatus);

    return status;
}
