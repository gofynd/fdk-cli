"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Env_1 = __importDefault(require("../lib/Env"));
function env(program) {
    // List available config
    program
        .command('env')
        .alias('env ls')
        .requiredOption('-n, --name [env-name]', 'Environment name')
        .description('Shows a list of all available envs')
        .asyncAction(Env_1.default.listEnvs);
    // Show active env
    program
        .command('current-env')
        .alias('ctx')
        .description('Prints active env')
        .asyncAction(Env_1.default.getEnv);
}
exports.default = env;
