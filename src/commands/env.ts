import { CommanderStatic } from 'commander';
import Env from '../lib/Env';

export default function env(program: CommanderStatic) {
  // List available config
  program
    .command('env')
    .alias('env ls')
    .option('-n, --name [env-name]', 'Environment name')
    .description('Shows a list of all available envs')
    .asyncAction(Env.listEnvs);

  // Show active env
  program
    .command('current-env')
    .alias('ctx')
    .description('Prints active env')
    .asyncAction(Env.getEnv);
}
