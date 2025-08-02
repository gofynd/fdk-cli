import fs from 'fs';
import path from 'path';

import * as CONSTANTS from '../helper/constants';
import Logger from './Logger';

export default class ExtensionContext {
  extensionContextFilePath: string;

  extensionContext: Record<string, string|number>;

  constructor() {
    this.extensionContextFilePath = path.join(process.cwd(), CONSTANTS.EXTENSION_CONTEXT_FILE_NAME);

    const fileExists = fs.existsSync(this.extensionContextFilePath);

    if (!fileExists) {
      // If the file does not exist, create it
      fs.writeFileSync(this.extensionContextFilePath, '{}');
    }

    try {
      this.extensionContext = JSON.parse(fs.readFileSync(this.extensionContextFilePath, 'utf-8').toString());
    } catch (error) {
      if (error instanceof SyntaxError) {
        Logger.info('Invalid extension context file found, resetting extension context');
        this.replace({});
      } else {
        throw error;
      }
    }
  }

  get(key: string) {
    return this.extensionContext[key];
  }

  getAll() {
    return this.extensionContext;
  }

  set(key: string, value: any) {
    this.extensionContext[key] = value;
    this.updateExtensionContextFile();
  }

  setAll(extensionContext: Record<string, string|number>) {
    this.extensionContext = {
      ...this.extensionContext,
      ...extensionContext,
    };
    this.updateExtensionContextFile();
  }

  replace(newExtensionContext: Record<string, string|number>) {
    this.extensionContext = newExtensionContext;
    this.updateExtensionContextFile();
  }

  delete(key: string) {
    delete this.extensionContext[key];
    this.updateExtensionContextFile();
  }

  deleteAll() {
    this.extensionContext = {};
    this.updateExtensionContextFile();
  }

  private updateExtensionContextFile() {
    fs.writeFileSync(CONSTANTS.EXTENSION_CONTEXT_FILE_NAME, JSON.stringify(this.extensionContext, null, 4));
  }
}
