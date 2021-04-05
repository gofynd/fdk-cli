const { getSkywarpUrl } = require('./apiUrl');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { addSignatureFn } = require('./axios_helper');


axios.interceptors.request.use(addSignatureFn({}));
const loginUser = async (email, password, host, verbose) => {
  if (verbose) {
    logger(`Login User Method called`, true);
  }
  const skywarp = getSkywarpUrl(host);
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
    logger(`API call for LOGIN : ${skywarp}/v1.0/auth/login/password`, true);
  }
  const response = await axios.post(
    `${skywarp}/v1.0/auth/login/password`,
    {
      username: email,
      password,
      'g-recaptcha-response': '_skip_'
    },
    headers
  );
  if (verbose) {
    logger(`API RESPONSE: ${response.headers['set-cookie'][0]}`, true);
  }
  return response;
};

const getOauthToken = async () => {
  const { getActiveContext } = require('../utils/utils');
  const ctx = getActiveContext();
  const skywarp = getSkywarpUrl(ctx.host);
  const headers = {
    'Content-Type': 'application/json',
    'cookie': ctx.cookie
  };
  const response = await axios.get(`${skywarp}/v1.0/company/${ctx.company_id}/oauth/staff/token`, {
    headers
  });
  return response.data
}
module.exports = { loginUser, getOauthToken };
