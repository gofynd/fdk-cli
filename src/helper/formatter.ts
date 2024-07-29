import boxen from 'boxen';
import chalk from 'chalk';

export const successBox = ({ text }) => {
    return boxen(chalk.bold.green(`${text}`), {
        padding: 2,
        margin: 2,
        textAlignment: 'left',
    });
};
