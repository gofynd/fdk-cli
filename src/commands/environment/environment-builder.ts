import commander from 'commander';
import Env from '../../lib/Env';
import chalk from 'chalk';
export default function environmentCommandBuilder() {
    const env = new commander.Command('env').description(
        'Environment Commands',
    );
    env.command('get')
        .description('Get current environment')
        .asyncAction(Env.getEnv);

    // todo: remove in 4.0.6
    env.command('ls')
        .description('List supported environments')
        .action(()=>{
            console.warn(chalk.yellow('Warning: The "env ls" command is deprecated.'));
        });

    env.command('set')
        // todo: remove -n option in 4.0.6
        .option('-n, --name [env-name]', 'Environment name')
        .option('-u, --url [api-domain]', 'API domain')
        .description('Set new environment')
        .asyncAction(Env.setNewEnvs);

    return env;
}
