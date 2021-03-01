const { getPlatformUrl, getBlitzkriegUrl } = require('./apiUrl');
const axios = require('axios');
const _ = require('lodash');
const chalk = require('chalk');
const { readCookie, getActiveContext } = require('../utils/utils');
const { logger } = require('../utils/logger');

const sendTheme = async (data) => {
  const currentContext = getActiveContext();
  const { host } = currentContext;
  const headers = {
    'x-application-id': currentContext.appId,
    'x-application-token': currentContext.token,
    Cookie: data.Cookie || readCookie()
  };
  const platform = getPlatformUrl(host);
  const response = await axios.put(
    `${platform}/application/current/theme`,
    _.omit(data, ['_id', 'id']),
    {
      headers
    }
  );
  return response;
};

const getTheme = async (appId, appToken, host, verbose) => {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken
  };

  const platform = getPlatformUrl(host);
  if (verbose) {
    logger(`API URL for THEME: ${platform}/application/current/theme`, true);
  }
  const response = await axios.get(`${platform}/application/current/theme`, {
    headers
  });
  return response;
};

async function getThemeV2(appId, appToken, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.get(`${platform}/theme`, {
    headers
  });
  return response.data;
}

async function getThemeV3(appId, appToken, themeId, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.get(`${platform}/theme/v3/${themeId}`, {
    headers
  });

  return response.data;
}

async function publishThemeV3(appId, appToken, themeId, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.put(`${platform}/theme/v3/${themeId}/publish`, {}, {
    headers
  });
  return response.data;
}
async function unPublishAppThemeV3(appId, appToken, themeId, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.put(`${platform}/theme/v3/${themeId}/unpublish`, {}, {
    headers
  });
  return response.data;
}
async function getApplicationThemes(appId, appToken, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.get(`${platform}/theme/v3/application/themes`, {
    headers
  });
  return response.data;
}

async function updateThemeV3(appId, appToken, themeId, body, host) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.put(`${platform}/theme/v3/${themeId}`,
    body,
    {
      headers
    });
  return response.data;
}

async function createThemeV3(host, appId, appToken, body, cookie = null) {
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: cookie ? cookie : readCookie()
  };

  const platform = getBlitzkriegUrl(host);
  const response = await axios.post(`${platform}/theme/v3`,
    body,
    {
      headers
    });
  return response.data;
}

module.exports = { sendTheme, getTheme, getThemeV2, getThemeV3, updateThemeV3, getApplicationThemes, createThemeV3, publishThemeV3, unPublishAppThemeV3 };
