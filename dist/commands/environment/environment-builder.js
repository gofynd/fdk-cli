"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var Env_1 = __importDefault(require("../../lib/Env"));
function environmentCommandBuilder() {
    var env = new commander_1.default.Command('env').description('Environment Commands');
    env
        .command('get')
        .description('Get current environment')
        .asyncAction(Env_1.default.getEnv);
    env
        .command('ls')
        .description('List supported environments')
        .asyncAction(Env_1.default.listEnvs);
    env
        .command('set')
        .requiredOption('-n, --name [env-name]', 'Environment name')
        .description('Set new environment')
        .asyncAction(Env_1.default.setNewEnvs);
    return env;
}
exports.default = environmentCommandBuilder;
