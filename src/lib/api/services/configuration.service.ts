import { getActiveContext } from '../../../helper/utils';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  getApplicationDetails: async (data?) => {
    try {
      const activeContext = data ?  data : getActiveContext();
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.get(
        URLS.GET_APPLICATION_DETAILS(activeContext.company_id, activeContext.application_id),
        axiosOption
      );
      return res;
    } catch (error) {
      throw error;
    }
  },
  getApplications: async (company_id: number,page_no: number, page_size: number) => {
    try {
      const axiosOption = Object.assign({}, getCommonHeaderOptions());
      const res = await ApiClient.get(
        URLS.GET_APPLICATION_LIST(company_id, page_no, page_size),
        axiosOption
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
};
