"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var theme_builder_1 = __importDefault(require("./theme-builder"));
function theme(program) {
    program
        .addCommand((0, theme_builder_1.default)());
}
exports.default = theme;
