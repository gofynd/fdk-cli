const chalk = require('chalk');
const { Observer } = require('../../utils/fileWatcher');
const child = require('child_process');
exports.builder = function(yargs) {
  return yargs
    .option('name', {
      alias: 'n',
      desc: 'Page name to be synced'
    })
    .option('file', {
      alias: 'f'
    })
    .demandOption(
      ['name'],
      `Please provide 'name' arguments to work with this tool`
    );
};
exports.command = 'sync-live';
exports.desc = 'Sync Live with DB';
exports.handler = args => {
  try {
    let observer = '';
    if (args.name) {
      console.log(chalk.bold.green('Live Sync Started for', args.name));
      observer = new Observer();
      if (args.file) {
        child.execSync(
          `fdk page sync --name ${args.name} --file ${args.file}`,
          {
            stdio: 'inherit'
          }
        );
        observer.watchFolder('page', args.name, args.file);
      } else {
        child.execSync(`fdk page sync --name ${args.name}`, {
          stdio: 'inherit'
        });
        observer.watchFolder('page', args.name);
      }
    }
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
