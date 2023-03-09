const chokidar = require('chokidar');
const chalk = require('chalk');
const { EventEmitter } = require('events');
const child = require('child_process');
class Observer extends EventEmitter {
  constructor() {
    super();
  }
  async watchFolder(type, componentName, file) {
    try {
      let watcher = '';
      if (componentName) {
        const cwd = process.cwd();
        watcher = chokidar.watch(cwd, { persistent: true });
        watcher.on('change', () => {
          if (type === 'theme') {
            child.execSync(`fdk theme sync --component ${componentName}`, {
              stdio: 'inherit'
            });
          } else if (type === 'page') {
            if (file) {
              child.execSync(
                `fdk page sync --name ${componentName} --file ${file}`,
                {
                  stdio: 'inherit'
                }
              );
            } else {
              child.execSync(`fdk page sync --name ${componentName}`, {
                stdio: 'inherit'
              });
            }
          }
        });
      } else {
        const cwd = process.cwd();
        watcher = chokidar.watch(cwd, { persistent: true });
        watcher.on('change', () => {
          if (type === 'theme') {
            child.execSync(`fdk theme sync`, {
              stdio: 'inherit'
            });
          } else if (type === 'path') {
            child.execSync(`fdk page sync`, {
              stdio: 'inherit'
            });
          }
        });
      }
    } catch (error) {
      await watcher.close();
      console.log(chalk.red(error.message));
      process.exit(1);
    }
  }
}

module.exports = { Observer };
