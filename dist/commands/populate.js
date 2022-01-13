"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CompanySetup_1 = __importDefault(require("../lib/CompanySetup"));
function companySetup(program) {
    // List available config
    program
        .command('populate')
        .description('Setup your development account')
        .asyncAction(CompanySetup_1.default.setupDevelopmentCompany);
}
exports.default = companySetup;
