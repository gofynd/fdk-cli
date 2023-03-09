import { readFile, writeFile } from './file.utils';
import _ from 'lodash';

export interface Object   {
  [key: string]: any;
}

export const getDefaultContextData = (): Object => {
  return {
    partners: {
      current_context: '',
      contexts: {
        default: {
          name: 'default',
          host: 'api.fynd.com',
        },
      },
    },
  };
};

export const getActiveContext = (throwError = false) => {
  let contextData: Object = {};
  try {
    contextData = JSON.parse(readFile('./.fdk/context.json'));
  } catch (err) {}

  if (
    contextData.partners.current_context &&
    contextData.partners.current_context.length > 0 &&
    contextData.partners.contexts[contextData.partners.current_context]
  ) {
    const currentContext = contextData.partners.current_context;
    const currentContextObj = contextData.partners.contexts[currentContext];
    return currentContextObj;
  } else {
    if (!throwError) {
      return Promise.reject('No active context set');
    } else {
      throw Error('No active context set');
    }
  }
};

export const validateEmpty = (input: any): boolean => {
  return input !== '';
}

export const replaceContent = (content: string, searchPattern: string, replaceStr: string): string => {
  return content.replace(new RegExp(`${searchPattern}`, 'g'), replaceStr)
}

export const writeContextData = (contextName, newContext, targetDir, upsert=false) => {
  targetDir = targetDir || './.fdk/context.json';
  let contextData: Object = {}
  try {
    contextData = JSON.parse(readFile(targetDir) || '{}');
  }
  catch(err) {}
  if (contextData.contexts && contextData.contexts[contextName] && !upsert) {
    return Promise.reject('Context with the same name already exists');
  }
  _.set(contextData, `partners.contexts.${contextName}`, newContext);
  if (Object.keys(contextData.partners.contexts).length === 1) {
    contextData.partners.current_context = contextName;
  }
  writeFile(targetDir, JSON.stringify(contextData, undefined, 2));
};