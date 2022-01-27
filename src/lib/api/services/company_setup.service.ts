import ApiClient from "../ApiClient";
import { URLS } from './url'
import { getCommonHeaderOptions } from "./utils";

export default {
    setupCompany: (company_id, request_id, data = {}) => {
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
        return ApiClient.post(URLS.SETUP_COMPANY(company_id), axiosOption);
    },
}