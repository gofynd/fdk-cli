import { Command } from 'commander';
import Auth from '../lib/Auth';
import { customHelpSectionData } from '../helper/formate_helper_text';

export default function context(program: Command) {
    // List available context
    program
        .command('auth')
        .alias('login')
        .option('--host [platform-host]', 'Fynd Platform API Domain')
        .description('Login using partner panel')
        .asyncAction(Auth.login);

    // Show active context
    program
        .command('logout')
        .description('Logout user')
        .asyncAction(Auth.logout);
    program
        .command('user')
        .description('Prints logged in user information')
        .asyncAction(Auth.getUserInfo);
    
    customHelpSectionData(program)
}
