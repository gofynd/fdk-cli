const axios = require('axios');
const { getSlingshotUrl, getPlatformUrl } = require('./apiUrl');
const chalk = require('chalk');
const { logger } = require('./../utils/logger');
const getApp = async (appId, appToken, host, verbose) => {
  const sligshot = getSlingshotUrl(host);
  const url = `${sligshot}/application/current?app-id=${appId}&app-token=${appToken}`;
  if (verbose) {
    logger(`API URL for APP: ${url}`, true);
  }
  const response = await axios.get(url);
  return response;
};

module.exports = { getApp };
