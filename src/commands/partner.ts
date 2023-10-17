import { Command } from 'commander';
import Partner from '../lib/Partner';

export default function partner(program: Command) {
    const partner = new Command('partner').description('Partner Commands');

    partner
        .command('connect')
        .description('Connect partner account')
        .asyncAction(Partner.connectHandler);

    program.addCommand(partner);
}
