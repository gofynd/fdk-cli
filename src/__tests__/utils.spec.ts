import { parseBundleFilename, transformSectionFileName } from "../helper/utils";

describe('Utils Suite', () => {
    describe('parseBundleFilename', () => {
        it('Should parse JS filename correctly', () => {
            const testFileName = 'dummy.bundle.assetHash.js';
            const parsed = parseBundleFilename(testFileName);
            expect(parsed.extension).toBe<string>('js');
            expect(parsed.componentName).toBe<string>('dummy');
            expect(parsed.contentType).toBe<string>('text/javascript');
        });
        it('Should parse JS filename correctly', () => {
            const testFileName = 'dummy.bundle.assetHash.css';
            const parsed = parseBundleFilename(testFileName);
            expect(parsed.extension).toBe<string>('css');
            expect(parsed.componentName).toBe<string>('dummy');
            expect(parsed.contentType).toBe<string>('text/css');
        });
        it('Should return empty strings if filename is empty string', () => {
            const testFileName = '';
            const parsed = parseBundleFilename(testFileName);
            console.log({parsed})
            expect(parsed.extension).toBe<string>('');
            expect(parsed.componentName).toBe<string>('');
            expect(parsed.contentType).toBe<string>('');
        });
    });
    describe('transformSectionFileName', () => {
        it('Should parse section filename correctly 1', () => {
            const testFileName = 'gallery.section.js';
            const [ pascalCaseName, sectionRawName] = transformSectionFileName(testFileName);
            expect(sectionRawName).toBe<string>('gallery');
            expect(pascalCaseName).toBe<string>('GallerySection');
        });
        it('Should parse section filename correctly 2', () => {
            const testFileName = 'image-gallery.section.js';
            const [ pascalCaseName, sectionRawName] = transformSectionFileName(testFileName);
            expect(sectionRawName).toBe<string>('image-gallery');
            expect(pascalCaseName).toBe<string>('ImageGallerySection');
        });
        it('Should return empty strings if filename is empty string', () => {
            const testFileName = '';
            const [ pascalCaseName, sectionRawName] = transformSectionFileName(testFileName);
            expect(sectionRawName).toBe<string>('');
            expect(pascalCaseName).toBe<string>('');
        });
    });
});