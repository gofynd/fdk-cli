import path from 'path';
import {  readFile } from '../../../helper/file.utils';

let filepath = path.join(process.cwd(), 'package.json');
export const getCommonHeaderOptions = () => {
    let packageContent: any = readFile(filepath);
    let content = JSON.parse(packageContent) || {};
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-fp-cli': `${content.version}`,
        }
    };
};