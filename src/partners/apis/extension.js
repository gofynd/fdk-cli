const axios = require('axios');
const { getMixmasterUrl } = require('./apiUrl');
const chalk = require('chalk');
const { logger } = require('./../utils/logger');
const { normalizeError } = require('../utils/error.util');

const registerExtension = async (host, token, extension_name, extension_type, verbose = false) => {
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

  let response = {};
  try {
    response = await axios.post(url, payload, {
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
        'x-partner-token': token
      }
    });
  }
  catch (err) {
    if (verbose) {
      logger('Error: ' + JSON.stringify(normalizeError(err)), true);
    }
    let errorMsg = err.message || 'Failed to update data';
    if (err.response && err.response.status < 500) {
      errorMsg = err.response.data && err.response.data.message || errorMsg;
    }
    throw Error(errorMsg);
  }
  return response.data;
};

const updateLaunchUrl = async (host, token, extension_id, launch_url, verbose = false) => {
  const mixmaster = getMixmasterUrl(host);

  const url = `${mixmaster}/v1.0/extensions/${extension_id}`;
  const payload = {
    base_url: launch_url,
  }
  if (verbose) {
    logger(`API URL for update extension: ${url}`, true);
  }

  let response = {};
  try {
    response = await axios.patch(url, payload, {
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
        'x-partner-token': token
      }
    });
  }
  catch (err) {
    if (verbose) {
      logger('Error: ' + JSON.stringify(normalizeError(err)), true);
    }
    let errorMsg = err.message || 'Failed to update data';
    if (err.response && err.response.status < 500) {
      errorMsg = err.response.data && err.response.data.message || errorMsg;
    }
    throw Error(errorMsg);
  }
  return response.data;
};

const getLaunchUrl = async (host, token, extension_id, verbose = false) => {
  const mixmaster = getMixmasterUrl(host);

  const url = `${mixmaster}/v1.0/extensions/details/${extension_id}`;
  if (verbose) {
    logger(`API URL for get extension details: ${url}`, true);
  }

  let response = {};
  try {
    response = await axios.get(url, {
      timeout: 3000,
      headers: {
        'x-partner-token': token
      }
    });
  }
  catch (err) {
    if (verbose) {
      logger('Error: ' + JSON.stringify(normalizeError(err)), true);
    }
    let errorMsg = err.message || 'Failed to update data';
    if (err.response && err.response.status < 500) {
      errorMsg = err.response.data && err.response.data.message || errorMsg;
    }
    throw Error(errorMsg);
  }
  return response.data;
};

const getOrganizationInfo = async (host, token, verbose = false) => {
  const mixmaster = getMixmasterUrl(host);

  const url = `${mixmaster}/v1.0/accesstoken/${token}/organization`;

  if (verbose) {
    logger(`API URL for fetching organization info: ${url}`, true);
  }

  let response = {};
  try {
    response = await axios.get(url, {
      headers: {
        'x-partner-token': token
      }
    })
  }
  catch (err) {
    if (verbose) {
      logger('Error: ' + JSON.stringify(normalizeError(err)), true);
    }
    let errorMsg = err.message || 'Failed to fetch data';
    if (err.response && err.response.status < 500) {
      errorMsg = err.response.data && err.response.data.message || errorMsg;
    }
    throw Error(errorMsg);
  }
  return response.data;
};


module.exports = { registerExtension, getOrganizationInfo, updateLaunchUrl, getLaunchUrl };
