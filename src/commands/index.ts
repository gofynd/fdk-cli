import { CommanderStatic } from 'commander';

const COMMANDS = [
  require('./auth'),
  require('./theme'),
  require('./populate'),
  require('./tunnel'),
  require('./extension'),
  require('./binding'),
  require('./config'),
];

export function registerCommands(program: CommanderStatic) {
  COMMANDS.forEach((commandModule) => {
    commandModule.default(program);
  });
}
