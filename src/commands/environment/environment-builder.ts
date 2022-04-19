import commander from 'commander';
import Env from '../../lib/Env';
export default function environmentCommandBuilder() {
    const env = new commander.Command('env').description('Environment Commands');
    env
        .command('get')
        .description('Get current environment')
        .asyncAction(Env.getEnv);

    env
        .command('ls')
        .description('List supported environments')
        .asyncAction(Env.listEnvs);

    env
        .command('set')
        .requiredOption('-n, --name [env-name]', 'Environment name')
        .description('Set new environment')
        .asyncAction(Env.setNewEnvs);

    return env;
}
