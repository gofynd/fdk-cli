# API Layer

fdk-cli communicates with the Fynd platform through a structured API layer built on Axios. This document covers the ApiClient architecture, request signing, interceptors, retry logic, and available service endpoints.

---

## Architecture Overview

The API layer is organized as follows:

```
src/lib/api/
    ApiClient.ts            # Axios instances, ApiEngine class, interceptor setup
    helper/
        interceptors.ts     # Request signing, response handling, error handling
    services/
        url.ts              # URL builders for all endpoints
        auth.service.ts     # Authentication API calls
        theme.service.ts    # Theme CRUD operations
        extension.service.ts    # Extension API calls
        configuration.service.ts  # Application/company configuration
        upload.service.ts   # File upload (start/complete flow)
        organization.service.ts   # Organization details
        locales.service.ts  # Locale/i18n operations
        company_setup.service.ts  # Company setup
        utils.ts            # Service utilities
```

---

## ApiClient (ApiEngine)

The `ApiEngine` class wraps Axios and provides a standardized interface for HTTP methods. It is defined in `src/lib/api/ApiClient.ts`.

### Axios Instances

Three Axios instances are created with different configurations:

```typescript
// 1. Default instance -- has all interceptors (signing, curl logging, response handling)
axios.defaults.withCredentials = true;
axios.defaults.timeout = 60000; // 1 minute

// 2. Unintercepted instance -- signing only, no curl logging
let uninterceptedAxiosInstance = axios.create();

// 3. Miscellaneous instance -- no credentials, for external requests
let axiosMisc = axios.create({ withCredentials: false });
```

| Instance | Signing | Curl Logging | Response Interceptor | Error Interceptor | Use Case |
|----------|---------|-------------|---------------------|-------------------|----------|
| Default (`axios`) | Yes | Yes | Yes | Yes | Most API calls |
| Unintercepted | Yes | No | No (basic) | Yes | Calls where curl output would be noisy |
| Misc (`axiosMisc`) | No | No | No | No | External, non-Fynd requests |

### HTTP Methods

```typescript
class ApiEngine {
    head(url: string, opt?: Options): Promise<AxiosResponse>
    get(url: string, opt?: Options, config?: object): Promise<AxiosResponse>
    post(url: string, opt?: Options): Promise<AxiosResponse>
    put(url: string, opt?: Options): Promise<AxiosResponse>
    patch(url: string, opt?: Options): Promise<AxiosResponse>
    del(url: string, opt?: Options): Promise<AxiosResponse>
    getMisc(url: string, opt?: Options): Promise<AxiosResponse>
    postMisc(url: string, opt?: Options): Promise<AxiosResponse>
}
```

The `Options` interface:

```typescript
interface Options {
    headers?: object;
    params?: object;
    data?: object;
    responseType?: ResponseType;
}
```

All methods support query parameters (via `params`), custom headers, request body (via `data`), and custom response types.

### Exported Instances

```typescript
// Primary API client (default interceptors)
export default new ApiEngine(axios);

// For calls that should not log curl in verbose mode
export const uninterceptedApiClient = new ApiEngine(uninterceptedAxiosInstance);

// For backward compatibility scenarios (no error interceptor)
export const withoutErrorResponseInterceptorAxios = axios.create();
```

---

## Request Signing (@gofynd/fp-signature)

All API requests to `/service` and `/ext` paths are signed using Fynd Platform's HMAC signature scheme, implemented via the `@gofynd/fp-signature` package.

### How Signing Works

The signing interceptor is defined in `src/lib/api/helper/interceptors.ts`:

