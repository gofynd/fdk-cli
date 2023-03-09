const chalk = require('chalk');
const validateEmail = input => {
  const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  if (reg.test(input)) {
    return true;
  }
  console.log(chalk.red('ERROR Invalid Email'));
  process.exit(1);
};
const completeEmail = (answers, input) => {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(
      function() {
        resolve([
          input + '@gmail.com',
          input + '@yahoo.com',
          input + '@gofynd.com'
        ]);
      },
      function() {}
    );
  });
};
const completeDomain = (answers, input) => {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(
      function() {
        resolve([
          input + '.addsale.link',
          input + '.fynd.io',
          input + '.addsale.com',
          input + '.fynd.com'
        ]);
      },
      function() {}
    );
  });
};

module.exports = { validateEmail, completeDomain, completeEmail };
