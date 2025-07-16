import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  setupCompany: async (company_id, request_id, data = {}) => {
    try {
      const axiosOption = {
        params: {
          request_id,
        },
        data,
        ...getCommonHeaderOptions(),
      };
      const res = await ApiClient.post(
        URLS.SETUP_COMPANY(company_id),
        axiosOption,
      );
      return res;
    } catch (error) {
      throw error;
    }
  },
};
