exports.command = 'section <command> [options]';
exports.desc = 'Section Module of FDK';
exports.builder = function (yargs) {
    return yargs
        .commandDir('section_cmds')
        .showHelpOnFail(true, 'Specify --help for available options');
};
exports.aliases = ['s'];
exports.handler = function (argv) {
    console.log(argv.options);
};
