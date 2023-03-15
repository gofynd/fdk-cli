const packageJSON = require('../../../../package.json');

export const getCommonHeaderOptions = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-fp-cli': `${packageJSON.version}`,
        }
    };
};