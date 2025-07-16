import Logger from './Logger';

export default function (args) {
  if (process.env.DEBUG === 'fdk') {
    return Logger.debug(args);
  }
}
