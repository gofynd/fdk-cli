import path from 'path';
import fs from 'fs-extra';
import NativeModule from 'module';
import vm from 'vm';
import CommandError, { ErrorCodes } from '../lib/CommandError';
import { COMMON_LOG_MESSAGES } from '../lib/Logger';
import configStore, { CONFIG_KEYS } from '../lib/Config';
import { createDirectory } from './file.utils';
import execa from 'execa';
import Debug from '../lib/Debug';

const FDK_PATH = () => path.join(process.cwd(), '.fdk');
const CONTEXT_PATH = () => path.join(FDK_PATH(), 'context.json');
const DEFAULT_CONTEXT = { theme: {active_context: '', contexts: {}}, partners: {} };

export type ThemeType = 'react' | 'vue2' | null ;

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

export const transformRequestOptions = params => {
  let options = '';

  for (const key in params) {
    if (typeof params[key] !== 'object' && params[key]) {
      const encodeVal = encodeURIComponent(params[key]);
      options += `${key}=${encodeVal}&`;
    } else if (Array.isArray(params[key])) {
      params[key].forEach(el => {
        const encodeVal = encodeURIComponent(el);
        options += `${key}=${encodeVal}&`;
      });
    } else if (typeof params[key] === 'object' && params[key]) {
      options += transformRequestOptions(params[key]);
    }
  }
  return options ? options.slice(0, -1) : options;
};

export const decodeBase64 = encodedString => {
  return Buffer.from(encodedString, 'base64').toString('utf8');
};

export const getActiveContext = (): ThemeContextInterface => {
  if (isAThemeDirectory() && hasContext()) {
    const contextData = fs.readJSONSync(CONTEXT_PATH());
    if (!contextData)
      throw new CommandError(
        `${ErrorCodes.INVALID_CONTEXT.message}.\n${COMMON_LOG_MESSAGES.ContextNotSet}`,
        ErrorCodes.INVALID_CONTEXT.code
      );
    return contextData.theme.contexts[contextData.theme.active_context];
  }
  throw new CommandError(
    ErrorCodes.INVALID_THEME_DIRECTORY.message,
    ErrorCodes.INVALID_THEME_DIRECTORY.code
  );
};

export const createContext = async context => {
  try {
    if (!isAThemeDirectory()) createDirectory(FDK_PATH());
    if (!hasContext()) {
      await fs.writeJSON(CONTEXT_PATH(), DEFAULT_CONTEXT);
    }
    let contextsData = await fs.readJSON(CONTEXT_PATH());
    if (contextsData.theme.contexts[context.name])
      throw new CommandError('Context with the same name already exists');
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
  return fs.existsSync(CONTEXT_PATH()) && fs.readJSONSync(CONTEXT_PATH()).theme.contexts;
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
  let res = ''
  pageArr.forEach(p => {
    res+= p[0]?.toUpperCase() + p.substring(1) + ' '
  })
  return res.trim()
}

export const requireFile = path => {
    return require(path);
};

export const evaluateModule = code => {
    var script = new vm.Script(NativeModule.wrap(code), {
        displayErrors: true,
    });
    var compiledWrapper = script.runInNewContext();
    var m = { exports: {} } as any;

    compiledWrapper.call(m.exports, m.exports, requireFile, m);

    var res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
        ? m.exports.default
        : m.exports;
    return res;
};

export const installPythonDependencies = async (targetDir: string = process.cwd()) => {
    return new Promise(async (resolve, reject) => {
        const os_platform = process.platform
        let exec;
        if (os_platform === 'darwin' || os_platform === 'linux') {
            await execa('python3', ['-m', 'venv', 'venv'], {cwd: targetDir});
            exec = execa('./venv/bin/pip', ["install", '-r', 'requirements.txt'], {cwd: targetDir});
            
        } else if (os_platform === 'win32') {
            await execa('python', ['-m', 'venv', 'venv'], {cwd:targetDir});
            exec = execa('venv\\Scripts\\pip', ['install', '-r', 'requirements.txt'], {cwd: targetDir});
        }
        exec.stdout.on('data', (data) => {
            Debug(data);
        })
        exec.stderr.on('data', (data) => {
            Debug(data);
        })
        exec.on('exit', (code) => {
            if(!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        })
    })
}


export const installJavaPackages = async (targetDir: string = process.cwd()) => {
    return new Promise(async (resolve, reject) => {
        await execa('mvn', ['clean'], {cwd: targetDir});
        let exec = execa('mvn', ['package'], {cwd: targetDir});
        exec.stdout.on('data', (data) => {
            Debug(data);
        })
        exec.stderr.on('data', (data) => {
            Debug(data);
        })
        exec.on('exit', (code) => {
            if(!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        })
    })
}


export const installNpmPackages = async (targetDir: string = process.cwd()) => {
    return new Promise(async (resolve, reject) => {
        let exec = execa('npm', ['i'], { cwd: targetDir });
        exec.stdout.on('data', (data) => {
            Debug(data);
        })
        exec.stderr.on('data', (data) => {
            Debug(data);
        })
        exec.on('exit', (code) => {
            if(!code) {
                return resolve(code);
            }
            reject({ message: 'Node Modules Installation Failed' });
        })
    })
}

/**
 * Parses a react-theme bundled file to extract information like component name, content-type, etc.
 *
 * @param fileName File name to be parsed
 * @returns {ParsedFile} Object containing file meta details like extension, contentType, etc
 */
export function parseBundleFilename(fileName: string): ParsedFile {
	const splitVal = fileName.split('.');
	const componentName = splitVal[0];
	const extension = splitVal[splitVal.length -1];

	const contentTypes = {
		js: 'text/javascript',
		css: 'text/css',
	};

	return { 
    contentType: contentTypes[extension] || '', 
    extension, 
    componentName 
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

  const sectionTransformedName = `${sectionRawName.split('-').map((sub) => `${sub[0].toUpperCase()}${sub.slice(1)}`).join('')}Section`;

	return [sectionTransformedName, sectionRawName];
}

/**
 * Helper function to create a debounced version of any function.
 *
 * @param func Function that needs to be debounced
 * @param delay delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

export const isValidDomain = (domain) => {
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}
