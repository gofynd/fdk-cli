import { getActiveContext } from '../../../helper/utils';
import { consolidateErrorMessage } from '../../../helper/error.utils';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  createTheme: async data => {
    try {
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      const res = await ApiClient.post(URLS.CREATE_THEME(data.application_id, data.company_id), axiosOption);
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  getThemeById: async data => {
    try {
      const activeContext = data ? data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.get(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  updateTheme: async data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      const res = await ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  deleteThemeById: async data => {
    try {
      const activeContext = data ? data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.del(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },

  getAvailablePage: async pageValue => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.get(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id,
          pageValue
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  createAvailabePage: async data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      const res = await ApiClient.post(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  updateAvailablePage: async data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      const res = await ApiClient.put(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id,
          data.value
        ),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  publishTheme: async () => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        getCommonHeaderOptions()
      );
      const res = await ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ) + '/publish',
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
  unPublishTheme: async () => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        getCommonHeaderOptions()
      );
      const res = await ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ) + '/unpublish',
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
};