```typescript
function interceptorFn(options) {
    return async (config) => {
        let url = config.url;
        if (config.baseURL && !isAbsoluteURL(config.url)) {
            url = combineURLs(config.baseURL, config.url);
        }
        const { host, pathname, search } = new URL(url);

        if (pathname.includes('/service') || pathname.startsWith('/ext')) {
            const { data, headers, method, params } = config;

            // Set cookie from config store
            const cookie = ConfigStore.get(CONFIG_KEYS.COOKIE);
            config.headers['Cookie'] = cookie || '';

            // Add Bearer token for partner endpoints
            if (pathname.startsWith('/service/partner')) {
                const auth_token = ConfigStore.get(CONFIG_KEYS.AUTH_TOKEN);
                if (auth_token && auth_token.access_token) {
                    config.headers['Authorization'] = 'Bearer ' + auth_token.access_token;
                }
            }

            // Build query string
            let queryParam = '';
            if (params && Object.keys(params).length) {
                queryParam = search?.trim() !== ''
                    ? `&${transformRequestOptions(params)}`
                    : `?${transformRequestOptions(params)}`;
            }

            // Transform request body
            let transformedData;
            if (method != 'get') {
                const transformRequest = getTransformer(config);
                transformedData = transformRequest(data, headers);
            }

            // Sign the request
            const signingOptions = {
                method: method && method.toUpperCase(),
                host: host,
                path: pathname + search + queryParam,
                body: transformedData,
                headers: headersToSign,
            };
            const signature = sign(signingOptions);

            config.headers['x-fp-date'] = signature['x-fp-date'];
            config.headers['x-fp-signature'] = signature['x-fp-signature'];
        }
        return config;
    };
}
```

### Signed Headers

Two headers are added to signed requests:

| Header | Description |
|--------|-------------|
| `x-fp-date` | Timestamp used in signature generation |
| `x-fp-signature` | HMAC signature of the request |

### What Gets Signed

The signature is computed from:
- HTTP method (GET, POST, etc.)
- Host header
- Request path (including query string)
- Request body (for non-GET requests)
- Request headers (excluding Axios default headers like `common`, `get`, `post`, etc.)

### Paths That Trigger Signing

Only requests to these path prefixes are signed:
- `/service/*` -- Fynd platform service endpoints
- `/ext/*` -- Extension endpoints

Requests to `/cdn/*` and other paths are **not** signed.

### Authorization Header

For requests to `/service/partner/*` endpoints, a Bearer token is added from the stored auth token:

```typescript
config.headers['Authorization'] = 'Bearer ' + auth_token.access_token;
```

### Custom CA Certificate in Requests

The signing interceptor also handles custom CA certificates:

```typescript
if (process.env.FDK_EXTRA_CA_CERTS) {
    const ca = fs.readFileSync(process.env.FDK_EXTRA_CA_CERTS);
    const httpsAgent = new https.Agent({ ca });
    config.httpsAgent = httpsAgent;
}
```

---

## Response Interceptors

### Success Interceptor

The response interceptor logs response details in debug mode:

```typescript
export function responseInterceptor() {
    return (response) => {
        Debug(`Response status: ${response.status}`);
        Debug(`Response: ${JSON.stringify(response.data)}`);
        Debug(`Response Headers: ${JSON.stringify(response.headers)}`);
        return response;
    };
}
```

### Error Interceptor

The error interceptor handles various failure scenarios:

```typescript
export function responseErrorInterceptor() {
    return (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Auth failure: clear token, require re-login
            ConfigStore.delete(CONFIG_KEYS.AUTH_TOKEN);
            throw new CommandError(COMMON_LOG_MESSAGES.RequireAuth, error.response.status);
        } else if (error.response) {
            // Server error: extract message from response
            throw new CommandError(`${getErrorMessage(error)}`, ErrorCodes.API_ERROR.code, error.response);
        } else if (error.request) {
            // Network-level errors
            switch (error.code) {
                case 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED':
                    throw new CommandError(ErrorCodes.LARGE_PAYLOAD.message, ErrorCodes.LARGE_PAYLOAD.code);
                case 'SELF_SIGNED_CERT_IN_CHAIN':
                    throw new CommandError(ErrorCodes.VPN_ISSUE.message, ErrorCodes.VPN_ISSUE.code);
                case 'ENOTFOUND':
                    throw new CommandError(error.message, error.code);
            }
            // After max retries, throw network error
            if (error.config?.['axios-retry']?.retryCount === MAX_RETRY) {
                throw new Error('Please retry, possibly some network issue!!');
            }
            throw error;
        } else {
            throw new Error('There was an issue in setting up the request, Please raise issue');
        }
    };
}
```

### Error Message Extraction

The error message is extracted from the response in priority order:

```typescript
function getErrorMessage(error) {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error.response.data) return error.response.data;
    if (error.response.message) return error.response.message;
    if (error.message) return error.message;
    return 'Something went wrong';
}
```

---

