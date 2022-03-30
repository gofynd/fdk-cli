import { CommanderStatic } from 'commander';
import Env from '../lib/Env';

export default function env(program: CommanderStatic) {
  
  // List available environments
  program
    .command('env-ls')
    .description('Shows a list of all available envs')
    .asyncAction(Env.listEnvs);

  // set new enviroment
  program
  .command('env')
  .requiredOption('-n, --name [env-name]', 'Environment name')
  .description('Set new environment')
  .asyncAction(Env.setNewEnvs);

    // Show active env
  program
    .command('current-env')
    .alias('ctx')
    .description('Prints active env')
    .asyncAction(Env.getEnv);
}
