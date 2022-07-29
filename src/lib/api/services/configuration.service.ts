import { getActiveContext } from '../../../helper/utils';
import { consolidateErrorMessage } from '../../../helper/error.utils';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  getApplicationDetails: async (data?) => {
    try {
      const activeContext = data ?  data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.get(
        URLS.GET_APPLICATION_DETAILS(activeContext.application_id, activeContext.company_id),
        axiosOption
      );
      return res;
    } catch (error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
};
