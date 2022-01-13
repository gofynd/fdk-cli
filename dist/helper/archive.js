"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractArchive = exports.archiveFolder = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var archiver_1 = __importDefault(require("archiver"));
var extract_zip_1 = __importDefault(require("extract-zip"));
var file_utils_1 = require("./file.utils");
var Logger_1 = __importDefault(require("../lib/Logger"));
function archiveFolder(_a) {
    var srcFolder = _a.srcFolder, destFolder = _a.destFolder, zipFileName = _a.zipFileName;
    return new Promise(function (resolve, reject) {
        var filePath = path_1.default.resolve(destFolder, zipFileName);
        // clear previous build archive
        var archiveExists = fs_1.default.existsSync(filePath);
        if (archiveExists) {
            fs_1.default.unlinkSync(filePath);
        }
        if (!fs_1.default.existsSync(destFolder)) {
            fs_1.default.mkdirSync(destFolder);
        }
        var output = fs_1.default.createWriteStream(filePath);
        var archive = archiver_1.default('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('warning', function (err) {
            console.log(err);
            Logger_1.default.warn(err.message);
            if (err.code === 'ENOENT') {
                // log warning
            }
            else {
                // throw error
                throw err;
            }
        });
        output.on('close', function () {
            resolve(true);
        });
        archive.on('error', function (err) {
            Logger_1.default.error(err.message);
            reject(err);
        });
        archive.pipe(output);
        archive.directory(srcFolder, false);
        archive.finalize();
    });
}
exports.archiveFolder = archiveFolder;
function extractArchive(_a) {
    var _this = this;
    var zipPath = _a.zipPath, destFolderPath = _a.destFolderPath;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    file_utils_1.createDirectory(destFolderPath);
                    return [4 /*yield*/, extract_zip_1.default(zipPath, { dir: destFolderPath })];
                case 1:
                    _a.sent();
                    resolve(true);
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    Logger_1.default.error(e_1.message);
                    reject(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
exports.extractArchive = extractArchive;
