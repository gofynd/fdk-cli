import execa from 'execa';

export default (argv = '', input) =>
    new Promise((resolve, reject) => {
        const subprocess = execa.command(`node ./bin/fdk.js ${argv}`);
        subprocess.stdout.pipe(process.stdout);
        subprocess.stderr.pipe(process.stderr);
        subprocess.stdin.write(input.toString());
        subprocess.stdin.end();
        return Promise.resolve(subprocess).then(resolve);
    });
