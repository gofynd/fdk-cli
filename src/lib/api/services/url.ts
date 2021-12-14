import configStore, { CONFIG_KEYS } from '../../Config';
import urlJoin from 'url-join';
import { AVAILABLE_ENVS } from '../../Env';

const currentEnv = configStore.get(CONFIG_KEYS.CURRENT_ENV_VALUE) || 'x0';
const apiVersion = configStore.get(CONFIG_KEYS.API_VERSION) || '1.0';
export const BASE_URL = `https://${AVAILABLE_ENVS[currentEnv]}`;

const THEME_URL = BASE_URL + '/service/platform/theme/v' + apiVersion;
const AUTH_URL = BASE_URL + '/service/panel/authentication/v' + apiVersion;
const CONFIGURATION_URL = BASE_URL + '/service/platform/configuration/v' + apiVersion;
const ASSET_URL = BASE_URL + '/service/platform/assets/v' + apiVersion;
const MIXMASETER_PLTM_URL = BASE_URL + '/service/platform/partners/v' + apiVersion;

export const URLS = {
  // AUTHENTICATION
  LOGIN_USER: () => {
    return urlJoin(AUTH_URL, '/auth/login/password');
  },
  SEND_OTP: () => {
    return urlJoin(AUTH_URL, '/auth/login/mobile/otp/send');
  },
  VERIFY_OTP: () => {
    return urlJoin(AUTH_URL, '/auth/login/mobile/otp/verify');
  },
  OAUTH_TOKEN: (company_id: number) => {
    return urlJoin(AUTH_URL, `/company/${company_id}/oauth/staff/token`);
  },

  //CONFIGURATION
  GET_APPLICATION_DETAILS: (application_id: string, company_id: number) => {
    return urlJoin(CONFIGURATION_URL, `/company/${company_id}/application/${application_id}`);
  },

  //ASSETS
  START_UPLOAD_FILE: (application_id: string, company_id: number, namespaces: string) => {
    return urlJoin(
      ASSET_URL,
      `/company/${company_id}/application/${application_id}/namespaces/${namespaces}/upload/start`
    );
  },
  COMPLETE_UPLOAD_FILE: (application_id: string, company_id: number, namespaces: string) => {
    return urlJoin(
      ASSET_URL,
      `/company/${company_id}/application/${application_id}/namespaces/${namespaces}/upload/complete`
    );
  },

  //THEME
  CREATE_THEME: (application_id: string, company_id: number) => {
    return urlJoin(THEME_URL, `/company/${company_id}/application/${application_id}`);
  },
  THEME_BY_ID: (application_id: string, company_id: number, theme_id: string) => {
    return urlJoin(THEME_URL, `/company/${company_id}/application/${application_id}/${theme_id}`);
  },
  PUBLISH_THEME: (application_id: string, company_id: number, theme_id: string) => {
    return urlJoin(
      THEME_URL,
      `/company/${company_id}/application/${application_id}/${theme_id}/publish`
    );
  },
  UNPUBLISH_THEME: (application_id: string, company_id: number, theme_id: string) => {
    return urlJoin(
      THEME_URL,
      `/company/${company_id}/application/${application_id}/${theme_id}/unpublish`
    );
  },
  GET_APPLICATION_THEME_LIBRARY: (application_id: string, company_id: number, theme_id: string) => {
    return urlJoin(
      THEME_URL,
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
      THEME_URL,
      `/company/${company_id}/application/${application_id}/${theme_id}/${page_value}`
    );
  },

  SETUP_COMPANY: (company_id: number) => {
    return urlJoin(
      MIXMASETER_PLTM_URL,
      `/company/${company_id}/setup`
    );
  },
};
