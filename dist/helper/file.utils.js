"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirectory = exports.writeFile = exports.readFile = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var readFile = function (relativePath) {
    var fileContents = fs_extra_1.default.readFileSync(relativePath, {
        encoding: 'utf-8',
    });
    return fileContents;
};
exports.readFile = readFile;
var writeFile = function (relativePath, fileContents) {
    fs_extra_1.default.ensureFileSync(relativePath);
    fs_extra_1.default.writeFileSync(relativePath, fileContents, {
        encoding: 'utf-8',
    });
};
exports.writeFile = writeFile;
var createDirectory = function (relativePath) {
    if (!fs_extra_1.default.existsSync(relativePath)) {
        fs_extra_1.default.mkdirSync(relativePath, { recursive: true });
    }
    else {
        fs_extra_1.default.emptyDirSync(relativePath);
    }
};
exports.createDirectory = createDirectory;
