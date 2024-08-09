import boxen from 'boxen';
import chalk from 'chalk';

export const successBox = ({ text }) => {
    return boxen(chalk.bold.green(`${text}`), {
        padding: 2,
        margin: 2,
        textAlignment: 'left',
    });
};

export function displayFixedText(text) {
    console.log(text);

    // '\x1B[2K\x1B[1F\x1B[2K'

    const escapeSeq = '\x1B[2K' + '\x1B[1F\x1B[2K'.repeat(text.match(/\n/g).length);

    overrideOutputsToKeepThisFixed(text, escapeSeq);
}

function overrideOutputsToKeepThisFixed(text, escapeSeq){
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
