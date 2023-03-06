import ApiClient from "../ApiClient";
import { URLS } from './url'
import { getCommonHeaderOptions } from "./utils";
import { consolidateErrorMessage } from "../../../helper/error.utils";
import CommandError from "../../CommandError";

export default {
    loginUserWithEmailAndPassword: async (data) => {
        try {
            const axiosOption = Object.assign(
                {},
                {
                    data: data
                },
                getCommonHeaderOptions()
            );
            console.log("headers",getCommonHeaderOptions())
            const res = await ApiClient.post(URLS.LOGIN_USER(), axiosOption);
            return res;
        } catch(error) {
            consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
            throw new CommandError(error?.response?.data?.message, error?.code);
        }
    },
    sendMobileOtp: async (data) => {
        try {
            const axiosOption = Object.assign(
                {},
                {
                    data: data
                },
                getCommonHeaderOptions()
            );
            const res = await ApiClient.post(URLS.SEND_OTP(), axiosOption);
            return res;
        } catch(error) {
            consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
            throw new CommandError(error?.response?.data?.message, error?.code);
        }
    },
    verifyMobileOtp: async (data) => {
        try {
            const axiosOption = Object.assign(
                {},
                {
                    data: data
                },
                getCommonHeaderOptions()
            );
            const res = await ApiClient.post(URLS.VERIFY_OTP(), axiosOption);
            return res;
        } catch(error) {
            consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
            throw new CommandError(error?.response?.data?.message, error?.code);
        }
    },
    getOauthToken: async (company_id) => {
        try {
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.OAUTH_TOKEN(company_id),
                axiosOption
            );
            return res;
        } catch(error) {
            consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
            throw new CommandError(error?.response?.data?.message, error?.code);
        }
    }
}