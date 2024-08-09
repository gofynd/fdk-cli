import { CommanderStatic } from 'commander';

const COMMANDS = [
    require('./environment'),
    require('./auth'),
    require('./theme'),
    require('./populate'),
    require('./extension'),
    require('./partner'),
    require('./config'),
];

export function registerCommands(program: CommanderStatic) {
    COMMANDS.forEach((commandModule) => {
        commandModule.default(program);
    });
}
