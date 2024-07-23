import path from 'path';
import fs from 'fs-extra';
import * as Sentry from '@sentry/node';

const sentryFilePath = path.join(__dirname, './../sentry.json');
const packageJSON = require('../../package.json');

const sentryDSN = fs.existsSync(sentryFilePath)
    ? fs.readJsonSync(sentryFilePath)['dsn']
    : undefined;

if (sentryDSN) {
    Sentry.init({
        dsn: sentryDSN,
        release: packageJSON.version,
    });
}
    
    