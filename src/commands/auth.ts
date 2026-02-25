import { Command } from 'commander';
import Auth from '../lib/Auth';

export default function context(program: Command) {
    // List available context
    program
        .command('auth')
        .alias('login')
        .option('--host [platform-host]', 'Fynd Platform API Domain')
        .option('--region [region]', 'Region for authentication (e.g. asia-south1, asia-south1/default, asia-south1/development)')
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
}
