const chalk = require('chalk');
const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const { parseNumber } = require('libphonenumber-js');
const { ObjectID } = require('mongodb');
const { getApp } = require('../apis/app');
const { logger } = require('./logger');

exports.validateThemeAndGroupName = themeName => {
  if (themeName.length === 0) {
    return Promise.reject('Theme name is required');
  }
  return true;
};

exports.validateAppIdAndToken = async (appId, token, host, verbose) => {
  if (!exports.validatObjectId(appId)) {
    return Promise.reject('ERROR : Invalid App ID');
  }
  if (verbose) {
    logger('API call for validating App ID initiated', true);
  }
  let response = await getApp(appId, token, host, verbose);

  if (verbose) {
    logger('API call for validating App ID completed', true);
  }
  return response.data;
};



exports.validateEmail = (email) => {
  return emailValidator.validate(String(email).toLowerCase().trim());
};

exports.validatePhoneNumber = (phoneNumber) => {
  const p = parseNumber(`+${phoneNumber}`, { extended: true });
  if (!p.valid) {
    return p.valid;
  }
  return { countryCode: p.countryCallingCode, phone: p.phone };
};

const schema = new passwordValidator();
exports.validatePassword = (password) => {
  schema.is().min(8)
    .has().letters()
    .has().digits()
    .has().symbols();
  return schema.validate(password);
};

exports.validateUrl = (url) => {
  const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return !!regexp.test(url);
};

exports.validatObjectId = (id) => {
  if (!ObjectID.isValid(id) || new ObjectID(id) != id) {
    return false;
  };
  return true;
}
