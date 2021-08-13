import { CommanderStatic } from 'commander';

const COMMANDS = [require('./env'), require('./auth'), require('./theme')];

export function registerCommands(program: CommanderStatic) {
  COMMANDS.forEach(commandModule => {
    commandModule.default(program);
  });
}
