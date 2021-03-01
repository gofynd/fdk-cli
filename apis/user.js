const { getGrimlockUrl } = require('./apiUrl');
const axios = require('axios');
const { logger } = require('../utils/logger');

const loginUser = async (email, password, host, verbose) => {
  if (verbose) {
    logger(`Login User Method called`, true);
  }
  const grimlock = getGrimlockUrl(host);
  const userData = {
    username: email,
    password,
    'g-recaptcha-response': '_skip_'
  };
  if (verbose) {
    logger(`API call for LOGIN  made using data : ${userData}`, true);
  }
  const headers = {
    'Content-Type': 'application/json'
  };
  if (verbose) {
    logger(`API call for LOGIN : ${grimlock}/password-login`, true);
  }
  const response = await axios.post(
    `${grimlock}/password-login`,
    {
      username: email,
      password,
      'g-recaptcha-response': '_skip_'
    },
    headers
  );
  if (verbose) {
    logger(`API RESPONSE: ${response.data}`, true);
  }
  return response;
};
module.exports = { loginUser };
