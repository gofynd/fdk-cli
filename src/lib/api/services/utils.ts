import path from 'path';
import {  readFile } from '../../../helper/file.utils';

export const getCommonHeaderOptions = () => {
    let filepath = path.join(process.cwd(), 'package.json');
    let packageContent: any = readFile(filepath);
    let content = JSON.parse(packageContent) || {};
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-fp-cli': `${content.version}`,
        }
    };
};