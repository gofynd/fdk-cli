import commander from 'commander';
import Status from '../../lib/Status';

export default function statusCommandBuilder() {
    const status = new commander.Command('status').description('Theme Commands');
    status
        .command('check')
        .alias('verify')
        .description('Check service status')
        .option('-n, --name [name]', 'Service name')
        .asyncAction(Status.checkServiceStatus);

    return status;
}
