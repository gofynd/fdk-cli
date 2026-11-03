import { buildPreviewSignatureHeaders } from '../helper/preview-signature';

// Ground-truth vector (also committed to scattershot at
// spec/fixtures/preview_sig_vector.json). This test proves the CLI signer and the
// scattershot verifier agree on the exact same signature — the sign↔verify loop.
const VECTOR = {
    secret: 'preview_secret_TEST_32charslong_abcdef',
    host: 'brand.example.com',
    path: '/p/featured-collection?themeId=66aa11bb&__csr=true',
    body: '{"themeURLs":{"themeBundle":{"js":"https://cdn.fynd.com/x/theme.umd.js","css":"https://cdn.fynd.com/x/theme.css"}},"cliMeta":{"port":5502,"domain":"http://127.0.0.1:5502"}}',
    xFpCli: '8.0.12',
    xFpDate: '20261031T071500Z',
    expectedSig: 'v1.1:334224aaea09f4123f141b86e2cb9a20c747106001fd6d9f7909396a839a853b',
};

describe('buildPreviewSignatureHeaders', () => {
    it('reproduces the committed scattershot verification vector exactly', () => {
        const out = buildPreviewSignatureHeaders(VECTOR.secret, {
            method: 'POST',
            host: VECTOR.host,
            path: VECTOR.path,
            body: VECTOR.body,
            // pin x-fp-date so the signature is deterministic (lib uses it if present)
            headers: { 'x-fp-cli': VECTOR.xFpCli, 'x-fp-date': VECTOR.xFpDate },
        });
        expect(out['x-fp-date']).toBe(VECTOR.xFpDate);
        expect(out['x-fp-signature']).toBe(VECTOR.expectedSig);
    });

    it('does not use the public default secret (different secret ⇒ different sig)', () => {
        const out = buildPreviewSignatureHeaders('a-different-secret', {
            method: 'POST',
            host: VECTOR.host,
            path: VECTOR.path,
            body: VECTOR.body,
            headers: { 'x-fp-cli': VECTOR.xFpCli, 'x-fp-date': VECTOR.xFpDate },
        });
        expect(out['x-fp-signature']).not.toBe(VECTOR.expectedSig);
    });

    it('a one-byte body change changes the signature', () => {
        const out = buildPreviewSignatureHeaders(VECTOR.secret, {
            method: 'POST',
            host: VECTOR.host,
            path: VECTOR.path,
            body: VECTOR.body.replace('cdn.fynd.com', 'evil.example.com'),
            headers: { 'x-fp-cli': VECTOR.xFpCli, 'x-fp-date': VECTOR.xFpDate },
        });
        expect(out['x-fp-signature']).not.toBe(VECTOR.expectedSig);
    });

    it('throws without a secret (never silently falls back to the default)', () => {
        expect(() => buildPreviewSignatureHeaders('', {
            method: 'POST', host: VECTOR.host, path: VECTOR.path, body: VECTOR.body,
        })).toThrow();
    });
});
