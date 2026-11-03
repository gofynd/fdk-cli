import { sign } from '@gofynd/fp-signature';

/**
 * WS2: sign the storefront preview POST so the scattershot edge can authenticate it.
 *
 * Produces the `x-fp-date` + `x-fp-signature` headers using the app-scoped preview
 * secret minted by skywarp — NEVER the `@gofynd/fp-signature` default `'1234567'`
 * (that constant is public, so it would prove integrity, not identity). scattershot's
 * `preview_auth.lua` recomputes the same HMAC and compares.
 *
 * The canonical string covers method + path + query + (`host` and `x-fp-*` headers)
 * + a SHA-256 of the body. Pass the EXACT wire body bytes (what axios sends) as
 * `body` so the edge's raw-body hash matches.
 */
export interface PreviewSignInput {
    method: string;
    host: string;
    path: string; // pathname + search (e.g. "/p/x?themeId=1")
    body: string; // exact serialized request body
    headers?: Record<string, string>; // e.g. { 'x-fp-cli': '8.0.12' }
}

export function buildPreviewSignatureHeaders(
    secret: string,
    input: PreviewSignInput,
): { 'x-fp-date': string; 'x-fp-signature': string } {
    if (!secret) {
        throw new Error('preview signature secret is required');
    }
    const headers: Record<string, string> = { ...(input.headers || {}), host: input.host };
    const signingOptions = {
        method: input.method,
        host: input.host,
        path: input.path,
        body: input.body,
        headers,
    };
    const out = sign(signingOptions, { secret });
    return {
        'x-fp-date': out['x-fp-date'],
        'x-fp-signature': out['x-fp-signature'],
    };
}
