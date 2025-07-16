import { Command } from 'commander';
import extensionCommandBuilder from './extension-builder';

export default function extension(program: Command) {
  program.addCommand(extensionCommandBuilder());
}
