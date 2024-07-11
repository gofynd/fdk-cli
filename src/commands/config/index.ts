import { Command } from 'commander';

import configCommandBuilder from './config-builder';
export default function env(program: Command) {
    program.addCommand(configCommandBuilder());
}
