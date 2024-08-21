import { Command } from 'commander';
import Partner from '../lib/Partner';
import { customHelpSectionData } from '../helper/formate_helper_text';

export default function partner(program: Command) {
    const partner = new Command('partner').description('Partner Commands');

    partner
        .command('connect')
        .description('Connect partner account')
        .asyncAction(Partner.connectHandler);
    customHelpSectionData(partner)
    program.addCommand(partner);
}
