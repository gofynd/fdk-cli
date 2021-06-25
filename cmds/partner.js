exports.command = 'partner <command> [options]';
exports.desc = 'Partner Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('partner_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['t'];
exports.handler = function(argv) {
  console.log(argv.options);
};