## Curl Logging

In debug/verbose mode, every request is logged as a curl command for easy reproduction:

```typescript
axios.interceptors.request.use(function (request) {
    try {
        const curl = new Curl(request);
        Debug('************** CURL **************');
        Debug(`METHOD: ${request?.method.toUpperCase()} | PATH: ${request?.url}`);
        Debug(curl.generateCommand());
        Debug('************** END OF CURL **************');
    } catch (error) {
        Debug(`Error Generating Curl: ${error}`);
    }
    return request;
});
```

This is invaluable for debugging API issues -- you can copy the curl command and run it directly in your terminal.

---

## Retry Logic

All three Axios instances use `axios-retry` with the following configuration:

```typescript
const axiosRetryConfig = {
    retries: MAX_RETRY,  // 5 retries
    retryCondition(error) {
        const shouldRetry = isNetworkErrorCode(error.code);
        return shouldRetry;
    },
    shouldResetTimeout: true,
    onRetry(retryCount, error, requestConfig) {
        Debug(error);
        Logger.warn(`\nRetrying........ (${retryCount}/${MAX_RETRY})`);
    },
    retryDelay(retryCount, error) {
        return 2000;  // Fixed 2-second delay between retries
    },
};

axiosRetry(axios, axiosRetryConfig);
axiosRetry(uninterceptedAxiosInstance, axiosRetryConfig);
axiosRetry(axiosMisc, axiosRetryConfig);
```

### Retry Behavior

| Setting | Value | Description |
|---------|-------|-------------|
| Max retries | 5 (`MAX_RETRY`) | Total retry attempts |
| Retry condition | Network errors only | Only retries on network-level failures (not HTTP errors) |
| Retry delay | 2000ms (fixed) | Constant 2-second delay between retries |
| Timeout reset | Yes | Each retry gets a fresh timeout |

The retry condition uses `isNetworkErrorCode()` to determine if the error is a transient network issue worth retrying. HTTP 4xx/5xx errors are **not** retried -- only connection-level failures.

---

## Service Endpoints

### URL Construction

All API URLs are constructed in `src/lib/api/services/url.ts`. The base URL is derived from the current environment:

```typescript
export const getBaseURL = () => {
    const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    return `https://${currentEnv}`;
};
```

Platform URLs are derived by replacing the subdomain:

```typescript
export const getPlatformUrls = () => {
    return {
        platform: getBaseURL().replace('api', 'platform'),
        partners: getBaseURL().replace('api', 'partners'),
        administrator: getBaseURL().replace('api', 'administrator'),
        marketplace: getBaseURL().replace('api', 'themes'),
    };
};
```

### Service URL Prefixes

| Service | URL Pattern | Description |
|---------|-------------|-------------|
| Theme | `/service/partner/theme/v1.0` | Theme CRUD operations |
| Auth | `/service/panel/authentication/v1.0` | Authentication (login, OTP) |
| Configuration | `/service/partner/partners/v1.0` | Application/company config |
| Assets | `/service/partner/assets/v2.0` | File upload |
| Content/Locales | `/service/partner/content/v1.0` | Locale/i18n operations |
| Payment | `/service/partner/payment/v1.0` | Payment slug verification |
| Organization | `/service/partner/partners/v1.0` | Organization details |

### Key Endpoints

#### Authentication

```typescript
LOGIN_USER: () => urlJoin(AUTH_URL(), '/auth/login/password')
SEND_OTP: () => urlJoin(AUTH_URL(), '/auth/login/mobile/otp/send')
VERIFY_OTP: () => urlJoin(AUTH_URL(), '/auth/login/mobile/otp/verify')
```

#### Theme Operations

```typescript
CREATE_THEME: (company_id, application_id) =>
    urlJoin(THEME_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}`)

THEME_BY_ID: (application_id, company_id, theme_id) =>
    urlJoin(THEME_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/${theme_id}`)

GET_ALL_THEME: (company_id, application_id) =>
    urlJoin(THEME_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/themes`)

GET_APPLIED_THEME: (company_id, application_id) =>
    urlJoin(THEME_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/applied-theme`)

