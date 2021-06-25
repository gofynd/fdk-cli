const axios = require('axios');
const { getMixmasterUrl } = require('./apiUrl');
const chalk = require('chalk');
const { logger } = require('./../utils/logger');

const registerExtension = async (host, token, extension_name, extension_type, verbose=false) => {
  const mixmaster = getMixmasterUrl(host);
  
  const url = `${mixmaster}/v1.0/extensions/`;
  const launch_url = 'http://localdev.fyndx0.de';
  const payload = {
      name: extension_name,
      extention_type: extension_type.toLowerCase(),
      base_url: launch_url,
  }
  if (verbose) {
    logger(`API URL for register extension: ${url}`, true);
  }

  let response = null;
  try {
    response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
            'x-partner-token': token
        }
    })
  }
  catch(err) {
      logger(JSON.stringify(err.response.data), true);
  }
  return response.data;
};

module.exports = { registerExtension };
