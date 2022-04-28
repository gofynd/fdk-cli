import ApiClient from "../ApiClient";
import { URLS } from './url'
import { getCommonHeaderOptions } from "./utils";

export default {
    loginUserWithEmailAndPassword: (data) => {
        const axiosOption = Object.assign(
            {},
            {
                data: data
            },
            getCommonHeaderOptions()
        );
        // console.log("in emailwithpass2222")
        return ApiClient.post(URLS.LOGIN_USER(), axiosOption);
        
    },
    sendMobileOtp: (data) => {
        const axiosOption = Object.assign(
            {},
            {
                data: data
            },
            getCommonHeaderOptions()
        );
        return ApiClient.post(URLS.SEND_OTP(), axiosOption);
    },
    verifyMobileOtp: (data) => {
        const axiosOption = Object.assign(
            {},
            {
                data: data
            },
            getCommonHeaderOptions()
        );
        return ApiClient.post(URLS.VERIFY_OTP(), axiosOption);
    },
    getOauthToken: (company_id) => {
        const axiosOption = Object.assign({}, getCommonHeaderOptions());
        return ApiClient.get(
            URLS.OAUTH_TOKEN(company_id),
            axiosOption
        );
    }
}