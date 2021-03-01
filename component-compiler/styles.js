const less = require('less');
const validateCss = require('css-validator');
const parseLess = lessContent => {
  return less.render(lessContent).then(x => x.css);
};

const validateCSS = cssString => {
  return new Promise((resolve, reject) => {
    validateCss({ text: cssString }, function (err, data) {
      if (data && !data.validity) {
        reject(
          `Line ${data.errors[0].line}: ${data.errors[0].message
            .replace(/\n/g, ' ')
            .trim()}`
        );
      }
      resolve(cssString);
    });
  });
};

module.exports = { parseLess, validateCSS };
