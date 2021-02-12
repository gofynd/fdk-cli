exports.command = 'theme <command> [options]';
exports.desc = 'Theme Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('theme_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['t'];
exports.handler = function(argv) {
  console.log(argv.options);
};
