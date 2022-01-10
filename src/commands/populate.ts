import { CommanderStatic } from 'commander';
import CompanySetup from '../lib/CompanySetup';

export default function companySetup(program: CommanderStatic) {
  // List available config
  program
    .command('populate')
    .description('Setup your development account')
    .asyncAction(CompanySetup.setupDevelopmentCompany);
}
