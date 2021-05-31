const { getPlatformUrl, getBlitzkriegUrl, getBlitzkriegUrlv2 } = require('./apiUrl');
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
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.get(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}`, {
    headers
  });

  return response.data;
}

async function publishThemeV3(appId, appToken, themeId, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.put(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}/publish`, {}, {
    headers
  });
  return response.data;
}
async function unPublishAppThemeV3(appId, appToken, themeId, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.put(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}/unpublish`, {}, {
    headers
  });
  return response.data;
}
async function getApplicationThemes(appId, appToken, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.get(`${platform}/v1.0/company/${companyId}/application/${appId}/library`, {
    headers
  });
  return response.data;
}

async function updateThemeV3(appId, appToken, themeId, body, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.put(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}`,
    body,
    {
      headers
    });
  return response.data;
}

async function createThemeV3(host, appId, appToken, body, cookie = null) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: cookie ? cookie : readCookie()
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.post(`${platform}/v1.0/company/${companyId}/application/${appId}`,
    body,
    {
      headers
    });
  return response.data;
}

async function getAvailablePage(appId, appToken, themeId, pageValue, host) {
  try {
    const { company_id : companyId } = getActiveContext()
    const headers = {
      'x-application-id': appId,
      'x-application-token': appToken,
      Cookie: readCookie() || ''
    };
    const platform = getBlitzkriegUrlv2(host);
    const response = await axios.get(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}/${pageValue}`,
      {
        headers
      }
    );
    return response.data;
  } catch (error) {
    return {}
  }
  
} 

async function updateAllPages(appId, appToken, themeId, body, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie: readCookie() || ''
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.put(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}/page`,
    body,
    {
      headers
    });
  return response.data;
}

async function createAvailablePage(appId, appToken, themeId, body, host) {
  const { company_id : companyId } = getActiveContext()
  const headers = {
    'x-application-id': appId,
    'x-application-token': appToken,
    Cookie:  readCookie() || ''
  };

  const platform = getBlitzkriegUrlv2(host);
  const response = await axios.post(`${platform}/v1.0/company/${companyId}/application/${appId}/${themeId}`,
    body,
    {
      headers
    });
  return response.data;
}
module.exports = { sendTheme, getTheme, getThemeV2, getThemeV3, updateThemeV3, getApplicationThemes, createThemeV3, publishThemeV3, unPublishAppThemeV3, updateAllPages, getAvailablePage, createAvailablePage };
