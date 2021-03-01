const esprima = require('esprima');

const validateScript = scriptString => {
  try {
    esprima.parseScript(scriptString);
    return scriptString;
  } catch (error) {
    throw Error(error);
  }
};

module.exports = { validateScript };
