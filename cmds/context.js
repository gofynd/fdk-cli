exports.command = 'context <command> [options]';
exports.desc = 'Context Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('context_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};

exports.handler = function(argv) {
  console.log(argv.options);
};
