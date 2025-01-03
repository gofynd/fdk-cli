import boxen from 'boxen';
import chalk from 'chalk';
import terminalLink from 'terminal-link';

export const successBox = ({ text }) => {
    return boxen(chalk.bold.green(`${text}`), {
        padding: 2,
        margin: 2,
        textAlignment: 'left'
    });
};

export const errorBox = ({ text }) => {
    return boxen(chalk.bold.red(`${text}`), {
        padding: 2,
        margin: 2,
        textAlignment: 'left'
    });
};

export const warningBox = ({ text }) => {
    return boxen(chalk.bold.yellow(`${text}`), {
        padding: 2,
        margin: 2,
        textAlignment: 'left'
    });
};

export function displayStickyText(text: string, logger: any = console.log): void {
    logger(text);
    const terminalSize = process.stdout.columns;
    const escapeSeq = terminalSize <=80 
        ? '\x1B[1F\x1B[2K'.repeat(11)
        :  '\x1B[2K' + '\x1B[1F\x1B[2K'.repeat(text.match(/\n/g).length);
    overrideOutputsToKeepTextStickyToBottom(text, escapeSeq);
}

function overrideOutputsToKeepTextStickyToBottom(text: string, escapeSeq: string): void {
    // Intercepting stdout and stderr
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), callback?:  (err?: Error) => void) => {
        originalStdoutWrite(escapeSeq, encoding, callback);
        return originalStdoutWrite(chunk + text, encoding, callback);
    };

    process.stderr.write = (chunk: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), callback?:  (err?: Error) => void) => {
        originalStderrWrite(escapeSeq, encoding, callback)
        return originalStderrWrite(chunk + text, encoding, callback);
    };
}

export class OutputFormatter {
    static link(link: string, linkText: string = ''){
        return terminalLink(linkText, chalk.underline.blue(link));
    }
    static command(command: string){
        return chalk.cyan(command);
    }
}