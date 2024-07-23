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

    env.command('set')
        // todo: remove -n option in future version
        .option('-n, --name [env-name]', 'Environment name')
        .option('-u, --url [api-domain]', 'API domain')
        .description('Set new environment')
        .asyncAction(Env.setNewEnvs);

    return env;
}
