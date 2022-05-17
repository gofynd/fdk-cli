"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var environment_builder_1 = __importDefault(require("./environment-builder"));
function env(program) {
    program
        .addCommand((0, environment_builder_1.default)());
}
exports.default = env;
