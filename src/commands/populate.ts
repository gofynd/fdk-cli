import { CommanderStatic } from 'commander';
import CompanySetup from '../lib/CompanySetup';

export default function companySetup(program: CommanderStatic) {
    // List available config
    program
        .command('populate')
        .description('Setup your development account')
        .option('--company-id <id>', 'Company Id')
        .asyncAction(CompanySetup.setupDevelopmentCompany);
}
