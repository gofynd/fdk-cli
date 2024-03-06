import commander from 'commander';
import Env from '../../lib/Env';
import chalk from 'chalk';
import { getPlatformUrls } from '../../lib/api/services/url';
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
            console.warn(chalk.yellow(`Warning: The "env ls" command is deprecated. Ref: ${getPlatformUrls().partners}/help/docs/partners/themes/vuejs/command-reference#environment-commands-1`));
        });

    env.command('set')
        // todo: remove -n option in future version
        .option('-n, --name [env-name]', 'Environment name')
        // todo: remove -u option in future version
        .option('-u, --url [api-domain]', 'API domain')
        .option('-p, --partners [partners-domain]', 'Partners domain')
        .description('Set new environment')
        .asyncAction(Env.setNewEnvs);

    return env;
}
