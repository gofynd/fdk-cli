"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = __importDefault(require("./Logger"));
function default_1(args) {
    if (process.env.DEBUG === 'fdk') {
        return Logger_1.default.debug(args);
    }
}
exports.default = default_1;
