const chalk = require('chalk');
const logger = (message, verbose) => {
  console.log(chalk.blueBright.underline(message) + '\n\n\n\n\n');
};
module.exports = { logger };
