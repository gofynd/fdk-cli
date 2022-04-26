import { Command } from 'commander';

import environmentCommandBuilder from './environment-builder'
export default function env(program: Command) {
  program
    .addCommand(environmentCommandBuilder())
}
