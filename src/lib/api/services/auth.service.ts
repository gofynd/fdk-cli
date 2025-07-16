import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
  loginUserWithEmailAndPassword: async (data) => {
    try {
      const axiosOption = {

        data,
        ...getCommonHeaderOptions(),
      };
      const res = await ApiClient.post(URLS.LOGIN_USER(), axiosOption);
      return res;
    } catch (error) {
      throw error;
    }
  },
  sendMobileOtp: async (data) => {
    try {
      const axiosOption = {

        data,
        ...getCommonHeaderOptions(),
      };
      const res = await ApiClient.post(URLS.SEND_OTP(), axiosOption);
      return res;
    } catch (error) {
      throw error;
    }
  },
  verifyMobileOtp: async (data) => {
    try {
      const axiosOption = {

        data,
        ...getCommonHeaderOptions(),
      };
      const res = await ApiClient.post(URLS.VERIFY_OTP(), axiosOption);
      return res;
    } catch (error) {
      throw error;
    }
  },
};
