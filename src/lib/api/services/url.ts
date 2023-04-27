import configStore, { CONFIG_KEYS } from '../../Config';
import urlJoin from 'url-join';
import { getBaseURL } from './utils';
import { SERVICE_URL } from '../../../helper/constants';


const apiVersion = configStore.get(CONFIG_KEYS.API_VERSION) || '1.0';

const THEME_URL = () => getBaseURL() + `${SERVICE_URL.theme}/v` + apiVersion;
const AUTH_URL = () => getBaseURL() + `${SERVICE_URL.authentication}/v` + apiVersion;
const CONFIGURATION_URL = () => getBaseURL() + `${SERVICE_URL.configuration}/v` + apiVersion;
const ASSET_URL = () => getBaseURL() + `${SERVICE_URL.assets}/v` + apiVersion;
const MIXMASTER_URL = (serverType: string) =>
    getBaseURL() + `${SERVICE_URL.partnersDynamic(serverType)}/v` + apiVersion;

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
    OAUTH_TOKEN: (company_id: number) => {
        return urlJoin(AUTH_URL(), `/company/${company_id}/oauth/staff/token`);
    },

    //CONFIGURATION
    GET_APPLICATION_DETAILS: (application_id: string, company_id: number) => {
        return urlJoin(CONFIGURATION_URL(), `/company/${company_id}/application/${application_id}`);
    },

    //ASSETS
    START_UPLOAD_FILE: (application_id: string, company_id: number, namespaces: string) => {
        return urlJoin(
            ASSET_URL(),
            `/company/${company_id}/application/${application_id}/namespaces/${namespaces}/upload/start`
        );
    },
    COMPLETE_UPLOAD_FILE: (application_id: string, company_id: number, namespaces: string) => {
        return urlJoin(
            ASSET_URL(),
            `/company/${company_id}/application/${application_id}/namespaces/${namespaces}/upload/complete`
        );
    },

    //THEME
    CREATE_THEME: (application_id: string, company_id: number) => {
        return urlJoin(THEME_URL(), `/company/${company_id}/application/${application_id}`);
    },
    THEME_BY_ID: (application_id: string, company_id: number, theme_id: string) => {
        return urlJoin(
            THEME_URL(),
            `/company/${company_id}/application/${application_id}/${theme_id}`
        );
    },
    PUBLISH_THEME: (application_id: string, company_id: number, theme_id: string) => {
        return urlJoin(
            THEME_URL(),
            `/company/${company_id}/application/${application_id}/${theme_id}/publish`
        );
    },
    UNPUBLISH_THEME: (application_id: string, company_id: number, theme_id: string) => {
        return urlJoin(
            THEME_URL(),
            `/company/${company_id}/application/${application_id}/${theme_id}/unpublish`
        );
    },
    GET_APPLICATION_THEME_LIBRARY: (
        application_id: string,
        company_id: number,
        theme_id: string
    ) => {
        return urlJoin(
            THEME_URL(),
            `/company/${company_id}/application/${application_id}/${theme_id}/library`
        );
    },

    // AVAILABLE_PAGE
    AVAILABLE_PAGE: (
        application_id: string,
        company_id: number,
        theme_id: string,
        page_value: string = 'page'
    ) => {
        return urlJoin(
            THEME_URL(),
            `/company/${company_id}/application/${application_id}/${theme_id}/${page_value}`
        );
    },

    SETUP_COMPANY: (company_id: number) => {
        return urlJoin(MIXMASTER_URL('platform'), `/company/${company_id}/setup`);
    },


    // Extension
    REGISTER_EXTENSION: (): string => {
        return urlJoin(MIXMASTER_URL('panel'), `/extensions/`)
    },
    GET_EXTENSION_DETAILS: (extension_api_key: string): string => {
        return urlJoin(MIXMASTER_URL('panel'), `/extensions/details/${extension_api_key}`);
    },
    UPDATE_EXTENSION_DETAILS: (extension_api_key: string): string => {
        return urlJoin(MIXMASTER_URL('panel'), `/extensions/${extension_api_key}`);
    },
    GET_ORGANIZATION_DATA: (partner_access_token: string): string => {
        return urlJoin(MIXMASTER_URL('panel'), `/accesstoken/${partner_access_token}/organization`);
    },


    // Preview URL
    GET_DEVELOPMENT_ACCOUNTS: (organization_id: string, page_no: number, page_size: number): string => {
        return urlJoin(MIXMASTER_URL('partner'), `/organization/${organization_id}/accounts?page_size=${page_size}&page_no=${page_no}`);
    }
};