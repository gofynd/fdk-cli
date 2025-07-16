import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  getOrganizationDetails: async () => {
    try {
      const axiosOption = {

        ...getCommonHeaderOptions(),
      };
      const res = await ApiClient.get(
        URLS.GET_ORGANIZATION_DETAILS(),
        axiosOption,
      );
      return res;
    } catch (error) {
      throw error;
    }
  },
};
