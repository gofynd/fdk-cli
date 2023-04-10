import { Command } from 'commander';
import statusCommandBuilder from './status-builder';

export default function theme(program: Command) {
    program.addCommand(statusCommandBuilder());
}
