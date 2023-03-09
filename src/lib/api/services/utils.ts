export const getCommonHeaderOptions = () => {
    const packageJson = require('../../../../package.json')
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-fp-cli': `${packageJson.version}`,
        }
    };
};