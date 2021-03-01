const chokidar = require('chokidar');
const { EventEmitter } = require('events');
const child = require('child_process');
class Observer extends EventEmitter {
  constructor() {
    super();
  }
  watchFolder(filesToWatch, handler, ...args) {
    const watcher = chokidar.watch(filesToWatch, { persistent: true });
    watcher
      .on('change', () => {
        handler(...args);
      })
      .on('error', error => console.log(`Watcher error: ${error}`));
  }
}

module.exports = { Observer };
