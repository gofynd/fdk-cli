import ApiClient from "../ApiClient";
import { URLS } from './url'
import { getCommonHeaderOptions } from "./utils";
import { consolidateErrorMessage } from "../../../helper/error.utils";

export default {
    setupCompany: async (company_id, request_id, data = {}) => {
        try {
            const axiosOption = Object.assign(
                {
                    params: {
                        request_id
                    }
                },
                {
                    data: data
                },
                getCommonHeaderOptions()
            );
            const res = await ApiClient.post(URLS.SETUP_COMPANY(company_id), axiosOption);
            return res;   
        } catch(error) {
            consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.response?.data?.message, error?.request?.path)
            throw new Error();
        }
    },
}