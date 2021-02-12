const fs = require('fs');
const less = require('less');
const parse5 = require('parse5');
const { readFile } = require('./file-utlis');
var esprima = require('esprima');
var validateCss = require('css-validator');
const chalk = require('chalk');
const glob = require('glob');
const { logger } = require('./logger');
const validateTemplate = async (templateString, componentName, verbose) => {
  try {
    if (verbose) {
      logger(`Validating template of ${componentName}`, true);
    }
    if (templateString.length === 0) {
      return templateString;
    }
    let isCustomCSS, isLess;
    const startIndex = templateString.search('<style');
    const endIndex = templateString.search('</style>');
    let lessString = '';
    const fragments = parse5.parseFragment(templateString);
    fragments.childNodes.forEach(function(node) {
      switch (node.nodeName) {
        case 'template':
          break;
        case 'style':
          if (node.childNodes && node.childNodes.length > 0) {
            const attrsArr = node.childNodes[0].parentNode.attrs;
            if (attrsArr && attrsArr.length > 0) {
              attrsArr.find(item => {
                if (item.name === 'lang') {
                  isCustomCSS = true;
                }
                if (item.value === 'less') {
                  isLess = true;
                }
              });
            }
          }
          if ((isCustomCSS && isLess) || !isCustomCSS) {
            lessString = serializeTemplate(node);
          } else {
            if (verbose) {
              logger(`Validating template of ${componentName} failed`, true);
            }
            return Promise.reject(
              chalk.red.bold('ERROR: Only LESS is supported')
            );
          }

          break;
        case 'script':
          scriptText = serializeTemplate(node);
          try {
            esprima.parseScript(scriptText);
          } catch (err) {
            if (verbose) {
              logger(`Validating template of ${componentName} failed`, true);
            }
            return Promise.reject(
              chalk.red('ERROR:' + err.message + `in ${componentName}`)
            );
          }
      }
    });
    const lessVariables = await readLessVariables(verbose);
    lessString = lessVariables ? lessVariables + lessString : lessString;
    let cssString = '';
    let parser = new less.Parser({});
    parser.parse(lessString, (err, tree) => {
      try {
        if (err) {
          if (verbose) {
            logger(`Validating template of ${componentName} failed`, true);
          }
          return Promise.reject(
            chalk.red('ERROR:' + err.message + `in ${componentName}`)
          );
        }
        cssString = tree.toCSS();
      } catch (error) {
        if (verbose) {
          logger(`Validating template of ${componentName} failed`, true);
        }
        return Promise.reject(
          chalk.red.bold('ERROR:'),
          'LESS Compilation Failed',
          error.message,
          `in ${componentName}`
        );
      }
    });
    validateCss({ text: cssString }, function(err, data) {
      if (data && !data.validity) {
        if (verbose) {
          logger(`Validating template of ${componentName} failed`, true);
        }
        return Promise.reject(
          chalk.red('ERROR:' + data.errors[0].message, `in ${componentName}`)
        );
      }
    });
    cssString = '<style scoped>' + cssString + '</style>';
    templateString = templateString.replace(
      templateString.substring(startIndex, endIndex + 9),
      cssString
    );
    if (verbose) {
      logger(`Validating template of ${componentName} completed`, true);
    }
    if (verbose) {
      logger(`Value of templateString  ${templateString} completed`, true);
    }
    return templateString;
  } catch (err) {
    if (verbose) {
      logger(`Validating template of ${componentName} failed`, true);
    }
    return Promise.reject(
      chalk.red('ERROR:' + err.message, `in ${componentName}`)
    );
  }
};
function serializeTemplate(node) {
  if (node && node.childNodes && node.childNodes.length > 0) {
    return parse5.serialize(node);
  }
  return parse5.serialize(node.content || '');
}
const readComponent = async (templateDir, componentName) => {
  let componentTemplate = '';
  if (fs.existsSync(templateDir + `/${componentName}.vue`)) {
    componentTemplate = await readFile(templateDir + `/${componentName}.vue`);
  }
  return componentTemplate;
};
const readGlobalComponentFiles = async (dirname, verbose) => {
  try {
    let componentsObj = {};
    let componentsArr = [];
    const files = glob.sync(dirname + '/*.vue');
    files.forEach(async filePath => {
      const data = await readFile(filePath);
      const filePathArr = filePath.split('/');
      const fileName =
        'fdk-' + filePathArr[filePathArr.length - 1].split('.')[0];
      const compiledTemplate = await validateTemplate(data, fileName, verbose);
      componentsObj.name = fileName;
      componentsObj.template = data;
      componentsObj.compiled_template = compiledTemplate;
      componentsArr.push(componentsObj);
      componentsObj = {};
    });
    return componentsArr;
  } catch (error) {
    return Promise.reject(error);
  }
};

const readHeadLess = async verbose => {
  try {
    if (verbose) {
      logger('Reading head.less', true);
    }
    let headLessObj = {};
    let headLessContent = await readFile('./theme/global/head.less');
    const lessVariableContent = await readLessVariables();
    headLessContent = lessVariableContent
      ? lessVariableContent + headLessContent
      : headLessContent;
    let cssString = '';
    let parser = new less.Parser({});
    parser.parse(headLessContent, (err, tree) => {
      try {
        if (err) {
          console.log(chalk.red('ERROR:' + err.message));
          if (verbose) {
            logger('Reading head.less failed', true);
          }
          process.kill(process.pid);
        }
        cssString = tree.toCSS();
      } catch (error) {
        console.log(chalk.red.bold('ERROR:'), 'LESS Compilation Failed');

        console.log(chalk.red(error.message));
        if (verbose) {
          logger('Reading head.less failed', true);
        }
        process.kill(process.pid);
      }
    });
    validateCss({ text: cssString }, function(err, data) {
      if (data && !data.validity) {
        console.log(chalk.red('ERROR:' + data.errors[0].message));
        if (verbose) {
          logger('Reading head.less failed', true);
        }
        process.kill(process.pid);
      }
    });
    headLessObj.template = headLessContent;
    headLessObj.compiled_template = cssString;
    if (verbose) {
      logger('Reading head.less completed', true);
    }
    return headLessObj;
  } catch (error) {
    return Promise.reject(error);
  }
};

const readLessVariables = async verbose => {
  if (!fs.existsSync('./theme/global/variables.less')) {
    if (verbose) {
      logger('No variables.less found', true);
    }
    return;
  }
  if (verbose) {
    logger('Reading head.less', true);
  }
  const lessVariableContent = readFile('./theme/global/variables.less');
  let parser = new less.Parser({});
  parser.parse(lessVariableContent, (err, tree) => {
    try {
      if (err) {
        console.log(chalk.red('ERROR:' + err.message));
        if (verbose) {
          logger('Reading variables.less failed', true);
        }
        process.kill(process.pid);
      }
      cssString = tree.toCSS();
    } catch (error) {
      console.log(chalk.red.bold('ERROR:'), 'LESS Compilation Failed');

      console.log(chalk.red(error.message));
      if (verbose) {
        logger('Reading variables.less failed', true);
      }
      process.kill(process.pid);
    }
  });
  return lessVariableContent;
};

module.exports = {
  validateTemplate,
  serializeTemplate,
  readComponent,
  readGlobalComponentFiles,
  readHeadLess,
  readLessVariables
};
