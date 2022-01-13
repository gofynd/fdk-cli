"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var utils_1 = require("../helper/utils");
var CommandError_1 = __importStar(require("./CommandError"));
var Logger_1 = __importDefault(require("./Logger"));
var configuration_service_1 = __importDefault(require("./api/services/configuration.service"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var execa_1 = __importDefault(require("execa"));
var rimraf_1 = __importDefault(require("rimraf"));
var boxen_1 = __importDefault(require("boxen"));
var chalk_1 = __importDefault(require("chalk"));
var inquirer_1 = __importDefault(require("inquirer"));
var vue_template_compiler_1 = __importDefault(require("vue-template-compiler"));
var cheerio_1 = __importDefault(require("cheerio"));
var glob_1 = __importDefault(require("glob"));
var lodash_1 = __importDefault(require("lodash"));
var require_from_string_1 = __importDefault(require("require-from-string"));
var file_utils_1 = require("../helper/file.utils");
var shortid_1 = __importDefault(require("shortid"));
var theme_service_1 = __importDefault(require("./api/services/theme.service"));
var upload_service_1 = __importDefault(require("./api/services/upload.service"));
var build_1 = require("../helper/build");
var archive_1 = require("../helper/archive");
var url_join_1 = __importDefault(require("url-join"));
var serve_utils_1 = require("../helper/serve.utils");
var url_1 = require("./api/services/url");
var open_1 = __importDefault(require("open"));
var chokidar_1 = __importDefault(require("chokidar"));
var download_1 = require("../helper/download");
var Env_1 = __importDefault(require("./Env"));
var Debug_1 = __importDefault(require("./Debug"));
var ora_1 = __importDefault(require("ora"));
var Theme = /** @class */ (function () {
    function Theme() {
    }
    Theme.createTheme = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var shouldDelete, targetDirectory, configObj, appConfig, available_sections, themeData, theme, context, packageJSON, b5, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldDelete = false;
                        targetDirectory = path_1.default.join(process.cwd(), options.name);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 14]);
                        if (fs_extra_1.default.existsSync(targetDirectory)) {
                            shouldDelete = false;
                            throw new CommandError_1.default("Folder " + options.name + " already exists");
                        }
                        Logger_1.default.warn('Validating token');
                        configObj = JSON.parse(utils_1.decodeBase64(options.token) || '{}');
                        Debug_1.default("Token Data: " + JSON.stringify(configObj));
                        if (!configObj)
                            throw new CommandError_1.default('Invalid token', CommandError_1.ErrorCodes.INVALID_INPUT.code);
                        if (new Date(Date.now()) > new Date(configObj.expires_in)) {
                            throw new CommandError_1.default('Token expired. Generate a new token', CommandError_1.ErrorCodes.INVALID_INPUT.code);
                        }
                        Debug_1.default("Token expires in: " + configObj.expires_in);
                        return [4 /*yield*/, configuration_service_1.default.getApplicationDetails(configObj)];
                    case 2:
                        appConfig = (_a.sent()).data;
                        Logger_1.default.warn('Creating Theme');
                        return [4 /*yield*/, Theme.getAvailableSections()];
                    case 3:
                        available_sections = _a.sent();
                        themeData = {
                            information: {
                                name: options.name,
                            },
                            available_sections: available_sections,
                        };
                        return [4 /*yield*/, theme_service_1.default.createTheme(__assign(__assign({}, configObj), themeData))];
                    case 4:
                        theme = (_a.sent()).data;
                        Logger_1.default.warn('Copying template files');
                        shouldDelete = true;
                        return [4 /*yield*/, Theme.copyTemplateFiles(Theme.TEMPLATE_DIRECTORY, targetDirectory)];
                    case 5:
                        _a.sent();
                        context = {
                            name: options.name,
                            application_id: appConfig._id,
                            domain: appConfig.domain.name,
                            company_id: appConfig.company_id,
                            theme_id: theme._id,
                        };
                        process.chdir("./" + options.name);
                        Logger_1.default.warn('Saving context');
                        return [4 /*yield*/, utils_1.createContext(context)];
                    case 6:
                        _a.sent();
                        Logger_1.default.warn('Installing dependencies');
                        return [4 /*yield*/, Theme.installNpmPackages()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, fs_extra_1.default.readJSON(process.cwd() + "/package.json")];
                    case 8:
                        packageJSON = _a.sent();
                        packageJSON.name = Theme.sanitizeThemeName(options.name);
                        return [4 /*yield*/, fs_extra_1.default.writeJSON(process.cwd() + "/package.json", packageJSON, {
                                spaces: 2,
                            })];
                    case 9:
                        _a.sent();
                        Logger_1.default.warn('Syncing theme');
                        return [4 /*yield*/, Theme.syncTheme(true)];
                    case 10:
                        _a.sent();
                        b5 = boxen_1.default(chalk_1.default.green.bold('DONE ') +
                            chalk_1.default.green.bold('Project ready\n') +
                            chalk_1.default.yellowBright.bold('NOTE ') +
                            chalk_1.default.green.bold('cd ' + targetDirectory + ' to continue ...'), {
                            padding: 1,
                            margin: 1,
                        });
                        console.log(b5.toString());
                        return [3 /*break*/, 14];
                    case 11:
                        error_1 = _a.sent();
                        if (!shouldDelete) return [3 /*break*/, 13];
                        return [4 /*yield*/, Theme.cleanUp(targetDirectory)];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: throw new CommandError_1.default(error_1.message, error_1.code);
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // private methods
    Theme.copyTemplateFiles = function (templateDirectory, targetDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        file_utils_1.createDirectory(targetDirectory);
                        return [4 /*yield*/, fs_extra_1.default.copy(templateDirectory, targetDirectory)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, execa_1.default('git', ['init'], { cwd: targetDirectory })];
                    case 2:
                        _a.sent();
                        file_utils_1.writeFile(targetDirectory + '/.gitignore', ".fdk\nnode_modules");
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Theme.installNpmPackages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var exec = execa_1.default('npm', ['i'], { cwd: process.cwd() });
                        exec.stdout.pipe(process.stdout);
                        exec.stderr.pipe(process.stderr);
                        exec.on('exit', function (code) {
                            if (!code) {
                                return resolve(code);
                            }
                            reject({ message: 'Installation Failed' });
                        });
                    })];
            });
        });
    };
    Theme.getAvailableSections = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sectionsFiles, pArr;
            var _this = this;
            return __generator(this, function (_a) {
                sectionsFiles = [];
                try {
                    sectionsFiles = fs_extra_1.default
                        .readdirSync(path_1.default.join(Theme.TEMPLATE_DIRECTORY, '/sections'))
                        .filter(function (o) { return o != 'index.js'; });
                }
                catch (err) { }
                pArr = sectionsFiles.map(function (f) { return __awaiter(_this, void 0, void 0, function () {
                    var image_section, sectionSettings;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                image_section = vue_template_compiler_1.default.parseComponent(file_utils_1.readFile(path_1.default.join(Theme.TEMPLATE_DIRECTORY, 'sections', f)));
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        require('@babel/core').transform(image_section.script.content, {
                                            plugins: ['@babel/plugin-transform-modules-commonjs'],
                                        }, function (err, result) {
                                            if (err) {
                                                return reject(err);
                                            }
                                            try {
                                                var modules = require_from_string_1.default(result.code);
                                                return resolve(modules.settings);
                                            }
                                            catch (e) {
                                                return reject(e);
                                            }
                                        });
                                    })];
                            case 1:
                                sectionSettings = _a.sent();
                                return [2 /*return*/, sectionSettings];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.all(pArr)];
            });
        });
    };
    Theme.getAvailableSectionsForSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sectionsFiles, settings;
            return __generator(this, function (_a) {
                sectionsFiles = fs_extra_1.default
                    .readdirSync(process.cwd() + "/theme/sections")
                    .filter(function (o) { return o != 'index.js'; });
                settings = sectionsFiles.map(function (f) {
                    return Theme.extractSettingsFromFile(process.cwd() + "/theme/sections/" + f);
                });
                return [2 /*return*/, settings];
            });
        });
    };
    Theme.extractSettingsFromFile = function (path) {
        var $ = cheerio_1.default.load(file_utils_1.readFile(path));
        var settingsText = $('settings').text();
        return settingsText ? JSON.parse(settingsText) : {};
    };
    Theme.validateSections = function (available_sections) {
        var fileNameRegex = /^[0-9a-zA-Z-_ ... ]+$/;
        var sectionNamesObject = {};
        available_sections.forEach(function (section, index) {
            if (!fileNameRegex.test(section.name)) {
                throw new Error("Invalid section name, " + section.name);
            }
            if (sectionNamesObject["" + section.name]) {
                throw new Error("Duplication section name found. " + section.name);
            }
            sectionNamesObject["" + section.name] = true;
        });
        return available_sections;
    };
    Theme.createSectionsIndexFile = function (available_sections) {
        return __awaiter(this, void 0, void 0, function () {
            var fileNames, template;
            return __generator(this, function (_a) {
                available_sections = available_sections || [];
                fileNames = fs_extra_1.default
                    .readdirSync(process.cwd() + "/theme/sections")
                    .filter(function (o) { return o != 'index.js'; });
                template = "\n            " + fileNames.map(function (f, i) { return "import * as component" + i + " from './" + f + "';"; }).join('\n') + "\n\n            function exportComponents(components) {\n            return [\n                " + available_sections
                    .map(function (s, i) {
                    return JSON.stringify({
                        name: s.name,
                        label: s.label,
                        component: '',
                    }).replace('"component":""', "\"component\": components[" + i + "].default");
                })
                    .join(',\n') + "\n            ];\n            }\n\n            export default exportComponents([" + fileNames
                    .map(function (f, i) { return "component" + i; })
                    .join(',') + "]);\n            ";
                rimraf_1.default.sync(process.cwd() + "/theme/sections/index.js");
                fs_extra_1.default.writeFileSync(process.cwd() + "/theme/sections/index.js", template);
                return [2 /*return*/];
            });
        });
    };
    Theme.extractSectionsFromFile = function (path) {
        var $ = cheerio_1.default.load(file_utils_1.readFile(path));
        var template = $('template').html();
        if (!template) {
            return [];
        }
        $ = cheerio_1.default.load(template);
        var sections = $('sections');
        sections = sections.map(function () {
            return { attributes: $(this).attr() };
        });
        return sections.get();
    };
    Theme.cleanUp = function (targetDirectory) {
        if (targetDirectory === void 0) { targetDirectory = process.cwd(); }
        return __awaiter(this, void 0, void 0, function () {
            var contexts, activeContext, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        Logger_1.default.warn('Cleaning up');
                        if (!fs_extra_1.default.existsSync(targetDirectory)) return [3 /*break*/, 4];
                        if (!fs_extra_1.default.existsSync(targetDirectory + "/.fdk/context.json")) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_extra_1.default.readJSON(targetDirectory + "/.fdk/context.json")];
                    case 1:
                        contexts = _a.sent();
                        activeContext = contexts.active_context;
                        return [4 /*yield*/, theme_service_1.default.deleteThemeById(contexts.contexts[activeContext])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        rimraf_1.default.sync(targetDirectory);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        throw new CommandError_1.default(error_3.message);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /*
        new theme from default template -> create
        create theme from another theme -> init
        pull theme updates
        serve theme
        sync theme
        publish theme
        unpublish theme
        pull-config
    */
    Theme.TEMPLATE_DIRECTORY = path_1.default.join(__dirname, '../../template');
    Theme.BUILD_FOLDER = './.fdk/dist';
    Theme.SRC_FOLDER = './.fdk/temp-theme';
    Theme.SRC_ARCHIVE_FOLDER = './.fdk/archive';
    Theme.ZIP_FILE_NAME = "archive.zip";
    Theme.initTheme = function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var shouldDelete, targetDirectory, configObj, appConfig, themeData, themeName, context, zipPath, list, current, preset, information, packageJSON, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    shouldDelete = false;
                    targetDirectory = '';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 13, , 16]);
                    Logger_1.default.warn('Validating token');
                    configObj = JSON.parse(utils_1.decodeBase64(options.token) || '{}');
                    Debug_1.default("Token Data: " + JSON.stringify(configObj));
                    if (!configObj || !configObj.theme_id)
                        throw new CommandError_1.default('Invalid token', CommandError_1.ErrorCodes.INVALID_INPUT.code);
                    if (new Date(Date.now()) > new Date(configObj.expires_in))
                        throw new CommandError_1.default('Token expired. Generate a new token', CommandError_1.ErrorCodes.INVALID_INPUT.code);
                    return [4 /*yield*/, configuration_service_1.default.getApplicationDetails(configObj)];
                case 2:
                    appConfig = (_b.sent()).data;
                    Logger_1.default.warn('Fetching Template Files');
                    return [4 /*yield*/, theme_service_1.default.getThemeById(configObj)];
                case 3:
                    themeData = (_b.sent()).data;
                    themeName = ((_a = themeData === null || themeData === void 0 ? void 0 : themeData.information) === null || _a === void 0 ? void 0 : _a.name) || 'default';
                    targetDirectory = path_1.default.join(process.cwd(), themeName);
                    if (fs_extra_1.default.existsSync(targetDirectory)) {
                        shouldDelete = false;
                        throw new CommandError_1.default("Folder " + themeName + "  already exists");
                    }
                    Logger_1.default.warn('Copying template files');
                    shouldDelete = true;
                    return [4 /*yield*/, Theme.copyTemplateFiles(Theme.TEMPLATE_DIRECTORY, targetDirectory)];
                case 4:
                    _b.sent();
                    context = {
                        name: themeName + '-' + Env_1.default.getEnvValue(),
                        application_id: appConfig._id,
                        domain: appConfig.domain.name,
                        company_id: appConfig.company_id,
                        theme_id: themeData._id,
                    };
                    process.chdir("./" + themeName);
                    zipPath = path_1.default.join(targetDirectory, '.fdk/archive/archive.zip');
                    Logger_1.default.warn('Downloading bundle files');
                    return [4 /*yield*/, download_1.downloadFile(themeData.src.link, zipPath)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, archive_1.extractArchive({ zipPath: zipPath, destFolderPath: path_1.default.resolve(process.cwd(), 'theme') })];
                case 6:
                    _b.sent();
                    Logger_1.default.warn('Generating Configuration Files');
                    list = lodash_1.default.get(themeData, 'config.list', []);
                    current = lodash_1.default.get(themeData, 'config.current', 'default');
                    preset = lodash_1.default.get(themeData, 'config.preset', {});
                    information = { features: lodash_1.default.get(themeData, 'information.features', []) };
                    return [4 /*yield*/, fs_extra_1.default.writeJson(process.cwd() + '/theme/config/settings_data.json', { list: list, current: current, preset: preset, information: information }, {
                            spaces: 2,
                        })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, fs_extra_1.default.writeJson(process.cwd() + '/theme/config/settings_schema.json', lodash_1.default.get(themeData, 'config.global_schema', { props: [] }), {
                            spaces: 2,
                        })];
                case 8:
                    _b.sent();
                    fs_extra_1.default.writeJson(path_1.default.join(targetDirectory, '/config.json'), {
                        theme: {
                            colors: themeData.colors,
                            styles: themeData.styles,
                            font: themeData.font,
                        },
                    }, {
                        spaces: 2,
                    });
                    Logger_1.default.warn('Saving context');
                    return [4 /*yield*/, utils_1.createContext(context)];
                case 9:
                    _b.sent();
                    Logger_1.default.warn('Installing dependencies');
                    if (fs_extra_1.default.existsSync(process.cwd() + '/theme/package.json')) {
                        file_utils_1.writeFile(process.cwd() + '/package.json', fs_extra_1.default.readFileSync(process.cwd() + '/theme/package.json'));
                        rimraf_1.default.sync(process.cwd() + '/theme/package.json');
                    }
                    return [4 /*yield*/, Theme.installNpmPackages()];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, fs_extra_1.default.readJSON(process.cwd() + "/package.json")];
                case 11:
                    packageJSON = _b.sent();
                    packageJSON.name = Theme.sanitizeThemeName(themeName);
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(process.cwd() + "/package.json", packageJSON, {
                            spaces: 2,
                        })];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 13:
                    error_4 = _b.sent();
                    if (!shouldDelete) return [3 /*break*/, 15];
                    return [4 /*yield*/, Theme.cleanUp(targetDirectory)];
                case 14:
                    _b.sent();
                    _b.label = 15;
                case 15: throw new CommandError_1.default(error_4.message, error_4.code);
                case 16: return [2 /*return*/];
            }
        });
    }); };
    Theme.syncThemeWrapper = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Theme.syncTheme()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    Theme.syncTheme = function (isNew) {
        if (isNew === void 0) { isNew = false; }
        return __awaiter(void 0, void 0, void 0, function () {
            var currentContext, env, theme, newConfig_1, oldConfig, questions, themeContent, available_sections, imageCdnUrl, assetCdnUrl, startData, startAssetData, startData, startAssetData, androidImages, iosImages, desktopImages, thumbnailImages, androidImageFolder, pArr, iosImageFolder, desktopImageFolder, thumbnailImageFolder, cwd, images, cwd, fonts, zipFilePath, srcCdnUrl, res, urlHash_1, assets, pArr, _a, cssUrl, commonJsUrl, umdJsUrl, packageJSON, globalConfigSchema, globalConfigData, pageTemplateFiles, availablePages_1, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 27, , 28]);
                        currentContext = utils_1.getActiveContext();
                        env = Env_1.default.getEnvValue();
                        if (env !== currentContext.env) {
                            throw new CommandError_1.default('Active context environment and cli environment are different. Use fdk current-env to know the active envoirnement', CommandError_1.ErrorCodes.INVALID_CONTEXT.code);
                        }
                        currentContext.domain
                            ? Logger_1.default.success('Syncing Theme to: ' + currentContext.domain)
                            : Logger_1.default.warn('Please add domain to context');
                        return [4 /*yield*/, theme_service_1.default.getThemeById(currentContext)];
                    case 1:
                        theme = (_b.sent()).data;
                        newConfig_1 = Theme.getSettingsData(theme);
                        return [4 /*yield*/, fs_extra_1.default.readJSON('./theme/config/settings_data.json')];
                    case 2:
                        oldConfig = _b.sent();
                        questions = [
                            {
                                type: 'confirm',
                                name: 'pullConfig',
                                message: 'Do you wish to pull config from remote?',
                            },
                        ];
                        if (!(!isNew && !lodash_1.default.isEqual(newConfig_1, oldConfig))) return [3 /*break*/, 4];
                        return [4 /*yield*/, inquirer_1.default.prompt(questions).then(function (answers) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!answers.pullConfig) return [3 /*break*/, 2];
                                            return [4 /*yield*/, fs_extra_1.default.writeJSON('./theme/config/settings_data.json', newConfig_1, {
                                                    spaces: 2,
                                                })];
                                        case 1:
                                            _a.sent();
                                            Logger_1.default.success('Config updated successfully');
                                            return [3 /*break*/, 3];
                                        case 2:
                                            Logger_1.default.warn('Using local config to sync');
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        Theme.clearPreviousBuild();
                        Logger_1.default.warn('Reading Files...');
                        themeContent = file_utils_1.readFile(process.cwd() + "/config.json");
                        try {
                            themeContent = JSON.parse(themeContent);
                        }
                        catch (e) {
                            throw new CommandError_1.default("Invalid config.json");
                        }
                        return [4 /*yield*/, Theme.getAvailableSectionsForSync()];
                    case 5:
                        available_sections = _b.sent();
                        Logger_1.default.warn('Validating Files...');
                        return [4 /*yield*/, Theme.validateSections(available_sections)];
                    case 6:
                        available_sections = _b.sent();
                        Theme.createSectionsIndexFile(available_sections);
                        imageCdnUrl = '';
                        assetCdnUrl = '';
                        startData = {
                            file_name: 'test.jpg',
                            content_type: 'image/jpeg',
                            size: '1',
                        };
                        return [4 /*yield*/, upload_service_1.default.startUpload(startData, 'application-theme-images')];
                    case 7:
                        startAssetData = (_b.sent()).data;
                        imageCdnUrl = path_1.default.dirname(startAssetData.cdn.url);
                        if (!fs_extra_1.default.existsSync(path_1.default.join(process.cwd(), 'theme/assets/fonts'))) return [3 /*break*/, 9];
                        startData = {
                            file_name: 'test.ttf',
                            content_type: 'font/ttf',
                            size: '10',
                        };
                        return [4 /*yield*/, upload_service_1.default.startUpload(startData, 'application-theme-assets')];
                    case 8:
                        startAssetData = (_b.sent()).data;
                        assetCdnUrl = path_1.default.dirname(startAssetData.cdn.url);
                        _b.label = 9;
                    case 9:
                        Logger_1.default.warn('Building Assets...');
                        // build js css
                        return [4 /*yield*/, build_1.build({ buildFolder: Theme.BUILD_FOLDER, imageCdnUrl: imageCdnUrl, assetCdnUrl: assetCdnUrl })];
                    case 10:
                        // build js css
                        _b.sent();
                        // check if build folder exists, as during build, vue fails with non-error code even when it errors out
                        if (!fs_extra_1.default.existsSync(Theme.BUILD_FOLDER)) {
                            throw new Error('Build Failed');
                        }
                        androidImages = [];
                        iosImages = [];
                        desktopImages = [];
                        thumbnailImages = [];
                        androidImageFolder = path_1.default.resolve(process.cwd(), 'theme/config/images/android');
                        androidImages = glob_1.default.sync('**/**.**', { cwd: androidImageFolder });
                        Logger_1.default.warn('Uploading android images...');
                        pArr = androidImages
                            .map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                            var assetPath, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        assetPath = path_1.default.join(process.cwd(), 'theme/config/images/android', img);
                                        return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-images')];
                                    case 1:
                                        res = _a.sent();
                                        return [2 /*return*/, res.start.cdn.url];
                                }
                            });
                        }); })
                            .filter(function (o) { return o; });
                        return [4 /*yield*/, Promise.all(pArr)];
                    case 11:
                        androidImages = _b.sent();
                        iosImageFolder = path_1.default.resolve(process.cwd(), 'theme/config/images/ios');
                        iosImages = glob_1.default.sync('**/**.**', { cwd: iosImageFolder });
                        Logger_1.default.warn('Uploading ios images...');
                        pArr = iosImages
                            .map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                            var assetPath, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        assetPath = path_1.default.join(process.cwd(), 'theme/config/images/ios', img);
                                        return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-images')];
                                    case 1:
                                        res = _a.sent();
                                        return [2 /*return*/, res.start.cdn.url];
                                }
                            });
                        }); })
                            .filter(function (o) { return o; });
                        return [4 /*yield*/, Promise.all(pArr)];
                    case 12:
                        iosImages = _b.sent();
                        desktopImageFolder = path_1.default.resolve(process.cwd(), 'theme/config/images/desktop');
                        desktopImages = glob_1.default.sync('**/**.**', { cwd: desktopImageFolder });
                        Logger_1.default.warn('Uploading desktop images...');
                        pArr = desktopImages
                            .map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                            var assetPath, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        assetPath = path_1.default.join(process.cwd(), 'theme/config/images/desktop', img);
                                        return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-images')];
                                    case 1:
                                        res = _a.sent();
                                        return [2 /*return*/, res.start.cdn.url];
                                }
                            });
                        }); })
                            .filter(function (o) { return o; });
                        return [4 /*yield*/, Promise.all(pArr)];
                    case 13:
                        desktopImages = _b.sent();
                        thumbnailImageFolder = path_1.default.resolve(process.cwd(), 'theme/config/images/thumbnail');
                        thumbnailImages = glob_1.default.sync('**/**.**', { cwd: thumbnailImageFolder });
                        Logger_1.default.warn('Uploading thumbnail images...');
                        pArr = thumbnailImages
                            .map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                            var assetPath, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        assetPath = path_1.default.join(process.cwd(), 'theme/config/images/thumbnail', img);
                                        return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-images')];
                                    case 1:
                                        res = _a.sent();
                                        return [2 /*return*/, res.start.cdn.url];
                                }
                            });
                        }); })
                            .filter(function (o) { return o; });
                        return [4 /*yield*/, Promise.all(pArr)];
                    case 14:
                        thumbnailImages = _b.sent();
                        cwd = path_1.default.resolve(process.cwd(), Theme.BUILD_FOLDER, 'assets/images');
                        images = glob_1.default.sync('**/**.**', { cwd: cwd });
                        Logger_1.default.warn('Uploading images...');
                        return [4 /*yield*/, utils_1.asyncForEach(images, function (img) { return __awaiter(void 0, void 0, void 0, function () {
                                var assetPath;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            assetPath = path_1.default.join(Theme.BUILD_FOLDER, 'assets/images', img);
                                            return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-images')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 15:
                        _b.sent();
                        if (!fs_extra_1.default.existsSync(path_1.default.join(process.cwd(), Theme.BUILD_FOLDER, 'assets/fonts'))) return [3 /*break*/, 17];
                        cwd = path_1.default.join(process.cwd(), Theme.BUILD_FOLDER, 'assets/fonts');
                        fonts = glob_1.default.sync('**/**.**', { cwd: cwd });
                        Logger_1.default.warn('Uploading fonts...');
                        return [4 /*yield*/, utils_1.asyncForEach(fonts, function (font) { return __awaiter(void 0, void 0, void 0, function () {
                                var assetPath;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            assetPath = path_1.default.join(Theme.BUILD_FOLDER, 'assets/fonts', font);
                                            return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-assets')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17:
                        //copy files to .fdk
                        Logger_1.default.warn('Archiving src...');
                        return [4 /*yield*/, fs_extra_1.default.copy('./theme', Theme.SRC_FOLDER)];
                    case 18:
                        _b.sent();
                        fs_extra_1.default.copyFileSync('./package.json', Theme.SRC_FOLDER + '/package.json');
                        return [4 /*yield*/, archive_1.archiveFolder({
                                srcFolder: Theme.SRC_FOLDER,
                                destFolder: Theme.SRC_ARCHIVE_FOLDER,
                                zipFileName: Theme.ZIP_FILE_NAME,
                            })];
                    case 19:
                        _b.sent();
                        //remove temp files
                        rimraf_1.default.sync(Theme.SRC_FOLDER);
                        zipFilePath = path_1.default.join(Theme.SRC_ARCHIVE_FOLDER, Theme.ZIP_FILE_NAME);
                        srcCdnUrl = void 0;
                        Logger_1.default.warn('Uploading src...');
                        return [4 /*yield*/, upload_service_1.default.uploadFile(zipFilePath, 'application-theme-src')];
                    case 20:
                        res = _b.sent();
                        srcCdnUrl = res.start.cdn.url;
                        urlHash_1 = shortid_1.default.generate();
                        assets = [
                            'themeBundle.css',
                            'themeBundle.common.js',
                            'themeBundle.umd.min.js',
                        ];
                        Logger_1.default.warn('Uploading assets...');
                        pArr = assets.map(function (asset) { return __awaiter(void 0, void 0, void 0, function () {
                            var assetPath, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        fs_extra_1.default.renameSync(path_1.default.join(Theme.BUILD_FOLDER, asset), Theme.BUILD_FOLDER + "/" + urlHash_1 + "-" + asset);
                                        assetPath = path_1.default.join(Theme.BUILD_FOLDER, urlHash_1 + "-" + asset);
                                        return [4 /*yield*/, upload_service_1.default.uploadFile(assetPath, 'application-theme-assets')];
                                    case 1:
                                        res = _a.sent();
                                        return [2 /*return*/, res.start.cdn.url];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(pArr)];
                    case 21:
                        _a = _b.sent(), cssUrl = _a[0], commonJsUrl = _a[1], umdJsUrl = _a[2];
                        packageJSON = JSON.parse(file_utils_1.readFile(process.cwd() + "/package.json"));
                        if (!packageJSON.name) {
                            throw new Error('package.json name can not be empty');
                        }
                        theme.src = theme.src || {};
                        theme.src.link = srcCdnUrl;
                        theme.assets = theme.assets || {};
                        theme.assets.umdJs = theme.assets.umdJs || {};
                        theme.assets.umdJs.link = umdJsUrl;
                        theme.assets.commonJs = theme.assets.commonJs || {};
                        theme.assets.commonJs.link = commonJsUrl;
                        theme.assets.css = theme.assets.css || {};
                        theme.assets.css.link = cssUrl;
                        // TODO Issue here
                        theme = __assign(__assign(__assign({}, theme), themeContent.theme), { available_sections: available_sections });
                        lodash_1.default.set(theme, 'information.images.desktop', desktopImages);
                        lodash_1.default.set(theme, 'information.images.ios', iosImages);
                        lodash_1.default.set(theme, 'information.images.android', androidImages);
                        lodash_1.default.set(theme, 'information.images.thumbnail', thumbnailImages);
                        lodash_1.default.set(theme, 'information.name', Theme.unSanitizeThemeName(packageJSON.name));
                        return [4 /*yield*/, fs_extra_1.default.readJSON(process.cwd() + "/theme/config/settings_schema.json")];
                    case 22:
                        globalConfigSchema = _b.sent();
                        return [4 /*yield*/, fs_extra_1.default.readJSON(process.cwd() + "/theme/config/settings_data.json")];
                    case 23:
                        globalConfigData = _b.sent();
                        theme.config = theme.config || {};
                        theme.config.global_schema = globalConfigSchema;
                        theme.config.current = globalConfigData.current || 'default';
                        theme.config.list = globalConfigData.list || [{ name: 'default' }];
                        theme.config.preset = globalConfigData.preset || [];
                        theme.version = packageJSON.version;
                        theme.customized = true;
                        lodash_1.default.set(theme, 'information.features', lodash_1.default.get(globalConfigData, 'information.features', []));
                        pageTemplateFiles = fs_extra_1.default
                            .readdirSync(process.cwd() + "/theme/templates/pages")
                            .filter(function (o) { return o != 'index.js'; });
                        theme.config = theme.config || {};
                        availablePages_1 = [];
                        return [4 /*yield*/, utils_1.asyncForEach(pageTemplateFiles, function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
                                var pageName, available_page, error_6, pageData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            pageName = fileName.replace('.vue', '');
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, theme_service_1.default.getAvailablePage(pageName)];
                                        case 2:
                                            available_page = (_a.sent()).data;
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_6 = _a.sent();
                                            Logger_1.default.log('Creating Page: ', pageName);
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (!!available_page) return [3 /*break*/, 6];
                                            pageData = {
                                                value: pageName,
                                                props: [],
                                                sections: [],
                                                sections_meta: [],
                                                type: 'system',
                                                text: utils_1.pageNameModifier(pageName),
                                            };
                                            return [4 /*yield*/, theme_service_1.default.createAvailabePage(pageData)];
                                        case 5:
                                            available_page = (_a.sent()).data;
                                            _a.label = 6;
                                        case 6:
                                            available_page.props =
                                                (Theme.extractSettingsFromFile(process.cwd() + "/theme/templates/pages/" + fileName) || {}).props || [];
                                            available_page.sections_meta = Theme.extractSectionsFromFile(process.cwd() + "/theme/templates/pages/" + fileName);
                                            available_page.type = 'system';
                                            delete available_page.sections;
                                            availablePages_1.push(available_page);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 24:
                        _b.sent();
                        Logger_1.default.warn('Updating theme...');
                        return [4 /*yield*/, Promise.all([theme_service_1.default.updateTheme(theme)])];
                    case 25:
                        _b.sent();
                        Logger_1.default.warn('Updating pages...');
                        return [4 /*yield*/, utils_1.asyncForEach(availablePages_1, function (page) { return __awaiter(void 0, void 0, void 0, function () {
                                var error_7;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            Logger_1.default.warn('Updating page: ', page.value);
                                            return [4 /*yield*/, theme_service_1.default.updateAvailablePage(page)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_7 = _a.sent();
                                            throw new CommandError_1.default(error_7.message);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 26:
                        _b.sent();
                        Logger_1.default.success('DONE...');
                        return [3 /*break*/, 28];
                    case 27:
                        error_5 = _b.sent();
                        throw new CommandError_1.default(error_5.message, error_5.code);
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    Theme.serveTheme = function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var isSSR_1, appInfo, domain, host_1, watcher, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    isSSR_1 = typeof options['ssr'] === 'boolean'
                        ? options['ssr']
                        : options['ssr'] == 'true'
                            ? true
                            : false;
                    !isSSR_1 ? Logger_1.default.warn('Disabling SSR') : null;
                    return [4 /*yield*/, configuration_service_1.default.getApplicationDetails()];
                case 1:
                    appInfo = (_a.sent()).data;
                    domain = Array.isArray(appInfo.domains)
                        ? "https://" + appInfo.domains.filter(function (d) { return d.is_primary; })[0].name
                        : "https://" + appInfo.domain.name;
                    host_1 = url_1.BASE_URL;
                    // initial build
                    Logger_1.default.success("Locally building............");
                    return [4 /*yield*/, build_1.devBuild({
                            buildFolder: Theme.BUILD_FOLDER,
                            imageCdnUrl: url_join_1.default(serve_utils_1.getFullLocalUrl(host_1), 'assets/images'),
                            isProd: isSSR_1,
                        })];
                case 2:
                    _a.sent();
                    // start dev server
                    console.log(chalk_1.default.bold.green("Starting server"));
                    return [4 /*yield*/, serve_utils_1.startServer({ domain: domain, host: host_1, isSSR: isSSR_1 })];
                case 3:
                    _a.sent();
                    // open browser
                    return [4 /*yield*/, open_1.default(serve_utils_1.getFullLocalUrl(host_1))];
                case 4:
                    // open browser
                    _a.sent();
                    console.log(chalk_1.default.bold.green("Watching files for changes"));
                    watcher = chokidar_1.default.watch(path_1.default.resolve(process.cwd(), 'theme'), {
                        persistent: true,
                    });
                    watcher.on('change', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(chalk_1.default.bold.green("building............"));
                                    return [4 /*yield*/, build_1.devBuild({
                                            buildFolder: path_1.default.resolve(process.cwd(), Theme.BUILD_FOLDER),
                                            imageCdnUrl: url_join_1.default(serve_utils_1.getFullLocalUrl(host_1), 'assets/images'),
                                            isProd: isSSR_1,
                                        })];
                                case 1:
                                    _a.sent();
                                    serve_utils_1.reload();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 6];
                case 5:
                    error_8 = _a.sent();
                    throw new CommandError_1.default(error_8.message, error_8.code);
                case 6: return [2 /*return*/];
            }
        });
    }); };
    Theme.pullTheme = function () { return __awaiter(void 0, void 0, void 0, function () {
        var spinner, themeData, theme, list, current, preset, information, packageJSON, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    spinner = ora_1.default('Pulling theme data').start();
                    rimraf_1.default.sync(path_1.default.resolve(process.cwd(), './theme'));
                    file_utils_1.createDirectory('theme');
                    return [4 /*yield*/, theme_service_1.default.getThemeById(null)];
                case 1:
                    themeData = (_a.sent()).data;
                    theme = lodash_1.default.cloneDeep(__assign({}, themeData));
                    rimraf_1.default.sync(path_1.default.resolve(process.cwd(), './.fdk/archive'));
                    return [4 /*yield*/, download_1.downloadFile(theme.src.link, './.fdk/pull-archive.zip')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, archive_1.extractArchive({
                            zipPath: path_1.default.resolve(process.cwd(), './.fdk/pull-archive.zip'),
                            destFolderPath: path_1.default.resolve(process.cwd(), './theme'),
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(path_1.default.join(process.cwd(), '/config.json'), { theme: lodash_1.default.pick(theme, ['colors', 'styles', 'font']) }, {
                            spaces: 2,
                        })];
                case 4:
                    _a.sent();
                    list = lodash_1.default.get(theme, 'config.list', []);
                    current = lodash_1.default.get(theme, 'config.current', 'default');
                    preset = lodash_1.default.get(theme, 'config.preset', {});
                    information = { features: lodash_1.default.get(theme, 'information.features', []) };
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(path_1.default.join(process.cwd(), '/theme/config/settings_data.json'), { list: list, current: current, preset: preset, information: information }, {
                            spaces: 2,
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(path_1.default.join(process.cwd(), '/theme/config/settings_schema.json'), lodash_1.default.get(theme, 'config.global_schema', { props: [] }), {
                            spaces: 2,
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.readJSON(process.cwd() + '/theme/package.json')];
                case 7:
                    packageJSON = _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(process.cwd() + '/package.json', packageJSON, {
                            spaces: 2,
                        })];
                case 8:
                    _a.sent();
                    rimraf_1.default.sync(process.cwd() + '/theme/package.json');
                    spinner.succeed();
                    return [3 /*break*/, 10];
                case 9:
                    error_9 = _a.sent();
                    if (spinner.isSpinning) {
                        spinner.fail();
                    }
                    throw new CommandError_1.default(error_9.message, error_9.code);
                case 10: return [2 /*return*/];
            }
        });
    }); };
    Theme.publishTheme = function () { return __awaiter(void 0, void 0, void 0, function () {
        var spinner, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    spinner = ora_1.default('Publishing theme').start();
                    return [4 /*yield*/, theme_service_1.default.publishTheme()];
                case 1:
                    _a.sent();
                    spinner.succeed();
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    if (spinner.isSpinning) {
                        spinner.fail();
                    }
                    throw new CommandError_1.default(error_10.message, error_10.code);
                case 3: return [2 /*return*/];
            }
        });
    }); };
    Theme.unPublishTheme = function () { return __awaiter(void 0, void 0, void 0, function () {
        var spinner, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    spinner = ora_1.default('Unpublishing theme').start();
                    return [4 /*yield*/, theme_service_1.default.unPublishTheme()];
                case 1:
                    _a.sent();
                    spinner.succeed();
                    return [3 /*break*/, 3];
                case 2:
                    error_11 = _a.sent();
                    if (spinner.isSpinning) {
                        spinner.fail();
                    }
                    throw new CommandError_1.default(error_11.message, error_11.code);
                case 3: return [2 /*return*/];
            }
        });
    }); };
    Theme.pullThemeConfig = function () { return __awaiter(void 0, void 0, void 0, function () {
        var theme, config, information, newConfig, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, theme_service_1.default.getThemeById(null)];
                case 1:
                    theme = (_a.sent()).data;
                    config = theme.config, information = theme.information;
                    newConfig = {};
                    if (config && information) {
                        newConfig.list = config.list;
                        newConfig.current = config.current;
                        newConfig.preset = config.preset;
                        newConfig.information = {
                            features: information.features,
                        };
                    }
                    return [4 /*yield*/, fs_extra_1.default.writeJSON(path_1.default.join(process.cwd(), '/theme/config/settings_data.json'), newConfig, {
                            spaces: 2,
                        })];
                case 2:
                    _a.sent();
                    Logger_1.default.success('Config updated successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_12 = _a.sent();
                    throw new CommandError_1.default(error_12.message, error_12.code);
                case 4: return [2 /*return*/];
            }
        });
    }); };
    Theme.sanitizeThemeName = function (name) {
        return name.replace(/ /g, '_');
    };
    Theme.unSanitizeThemeName = function (name) {
        return name.replace(/_/g, ' ');
    };
    Theme.getSettingsData = function (theme) {
        var newConfig;
        if (theme.config && theme.information) {
            newConfig = {};
            newConfig.list = theme.config.list;
            newConfig.current = theme.config.current;
            newConfig.preset = theme.config.preset;
            newConfig.information = {
                features: theme.information.features,
            };
        }
        return newConfig;
    };
    Theme.clearPreviousBuild = function () {
        rimraf_1.default.sync(Theme.BUILD_FOLDER);
        rimraf_1.default.sync(Theme.SRC_ARCHIVE_FOLDER);
    };
    return Theme;
}());
exports.default = Theme;
