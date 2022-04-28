"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
var COMMANDS = [require('./environment'), require('./auth'), require('./theme'), require('./populate')];
function registerCommands(program) {
    COMMANDS.forEach(function (commandModule) {
        commandModule.default(program);
    });
}
exports.registerCommands = registerCommands;
