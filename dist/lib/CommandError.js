"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
var ERROR_PREFIX = 'Error: ';
var ENOENT_PREFIX = 'ENOENT: ';
exports.ErrorCodes = {
    INVALID_THEME_DIRECTORY: {
        message: 'Current directory is not a theme directory',
        code: 'FDK-0001',
    },
    INVALID_CONTEXT: {
        message: 'Context not set',
        code: 'FDK-0002',
    },
    API_ERROR: {
        message: 'API server error',
        code: 'FDK-0003',
    },
    NOT_KNOWN: {
        message: 'Something went wrong',
        code: 'FDK-0004',
    },
    INVALID_INPUT: {
        message: 'Invalid options passed',
        code: 'FDK-0005',
    },
};
var CommandError = /** @class */ (function (_super) {
    __extends(CommandError, _super);
    function CommandError(message, code) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _this = _super.call(this, message) || this;
        // If e.toString() was called to get `message` we don't want it to look
        // like "Error: Error:".
        if (message && message.startsWith(ERROR_PREFIX)) {
            message = message.substring(ERROR_PREFIX.length);
        }
        if (message && message.startsWith(ENOENT_PREFIX)) {
            message = message.substring(ENOENT_PREFIX.length);
        }
        Object.setPrototypeOf(_this, CommandError.prototype);
        _this.code = code || 'FDK-0004';
        _this.message = message || 'Something went wrong';
        process.exitCode = 1;
        return _this;
    }
    return CommandError;
}(Error));
exports.default = CommandError;
