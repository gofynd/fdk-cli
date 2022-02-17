const {
  validateCSS,
  validateScript,
  parseLess
} = require('./../component-compiler/');
const { readFile } = require('./../utils/file-utlis');
import CommandError, { ErrorCodes } from '../../lib/CommandError';

const getScriptTag = scriptText => {
  try {
    let validatedScript = validateScript(scriptText);
    return `<script>
    ${validatedScript}
    </script>`;
  } catch (error) {
    throw new CommandError('Error occured while creating <script></script> tag');
  }
};

const getStyleTag = async styleText => {
  try {
    let cssString = await parseLess(styleText);
    // let validatedCSS = await validateCSS(cssString);
    // console.log(validatedCSS);
    return `
    <style>
        ${cssString}
    </style>
    `;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getLinkTag = linkText => {
  try {
    return `<link href='${linkText}' rel="stylesheet"/>`;
  } catch (error) {
    throw new CommandError('Error occured while creating <link/> tag');
  }
};

const getCustomScriptTag = scriptLink => {
  try {
    return `<script src='${scriptLink}'></script>`;
  } catch (error) {
    throw new CommandError('Error occured while creating custom <script></script> tag');
  }
};

const getHeadTag = pageJSON => {
  let scriptString = '';
  let styleString = '';
  const scriptsObj = pageJSON.scripts;
  const linkObj = pageJSON.links;
  for (let key of Object.keys(scriptsObj)) {
    scriptString += getCustomScriptTag(scriptsObj[key]);
  }
  for (let key of Object.keys(linkObj)) {
    styleString += getLinkTag(linkObj[key]);
  }
  return `
  <head>
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  ${styleString}
  ${scriptString}
  </head>
  `;
};

module.exports = {
  getCustomScriptTag,
  getLinkTag,
  getScriptTag,
  getStyleTag,
  getHeadTag
};
