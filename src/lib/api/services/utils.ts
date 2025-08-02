const packageJSON = require('../../../../package.json');

export const getCommonHeaderOptions = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-fp-cli': `${packageJSON.version}`,
  },
});
