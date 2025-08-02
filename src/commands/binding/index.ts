import { Command } from 'commander';

import bindingCommandBuilder from './binding-builder';

export default function env(program: Command) {
  program.addCommand(bindingCommandBuilder());
}
