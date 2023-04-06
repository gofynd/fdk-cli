import { parseFileName } from "../helper/utils";

describe('Utils Suite', () => {
    describe('parseFileName', () => {
        it('Should parse JS filename correctly', () => {
            const testFileName = 'dummy.bundle.assetHash.js';
            const parsed = parseFileName(testFileName);
            expect(parsed.extension).toBe<string>('js');
            expect(parsed.componentName).toBe<string>('dummy');
            expect(parsed.contentType).toBe<string>('text/javascript');
        });
        it('Should parse JS filename correctly', () => {
            const testFileName = 'dummy.bundle.assetHash.css';
            const parsed = parseFileName(testFileName);
            expect(parsed.extension).toBe<string>('css');
            expect(parsed.componentName).toBe<string>('dummy');
            expect(parsed.contentType).toBe<string>('text/css');
        });
        it('Should return empty strings if filename is empty string', () => {
            const testFileName = '';
            const parsed = parseFileName(testFileName);
            console.log({parsed})
            expect(parsed.extension).toBe<string>('');
            expect(parsed.componentName).toBe<string>('');
            expect(parsed.contentType).toBe<string>('');
        });
    });
});