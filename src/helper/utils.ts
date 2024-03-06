import path from 'path';
import fs from 'fs-extra';
import NativeModule from 'module';
import vm from 'vm';
import CommandError, { ErrorCodes } from '../lib/CommandError';
import { COMMON_LOG_MESSAGES } from '../lib/Logger';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import execa from 'execa';
import Debug from '../lib/Debug';
import * as babel from '@babel/core';
import * as fsNode from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as escodegen from 'escodegen';
import { createDirectory } from './file.utils';
import { DEFAULT_CONTEXT } from '../lib/ThemeContext';

const FDK_PATH = () => path.join(process.cwd(), '.fdk');
const CONTEXT_PATH = () => path.join(FDK_PATH(), 'context.json');

export type ThemeType = 'react' | 'vue2' | null;

export type ParsedFile = {
    contentType: 'text/javascript' | 'text/css';
    extension: string;
    componentName: string;
};
export interface ThemeContextInterface {
    name?: string;
    application_id?: string;
    application_token?: string;
    theme_id?: string;
    company_id?: number;
    domain?: string;
    env?: string;
    theme_type: ThemeType;
}

export const transformRequestOptions = (params) => {
    let options = '';

    for (const key in params) {
        if (typeof params[key] !== 'object' && params[key]) {
            const encodeVal = encodeURIComponent(params[key]);
            options += `${key}=${encodeVal}&`;
        } else if (Array.isArray(params[key])) {
            params[key].forEach((el) => {
                const encodeVal = encodeURIComponent(el);
                options += `${key}=${encodeVal}&`;
            });
        } else if (typeof params[key] === 'object' && params[key]) {
            options += transformRequestOptions(params[key]);
        }
    }
    return options ? options.slice(0, -1) : options;
};

export const decodeBase64 = (encodedString) => {
    return Buffer.from(encodedString, 'base64').toString('utf8');
};

export const getActiveContext = (): ThemeContextInterface => {
    if (isAThemeDirectory() && hasContext()) {
        const contextData = fs.readJSONSync(CONTEXT_PATH());
        if (!contextData)
            throw new CommandError(
                `${ErrorCodes.INVALID_CONTEXT.message}.\n${COMMON_LOG_MESSAGES.ContextNotSet}`,
                ErrorCodes.INVALID_CONTEXT.code,
            );
        return contextData.theme.contexts[contextData.theme.active_context];
    }
    throw new CommandError(
        ErrorCodes.INVALID_THEME_DIRECTORY.message,
        ErrorCodes.INVALID_THEME_DIRECTORY.code,
    );
};

export const createContext = async (context) => {
    try {
        // this is needed for theme creation command, as we are cloning theme template and directly passing context.
        if (!isAThemeDirectory()) createDirectory(FDK_PATH());
        if (!hasContext()) {
            await fs.writeJSON(CONTEXT_PATH(), DEFAULT_CONTEXT);
        }
        let contextsData = await fs.readJSON(CONTEXT_PATH());
        context.env = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
        contextsData.theme.active_context = context.name;
        contextsData.theme.contexts[context.name] = context;
        await fs.writeJSON(CONTEXT_PATH(), contextsData, {
            spaces: 2,
        });
    } catch (error) {
        throw new CommandError(error.message, error.code);
    }
};

export const isAThemeDirectory = () => {
    return fs.existsSync(FDK_PATH());
};
export const hasContext = () => {
    return (
        fs.existsSync(CONTEXT_PATH()) &&
        fs.readJSONSync(CONTEXT_PATH()).theme.contexts
    );
};

export const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

export function sortString(str) {
    var arr = str.split('');
    arr.sort();
    return arr.join('');
}

export const pageNameModifier = (page) => {
    let pageArr = page.split('-');
    let res = '';
    pageArr.forEach((p) => {
        res += p[0]?.toUpperCase() + p.substring(1) + ' ';
    });
    return res.trim();
};

export const requireFile = (path) => {
    return require(path);
};

export const evaluateModule = (code) => {
    var script = new vm.Script(NativeModule.wrap(code), {
        displayErrors: true,
    } as vm.ScriptOptions);
    var compiledWrapper = script.runInNewContext();
    var m = { exports: {} } as any;

    compiledWrapper.call(m.exports, m.exports, requireFile, m);

    var res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
        ? m.exports.default
        : m.exports;
    return res;
};

