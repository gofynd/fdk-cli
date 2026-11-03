// Ground-truth signature vector from the real @gofynd/fp-signature lib.
// Mirrors how fdk-cli will sign the preview POST (interceptors.ts pattern) but
// with a real per-app secret instead of the public '1234567' default.
const { sign } = require('@gofynd/fp-signature');

const SECRET = 'preview_secret_TEST_32charslong_abcdef';
const host = 'brand.example.com';
const path = '/p/featured-collection?themeId=66aa11bb&__csr=true';
const body = JSON.stringify({
  themeURLs: { themeBundle: { js: 'https://cdn.fynd.com/x/theme.umd.js', css: 'https://cdn.fynd.com/x/theme.css' } },
  cliMeta: { port: 5502, domain: 'http://127.0.0.1:5502' },
});

// headersToSign: what the interceptor passes after stripping axios defaults.
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'x-fp-cli': '8.0.12',
  host,
};

const signingOptions = { method: 'POST', host, path, body, headers };
const out = sign(signingOptions, { secret: SECRET });

const vector = {
  secret: SECRET,
  request: { method: 'POST', host, path, body, 'x-fp-cli': '8.0.12' },
  signed: out, // { 'x-fp-signature': 'v1.1:...', 'x-fp-date': '...' }
};
console.log(JSON.stringify(vector, null, 2));
