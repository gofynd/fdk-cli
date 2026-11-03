import ApiClient from '../ApiClient';
import { getBaseURL } from './url';
import { getCommonHeaderOptions } from './utils';
import Logger from '../../Logger';

// WS2: fetch the short-lived, app-scoped preview secret that skywarp mints. Used to
// HMAC-sign the storefront preview POST so the scattershot edge can authenticate it.
//
// FAIL-OPEN BY DESIGN: if the secret can't be fetched (skywarp unreachable, not yet
// deployed in this region, partner not authorised, old platform), this returns null
// and the caller sends the preview request UNSIGNED — so publishing this CLI never
// breaks `fdk theme serve` while the edge is still in off/shadow mode.

const PREVIEW_SECRET_PATH = (applicationId: string) =>
    `${getBaseURL()}/service/partner/authentication/v1.0/application/${applicationId}/preview-secret`;

let cached: { applicationId: string; secret: string; expiresAt: number } | null = null;

export default {
    getPreviewSecret: async (applicationId: string): Promise<string | null> => {
        try {
            if (!applicationId) return null;
            const now = Date.now();
            if (cached && cached.applicationId === applicationId && cached.expiresAt > now + 5000) {
                return cached.secret;
            }
            const axiosOption: any = Object.assign({}, getCommonHeaderOptions());
            axiosOption.data = {};
            const res = await ApiClient.post(PREVIEW_SECRET_PATH(applicationId), axiosOption);
            const data = (res && (res as any).data) || res;
            const secret = data && data.secret;
            if (!secret) return null;
            const expiresAt = data.expires_at
                ? new Date(data.expires_at).getTime()
                : now + 5 * 60 * 1000;
            cached = { applicationId, secret, expiresAt };
            return secret;
        } catch (error) {
            Logger.warn(
                `Could not fetch theme preview secret; sending preview request unsigned. (${error && error.message ? error.message : error})`,
            );
            return null;
        }
    },

    // test seam
    _clearCache: () => { cached = null; },
};
