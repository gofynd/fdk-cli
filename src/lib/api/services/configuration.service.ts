import { getActiveContext } from '../../../helper/utils';
import CommandError from '../../CommandError';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  getApplications: async (data?, query?) => {
    try {
      const activeContext = data ?  data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions(), {query: query});
      return ApiClient.get(
        URLS.GET_APPLICATIONS(activeContext.company_id),
        axiosOption
      );
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
  getApplicationDetails: async (data?) => {
    try {
      const activeContext = data ?  data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      return ApiClient.get(
        URLS.GET_APPLICATION_DETAILS(activeContext.application_id, activeContext.company_id),
        axiosOption
      );
      // return SDK.configuration
    } catch (error) {
      throw new CommandError(error.message, error.code);
    }
  },
};
