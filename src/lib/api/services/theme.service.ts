import { getActiveContext } from '../../../helper/utils';
import CommandError from '../../CommandError';
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
      return ApiClient.post(URLS.CREATE_THEME(data.application_id, data.company_id), axiosOption);
    } catch (error) {
      console.log(error, 'ewrr');
      throw new CommandError(error.message, error.code);
    }
  },
  getThemeById: data => {
    try {
      const activeContext = data ? data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      return ApiClient.get(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  updateTheme: data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      return ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  deleteThemeById: data => {
    try {
      const activeContext = data ? data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      return ApiClient.del(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },

  getAvailablePage: pageValue => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      return ApiClient.get(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id,
          pageValue
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  getAllAvailablePage: () => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      return ApiClient.get(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  createAvailabePage: data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      return ApiClient.post(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  deleteAvailablePage: pageValue => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        getCommonHeaderOptions()
      );
      return ApiClient.del(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id,
          pageValue
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  updateAvailablePage: data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        {
          data: data,
        },
        getCommonHeaderOptions()
      );
      return ApiClient.put(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id,
          data.value
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  updateAllAvailablePages: data => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        { data },
        getCommonHeaderOptions()
      );
      return ApiClient.put(
        URLS.AVAILABLE_PAGE(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  publishTheme: () => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        getCommonHeaderOptions()
      );
      return ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ) + '/publish',
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  unPublishTheme: () => {
    try {
      const activeContext = getActiveContext();
      const axiosOption = Object.assign(
        {},
        getCommonHeaderOptions()
      );
      return ApiClient.put(
        URLS.THEME_BY_ID(
          activeContext.application_id,
          activeContext.company_id,
          activeContext.theme_id
        ) + '/unpublish',
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
};