AVAILABLE_PAGE: (application_id, company_id, theme_id, page_value) =>
    urlJoin(THEME_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/${theme_id}/${page_value}`)
```

#### Extension Operations

```typescript
GET_EXTENSION_LIST: (page_no, page_size, launch_type) =>
    urlJoin(MIXMASTER_URL('partner'), `/organization/${orgId}/extension/?page_size=...&page_no=...`)

REGISTER_EXTENSION_PARTNER: () =>
    urlJoin(MIXMASTER_URL('partner'), `organization/${orgId}/extension`)

GET_EXTENSION_DETAILS_PARTNERS: (extension_api_key) =>
    urlJoin(MIXMASTER_URL('partner'), `organization/${orgId}/extension/${extension_api_key}`)

UPDATE_EXTENSION_DETAILS_PARTNERS: (extension_api_key) =>
    urlJoin(MIXMASTER_URL('partner'), `organization/${orgId}/extension/${extension_api_key}`)
```

#### File Upload

```typescript
START_UPLOAD_FILE: (namespaces) =>
    urlJoin(ASSET_URL(), `/organization/${orgId}/namespaces/${namespaces}/upload/start`)

COMPLETE_UPLOAD_FILE: (namespaces) =>
    urlJoin(ASSET_URL(), `/organization/${orgId}/namespaces/${namespaces}/upload/complete`)
```

The file upload is a two-phase process:
1. Call `START_UPLOAD_FILE` to get a pre-signed upload URL.
2. Upload the file to the pre-signed URL.
3. Call `COMPLETE_UPLOAD_FILE` to finalize and get the CDN URL.

#### Extension Sections

```typescript
PUBLISH_SECTIONS: (extension_id, organization_id) =>
    urlJoin(THEME_URL(), `organization/${organization_id}/extension-section/${extension_id}/publish`)

DRAFT_SECTIONS: (extension_id, organization_id) =>
    urlJoin(THEME_URL(), `organization/${organization_id}/extension-section/${extension_id}/draft`)

PREVIEW_SECTIONS: (extension_id, organization_id) =>
    urlJoin(THEME_URL(), `organization/${organization_id}/extension-section/${extension_id}/preview`)
```

#### Locale Operations

```typescript
GET_LOCALES: (application_id, company_id, theme_id) =>
    urlJoin(LOCALES_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/translate-ui-labels?theme_id=${theme_id}&page_size=500`)

CREATE_LOCALE: (application_id, company_id) =>
    urlJoin(LOCALES_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/translate-ui-labels`)

UPDATE_LOCALE: (application_id, company_id, resource_id) =>
    urlJoin(LOCALES_URL(), `organization/${orgId}/company/${company_id}/application/${application_id}/translate-ui-labels/${resource_id}`)
```

#### Configuration

```typescript
GET_APPLICATION_DETAILS: (company_id, application_id) =>
    urlJoin(CONFIGURATION_URL(), `/organization/${orgId}/company/${company_id}/application/${application_id}`)

GET_APPLICATION_LIST: (company_id, page_no, page_size) =>
    urlJoin(MIXMASTER_URL('partner'), `/organization/${orgId}/company/${company_id}/application?page_no=${page_no}&page_size=${page_size}`)

SETUP_COMPANY: (company_id) =>
    urlJoin(MIXMASTER_URL('partner'), `organization/${orgId}/company/${company_id}/setup`)
```

#### Development Accounts

```typescript
GET_DEVELOPMENT_ACCOUNTS: (page_no, page_size) =>
    urlJoin(MIXMASTER_URL('partner'), `/organization/${orgId}/accounts?page_size=...&page_no=...`)

GET_LIVE_ACCOUNTS: (page_no, page_size) =>
    urlJoin(MIXMASTER_URL('partner'), `/organization/${orgId}/accounts/access-request?page_size=...&page_no=...&request_status=accepted`)
```

---

## Request Headers

All requests include a CLI version header:

```typescript
let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-fp-cli': `${packageJSON.version}`,
};
```

The `x-fp-cli` header identifies requests as coming from fdk-cli and includes the version number.

---

## Global Axios Configuration

```typescript
axios.defaults.withCredentials = true;   // Include cookies in cross-origin requests
axios.defaults.timeout = 60000;          // 1-minute timeout for all requests
```

The 1-minute timeout applies to each individual request attempt. With retries, a single logical request can take up to 5 minutes (5 retries x ~62 seconds each) before failing.
