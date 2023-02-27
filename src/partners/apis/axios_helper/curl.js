const CurlHelper  = require('../../../../dist/helper/curl').default;
const chalk = require('chalk');


function curlInterceptorHelper() {
    return async (response) => {
        try {
            let request = response.config;
            const curl = new CurlHelper(request);

            console.log(chalk.blue('************** CURL **************'));
            console.log(chalk.blue(`METHOD: ${request?.method.toUpperCase()} | PATH: ${request?.url}`));
            console.log(chalk.blue(curl.generateCommand()));
            console.log(chalk.blue('************** END OF CURL **************'));
            console.log('\n');

        } catch(error) {
            console.log(chalk.red(`Error generating curl: ${error}`));
        } finally {
            return response;
        }

    }
}

module.exports = { curlInterceptorHelper };