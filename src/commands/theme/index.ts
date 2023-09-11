import { Command } from 'commander';

import themeCommandBuilder from './theme-builder';
export default function theme(program: Command) {
    program.addCommand(themeCommandBuilder());
}
