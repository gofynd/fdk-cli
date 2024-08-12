import fs from 'fs';
import path from 'path';

import { findAllFilePathFromCurrentDirWithName } from "../helper/extension_utils";
import * as CONSTANTS from './../helper/constants';
import CommandError, { ErrorCodes } from "./CommandError";

export default class ExtensionContext {
    extensionContextFilePath: string;
    extensionContext: Record<string, string|number>;
    
    constructor(){
        let extensionContextFiles = findAllFilePathFromCurrentDirWithName([CONSTANTS.EXTENSION_CONTEXT_FILE_NAME]);

        if (extensionContextFiles.length > 1) {
            throw new CommandError(
                ErrorCodes.MULTIPLE_EXTENSION_CONTEXT_FILE.message,
                ErrorCodes.MULTIPLE_EXTENSION_CONTEXT_FILE.code
            )
        }
        else if(extensionContextFiles.length == 0){
            fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, '{}');
            extensionContextFiles = [path.resolve(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME)];
        }

        this.extensionContextFilePath = extensionContextFiles[0];

        this.extensionContext = JSON.parse(fs.readFileSync(this.extensionContextFilePath).toString() || '{}');
    }

    get(key: string) {
        return this.extensionContext[key];
    }

    getAll() {
        return this.extensionContext;
    }

    set(key: string, value: any){
        this.extensionContext[key] = value;
        this.updateExtensionContextFile();
    }

    setAll(extensionContext: Record<string, string|number>){
        this.extensionContext = {
            ...this.extensionContext,
            ...extensionContext
        };
        this.updateExtensionContextFile();
    }

    replace(newExtensionContext: Record<string, string|number>){
        this.extensionContext = newExtensionContext;
        this.updateExtensionContextFile();
    }

    delete(key: string){
        delete this.extensionContext[key];
        this.updateExtensionContextFile();
    }

    deleteAll(){
        this.extensionContext = {};
        this.updateExtensionContextFile();
    }

    private updateExtensionContextFile(){
        fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, JSON.stringify(this.extensionContext, null, 4));
    }
}