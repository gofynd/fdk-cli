exports.command = 'launch-url <command> [options]';
exports.desc = 'Extension Launch Url Module of FDK';
exports.builder = function(yargs) {
  return yargs
    .commandDir('launch_url_cmds')
    .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['u'];
exports.handler = function(argv) {
  console.log(argv.options);
};