export const installPythonDependencies = async (
    targetDir: string = process.cwd(),
) => {
    return new Promise(async (resolve, reject) => {
        const os_platform = process.platform;
        let exec;
        if (os_platform === 'darwin' || os_platform === 'linux') {
            await execa('python3', ['-m', 'venv', 'venv'], { cwd: targetDir });
            exec = execa(
                './venv/bin/pip',
                ['install', '-r', 'requirements.txt'],
                { cwd: targetDir },
            );
        } else if (os_platform === 'win32') {
            await execa('python', ['-m', 'venv', 'venv'], { cwd: targetDir });
            exec = execa(
                'venv\\Scripts\\pip',
                ['install', '-r', 'requirements.txt'],
                { cwd: targetDir },
            );
        }
        exec.stdout.on('data', (data) => {
            Debug(data);
        });
        exec.stderr.on('data', (data) => {
            Debug(data);
        });
        exec.on('exit', (code) => {
            if (!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        });
    });
};

export const installJavaPackages = async (
    targetDir: string = process.cwd(),
) => {
    return new Promise(async (resolve, reject) => {
        await execa('mvn', ['clean'], { cwd: targetDir });
        let exec = execa('mvn', ['package', '-DskipTests'], { cwd: targetDir });
        exec.stdout.on('data', (data) => {
            Debug(data);
        });
        exec.stderr.on('data', (data) => {
            Debug(data);
        });
        exec.on('exit', (code) => {
            if (!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        });
    });
};

export const installNpmPackages = async (targetDir: string = process.cwd()) => {
    return new Promise(async (resolve, reject) => {
        let exec = execa('npm', ['i'], { cwd: targetDir });
        exec.stdout.on('data', (data) => {
            Debug(data);
        });
        exec.stderr.on('data', (data) => {
            Debug(data);
        });
        exec.on('exit', (code) => {
            if (!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        });
    });
};

/**
 * Parses a react-theme bundled file to extract information like component name, content-type, etc.
 *
 * @param fileName File name to be parsed
 * @returns {ParsedFile} Object containing file meta details like extension, contentType, etc
 */
export function parseBundleFilename(fileName: string): ParsedFile {
    const splitVal = fileName.split('.');
    const componentName = splitVal[0];
    const extension = splitVal[splitVal.length - 1];

    const contentTypes = {
        js: 'text/javascript',
        css: 'text/css',
    };

    return {
        contentType: contentTypes[extension] || '',
        extension,
        componentName,
    };
}

/**
 * Transform a section name into PascalCase form and adds Section as suffix.
 *
 * @param fileName Section file name to transform
 * @returns [sectionTransformedName, sectionRawName] - Array of section names in raw camelCase and in PascalCase
 */
export function transformSectionFileName(fileName: string): [string, string] {
    if (!fileName) {
        return ['', ''];
    }
    const splitVal = fileName.split('.');
    const sectionRawName = splitVal[0];

    const sectionTransformedName = `${sectionRawName
        .split('-')
        .map((sub) => `${sub[0].toUpperCase()}${sub.slice(1)}`)
        .join('')}Section`;

    return [sectionTransformedName, sectionRawName];
}

/**
 * Helper function to create a debounced version of any function.
 *
 * @param func Function that needs to be debounced
 * @param delay delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (this: any, ...args: Parameters<T>) {
        const context = this;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

export const isNetworkErrorCode = (code) =>
    ['ECONNABORTED', 'EPIPE', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(
        code,
    );

export const isValidDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
};

export function transformJSXToJS(jsxCode: any) {
    const options = {
        presets: ['@babel/preset-react'],
    };

    try {
        const result = babel.transformSync(jsxCode, options);
        return result?.code;
    } catch (error) {
        console.error('Error transforming JSX to JS:', error);
        return null;
    }
}

export function findExportedVariable(
    filePath: string,
    variableName: string,
): any {
    // Read the JavaScript file content
    const fileContent = fsNode.readFileSync(filePath, 'utf8');
    const parsedContents = transformJSXToJS(fileContent) || '';

    // Parse the JavaScript code into an Abstract Syntax Tree (AST)
    const ast = acorn.parse(parsedContents, {
        ecmaVersion: 'latest',
        sourceType: 'module',
    });

    let exportedVariableNode: any = null;

    // Traverse the AST to find the exported settings object
    walk.simple(ast, {
        ExportNamedDeclaration(node: any) {
            if (
                node.declaration &&
                node.declaration.type === 'VariableDeclaration'
            ) {
                const declarator = node.declaration.declarations.find(
                    (decl: any) => decl.id.name === variableName,
                );

                if (declarator && declarator.init) {
                    exportedVariableNode = declarator.init;
                }
            }
        },
    });

    if (exportedVariableNode) {
        // Use escodegen to generate the code corresponding to the settings object
        const code = escodegen.generate(exportedVariableNode, {
            format: {
                json: true,
            },
        });
        return vm.runInNewContext(code);
    } else {
        return null;
    }
}
