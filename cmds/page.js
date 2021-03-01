exports.command = 'page <command> [options]';
exports.desc = 'Page Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('page_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['p'];
exports.handler = function(argv) {
  console.log(argv.options);
};
