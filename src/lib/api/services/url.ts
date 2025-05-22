import configStore, { CONFIG_KEYS } from '../../Config';
import urlJoin from 'url-join';
import Logger from '../../Logger';

const apiVersion = configStore.get(CONFIG_KEYS.API_VERSION) || '1.0';
const getOrganizationId = () => configStore.get(CONFIG_KEYS.ORGANIZATION);

export const getBaseURL = () => {
    const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
    return `https://${currentEnv}`;
};

export const getPlatformUrls = () => {
    return {
        platform: getBaseURL().replace('api', 'platform'),
        partners: getBaseURL().replace('api', 'partners'),
        administrator: getBaseURL().replace('api', 'administrator'),
        marketplace: getBaseURL().replace('api', 'themes'),
    };
};

const BLITZKRIEG_PANEL_URL = () => getBaseURL() + '/service/panel/theme';
const THEME_URL = () => getBaseURL() + '/service/partner/theme/v' + apiVersion;
const AUTH_URL = () =>
    getBaseURL() + '/service/panel/authentication/v' + apiVersion;
const CONFIGURATION_URL = () =>
    getBaseURL() + '/service/partner/partners/v' + apiVersion;
const MIXMASTER_URL = (serverType: string) =>
    getBaseURL() + `/service/${serverType}/partners/v` + apiVersion;
const ASSET_URL = () => getBaseURL() + '/service/partner/assets/v2.0';

const LOCALES_URL = () => getBaseURL() + '/service/partner/content/v' + apiVersion;

export const URLS = {
    // AUTHENTICATION
    LOGIN_USER: () => {
        return urlJoin(AUTH_URL(), '/auth/login/password');
    },
    SEND_OTP: () => {
        return urlJoin(AUTH_URL(), '/auth/login/mobile/otp/send');
    },
    VERIFY_OTP: () => {
        return urlJoin(AUTH_URL(), '/auth/login/mobile/otp/verify');
    },

    //CONFIGURATION
    GET_APPLICATION_DETAILS: (company_id: number, application_id: string) => {
        return urlJoin(
            CONFIGURATION_URL(),
            `/organization/${getOrganizationId()}/company/${company_id}/application/${application_id}`,
        );
    },
    GET_APPLICATION_LIST: (company_id: number) => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `/organization/${getOrganizationId()}/company/${company_id}/application`,
        );
    },

    //ASSETS
    START_UPLOAD_FILE: (namespaces: string) => {
        return urlJoin(
            ASSET_URL(),
            `/organization/${getOrganizationId()}/namespaces/${namespaces}/upload/start`,
        );
    },
    COMPLETE_UPLOAD_FILE: (namespaces: string) => {
        return urlJoin(
            ASSET_URL(),
            `/organization/${getOrganizationId()}/namespaces/${namespaces}/upload/complete`,
        );
    },

    //THEME
    CREATE_THEME: (company_id: number, application_id: string) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}`,
        );
    },
    THEME_BY_ID: (
        application_id: string,
        company_id: number,
        theme_id: string,
    ) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/${theme_id}`,
        );
    },
    GET_ALL_THEME: (company_id: number, application_id: string) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/themes`,
        );
    },

    GET_DEFAULT_THEME: (company_id: number, application_id: string) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/default_theme`,
        );
    },

    GET_APPLIED_THEME: (company_id: number, application_id: string) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/applied-theme`,
        );
    },

    // AVAILABLE_PAGE
    AVAILABLE_PAGE: (
        application_id: string,
        company_id: number,
        theme_id: string,
        page_value: string = 'page',
    ) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/${theme_id}/${page_value}`,
        );
    },

    PAGE_DEFAULT_VALUES: (
        application_id: string,
        company_id: number,
        page_value: string,
    ) => {
        return urlJoin(
            THEME_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/page/${page_value}/system`,
        );
    },

    SETUP_COMPANY: (company_id: number) => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `organization/${getOrganizationId()}/company/${company_id}/setup`,
        );
    },

    // Extension
    GET_EXTENSION_LIST: (page_no: number, page_size: number): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `/organization/${getOrganizationId()}/extension/?page_size=${page_size}&page_no=${page_no}`,
        );
    },

    REGISTER_EXTENSION_PARTNER: (): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `organization/${getOrganizationId()}/extension`,
        );
    },

    GET_EXTENSION_DETAILS_PARTNERS: (extension_api_key: string): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `organization/${getOrganizationId()}/extension/${extension_api_key}`,
        );
    },

    UPDATE_EXTENSION_DETAILS: (extension_api_key: string): string => {
        return urlJoin(
            MIXMASTER_URL('panel'),
            `/extensions/${extension_api_key}`,
        );
    },

    UPDATE_EXTENSION_DETAILS_PARTNERS: (extension_api_key: string): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `organization/${getOrganizationId()}/extension/${extension_api_key}`,
        );
    },

    // Extension Section
    PUBLISH_SECTIONS: (extension_id: string, organization_id) => {
        return urlJoin(
            THEME_URL(),
            `organization/${organization_id}/extension-section/${extension_id}/publish`,
        );
    },
    DRAFT_SECTIONS: (extension_id: string, organization_id) => {
        return urlJoin(
            THEME_URL(),
            `organization/${organization_id}/extension-section/${extension_id}/draft`,
        );
    },
   PREVIEW_SECTIONS: (extension_id: string, organization_id) => {
        return urlJoin(
            THEME_URL(),
            `organization/${organization_id}/extension-section/${extension_id}/preview`,
        );
    },
   DELETE_SECTIONS: (extension_id: string, organization_id) => {
        return urlJoin(
            THEME_URL(),
            `organization/${organization_id}/extension-section/${extension_id}/preview`,
        );
    },
    GET_EXTENSION_SECTIONS: (extension_id: string, organization_id: string, binding_name: string, accountType: string, framework: string) => {
        return urlJoin(
            THEME_URL(),
            `organization/${organization_id}/extension-section/${extension_id}/${binding_name}?accountType=${accountType}&type=${framework}`,
        );
    },
    // Organization
    GET_ORGANIZATION_DETAILS: () : string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `organization/${getOrganizationId()}`
        )
    },

    // Preview URL
    GET_DEVELOPMENT_ACCOUNTS: (page_no: number, page_size: number): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `/organization/${getOrganizationId()}/accounts?page_size=${page_size}&page_no=${page_no}`,
        );
    },
    GET_LIVE_ACCOUNTS: (page_no: number, page_size: number): string => {
        return urlJoin(
            MIXMASTER_URL('partner'),
            `/organization/${getOrganizationId()}/accounts/access-request?page_size=${page_size}&page_no=${page_no}&request_status=accepted`,
        );
    },

    //Locales
    GET_LOCALES: (
        application_id: string,
        company_id: number,
        theme_id: string,
    ) => {
        return urlJoin(
            LOCALES_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/translate-ui-labels?theme_id=${theme_id}&page_size=500`,
        );
    },
    CREATE_LOCALE: (
        application_id: string,
        company_id: number
    ) => {
        return urlJoin(
            LOCALES_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/translate-ui-labels`,
        );
    },
    UPDATE_LOCALE: (
        application_id: string,
        company_id: number,
        resource_id: string
    ) => {
        return urlJoin(
            LOCALES_URL(),
            `organization/${getOrganizationId()}/company/${company_id}/application/${application_id}/translate-ui-labels/${resource_id}`,
        );
    }
};
