exports.command = 'extension <command> [options]';
exports.desc = 'Extension Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('extension_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['t'];
exports.handler = function(argv) {
  console.log(argv.options);
};
