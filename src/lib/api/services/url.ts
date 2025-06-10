import configStore, { CONFIG_KEYS } from '../../Config';
// import urlJoin from 'url-join';
import Logger from '../../Logger';

const apiVersion = configStore.get(CONFIG_KEYS.API_VERSION) || '1.0';
const urlJoin = (...args: string[]) => import('url-join').then(m => m.default(...args));
const getOrganizationId = () => configStore.get(CONFIG_KEYS.ORGANIZATION);

export const getBaseURL = () => {
    return configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE);
};

export const getPlatformUrls = () => {
    const host = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE)
    return {
        platformDomain: host && host.replace('api', 'platform')
    }
}
export const URLS = {
    LOGIN_USER_ON_TOKEN: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/panel/authentication/v1.0/session/token`));
    },
    SEND_OTP: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/panel/authentication/v1.0/otp/send`));
    },
    VERIFY_OTP: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/panel/authentication/v1.0/otp/verify`));
    },
    GET_USER_DETAILS: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/panel/partners/v1.0/user`));
    },
    GET_ORGANIZATION_DETAILS: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/organization/${configStore.get(CONFIG_KEYS.ORGANIZATION)}`));
    },
    GET_DEVELOPMENT_ACCOUNTS: async (page_no?: number, page_size?: number) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/organizations/${configStore.get(CONFIG_KEYS.ORGANIZATION)}/accounts/development?page_no=${page_no || 1}&page_size=${page_size || 10000}`));
    },
    GET_LIVE_ACCOUNTS: async (page_no?: number, page_size?: number) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/organizations/${configStore.get(CONFIG_KEYS.ORGANIZATION)}/accounts/live?page_no=${page_no || 1}&page_size=${page_size || 10000}`));
    },
    GET_APPLICATION_LIST: async (company_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application`));
    },
    GET_APPLICATION_DETAILS: async (company_id: string, application_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}`));
    },
    GET_ALL_THEME: async (company_id: string, application_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme`));
    },
    CREATE_THEME: async (company_id: string, application_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme`));
    },
    THEME_BY_ID: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}`));
    },
    ADD_THEME_TO_APPLICATION: async (application_id: string, company_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme`));
    },
    DELETE_THEME: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}`));
    },
    SYNC_THEME: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sync`));
    },
    PULL_THEME: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/pull`));
    },
    PULL_THEME_ADMIN_CONFIG: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/1.0/company/${company_id}/application/${application_id}/theme/${theme_id}/config/admin`));
    },
    GET_THEME_DEVELOPMENT_STATUS_URL: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sync_progress`));
    },
    START_UPLOAD_URL: async (application_id: string, company_id: string, theme_id: string, file_name: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/content/start_upload/${file_name}`));
    },
    COMPLETE_UPLOAD_URL: async (application_id: string, company_id: string, theme_id: string, file_name: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/content/complete_upload/${file_name}`));
    },
    GET_LOCALES: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/locales`));
    },
    ADD_LOCALES: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/locales`));
    },
    UPDATE_LOCALE: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/locales`));
    },
    CREATE_LOCALE: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/locales`));
    },
    CREATE_THEME_PREVIEW_URL: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/preview`));
    },
    UPDATE_THEME_PREVIEW_URL: async (application_id: string, company_id: string, theme_id: string, preview_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/preview/${preview_id}`));
    },
    POLL_THEME_PREVIEW_URL: async (application_id: string, company_id: string, theme_id: string, preview_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/preview/${preview_id}/poll`));
    },
    GET_THEME_PREVIEW_URL: async (application_id: string, company_id: string, theme_id: string, preview_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/preview/${preview_id}`));
    },
    GET_THEME_PREVIEW_URLS: async (application_id: string, company_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/preview`));
    },
    AVAILABLE_PAGE: async (application_id: string, company_id: string, theme_id: string, type: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/available_pages?type=${type}`));
    },
    GET_SECTIONS_URL: async (company_id: string, application_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sections`));
    },
    CREATE_SECTION_URL: async (company_id: string, application_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sections`));
    },
    UPDATE_SECTION_URL: async (company_id: string, application_id: string, theme_id: string, section_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sections/${section_id}`));
    },
    DELETE_SECTION_URL: async (company_id: string, application_id: string, theme_id: string, section_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/sections/${section_id}`));
    },
    GET_THEME_ASSETS_URL: async (company_id: string, application_id: string, theme_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/${apiVersion}/company/${company_id}/application/${application_id}/theme/${theme_id}/assets`));
    },
    GET_EXTENSION_DETAILS_URL: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `service/partner/partners/v1.0/extensions/details`));
    },
    UPDATE_EXTENSION_DETAILS_URL: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `service/partner/partners/v1.0/extensions/details`));
    },
    GET_EXTENSION_LIST: async (page_no?: number, page_size?: number) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/extensions?page_no=${page_no || 1}&page_size=${page_size || 10000}`));
    },
    GET_EXTENSION_DETAILS_PARTNERS: async (extension_api_key: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/extensions/${extension_api_key}`));
    },
    UPDATE_EXTENSION_DETAILS_PARTNERS: async (extension_api_key: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/extensions/${extension_api_key}`));
    },
    GET_LAUNCH_URL: async (company_id: string) => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/company/${company_id}/extension/launch-url`));
    },
    GET_PARTNERS_URL: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), `/service/partner/partners/v1.0/partners/listing`));
    },
    VALIDATE_PARTNER_ACCESS_TOKEN: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), '/service/partner/partners/v1.0/partners/token/validate'));
    },
    GET_ORGANIZATIONS: async () => {
        return (await urlJoin(configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE), '/service/partner/partners/v1.0/organizations'));
    },
};
