import { CommanderStatic } from 'commander';
import Tunnel from '../lib/Tunnel';

export default function companySetup(program: CommanderStatic) {
  program
    .command('tunnel')
    .description('Start local tunnel on specified port')
    .requiredOption('--port <port>', 'Port number')
    .asyncAction(Tunnel.tunnelHandler);
}
