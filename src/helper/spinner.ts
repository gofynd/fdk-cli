import ora from 'ora';

class Spinner {
    spinner = null;

    constructor(textToDisplay?: string) {
        this.spinner = ora(textToDisplay);
    }

    start(textToDisplay?: string) {
        this.spinner.start(textToDisplay);
    }

    succeed(successText?: string) {
        this.spinner.succeed(successText);
    }

    stop() {
        this.spinner.stop();
    }

    fail(failureText?: string) {
        this.spinner.fail(failureText);
    }
}

export default Spinner;
