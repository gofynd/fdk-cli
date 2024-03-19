import commander from 'commander';

import chalk from 'chalk';
import { getPlatformUrls } from '../../lib/api/services/url';

export default function environmentCommandBuilder() {
    const env = new commander.Command('env').description(
        'Environment Commands',
    );

    env.allowUnknownOption().action(() => {
        console.warn(chalk.yellow(`Warning: The "env" command is deprecated. To set env and login, please use fdk 'fdk login --domain=api.fynd.com'for login. Ref: ${getPlatformUrls().partners}/help/docs/partners/themes/vuejs/command-reference#environment-commands-1`));
    })

    return env;
}
