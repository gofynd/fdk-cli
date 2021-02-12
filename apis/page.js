const axios = require('axios');
const { getFreewayUrl } = require('./apiUrl');
const chalk = require('chalk');
const { logger } = require('./../utils/logger');
const { getActiveContext } = require('../utils/utils');
const createPage = async (pageData) => {
  try {
    const currentContext = getActiveContext();
    const freewayUrl = getFreewayUrl(currentContext.host);
    const headers = {
      'x-application-id': currentContext.appId,
      'x-application-token': currentContext.token,
      'Content-Type': 'application/json',
      'x-device-platform': 'web',
    };
    const response = await axios({
      method: 'post',
      url: freewayUrl,
      data: pageData,
      headers: headers,
    });
    return response;
  } catch (error) {
    if (error.response) {
      throw Error(error.response.data.message);
    } else {
      throw Error(error);
    }
  }
};

const updatePage = async (content, page) => {
  const currentContext = getActiveContext();
  const headers = {
    'x-application-id': currentContext.appId,
    'x-application-token': currentContext.token,
    'Content-Type': 'application/json',
  };
  const freewayUrl = getFreewayUrl(currentContext.host);
  console.log(`${freewayUrl}/${page}`);
  const response = await axios({
    method: 'put',
    url: `${freewayUrl}/${page}`,
    data: { content },
    headers: headers,
  });
  return response;
};

const previewPage = async (pageData) => {
  const currentContext = getActiveContext();
  const freewayUrl = getFreewayUrl(currentContext.host);
  const headers = {
    'x-application-id': currentContext.appId,
    'x-application-token': currentContext.token,
    'Content-Type': 'application/json',
    'x-device-platform': 'web',
    Accept: 'text/html',
  };
  const response = await axios({
    method: 'post',
    url: freewayUrl + '/preview',
    data: pageData,
    headers: headers,
  });
  return response;
};

const getPage = async (pageSlug) => {
  const currentContext = getActiveContext();
  const freewayUrl = getFreewayUrl(currentContext.host);
  const headers = {
    'x-application-id': currentContext.appId,
    'Content-Type': 'application/json',
    'x-device-platform': 'web',
  };
  const url = pageSlug ? freewayUrl + `/${pageSlug}` : freewayUrl;
  const response = await axios({
    method: 'get',
    url: url,
    headers: headers,
  });
  return response;
};

module.exports = { createPage, updatePage, previewPage, getPage };
