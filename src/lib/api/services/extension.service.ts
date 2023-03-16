import { consolidateErrorMessage } from "../../../helper/error.utils"
import { URLS } from "./url";
import { getCommonHeaderOptions } from "./utils";
import ApiClient from '../ApiClient'

type RegisterExtensionPaylaod = {
  name: string,
  extension_type: "private" | "public",
  base_url: string
}

type UpdateLaunchURLPayload = {
  base_url: string
}

export default {
  registerExtension: async (partner_access_token: string, data: RegisterExtensionPaylaod) => {
    try {
      let headers = getCommonHeaderOptions().headers;
      headers['x-partner-token'] = partner_access_token;

      let axiosOptions = Object.assign(
        {},
        {
          data: data
        },
        {
          headers: headers
        }
      )
      const response = await ApiClient.post(URLS.REGISTER_EXTENSION(), axiosOptions);
      return response.data;

    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },


  getExtensionData: async (extension_api_key: string, extension_api_secret: string) => {
    try {
      const authorizationToken = Buffer.from(`${extension_api_key}:${extension_api_secret}`, 'utf-8').toString("base64");
      
      let headers = getCommonHeaderOptions().headers;
      headers['Authorization'] = `Bearer ${authorizationToken}`;
    
      let response = await ApiClient.get(URLS.GET_EXTENSION_DETAILS(extension_api_key), {headers: headers});
      return response.data;

    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },


  getExtensionDataUsingToken: async (extension_api_key: string, partner_access_token: string) => {
    try {
      let headers = getCommonHeaderOptions().headers;
      headers['x-partner-token'] = partner_access_token;

      let response = await ApiClient.get(URLS.GET_EXTENSION_DETAILS(extension_api_key), {headers: headers});
      return response.data;
      
    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },


  updateLaunchURL: async (extension_api_key: string, partner_access_token: string, data: UpdateLaunchURLPayload) => {
    try {
      let headers = getCommonHeaderOptions().headers;
      headers['x-partner-token'] = partner_access_token;

      let axiosOptions = Object.assign(
        {},
        {
          data: data
        },
        {
          headers: headers
        }
      )

      let response = await ApiClient.patch(URLS.UPDATE_EXTENSION_DETAILS(extension_api_key), axiosOptions);
      return response.data;

    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }

  },


  getOrganizationData: async (partner_access_token: string) => {
    try {
      let headers = getCommonHeaderOptions().headers;
      headers['x-partner-token'] = partner_access_token;
      
      let response = await ApiClient.get(URLS.GET_ORGANIZATION_DATA(partner_access_token), {headers: headers});
      return response.data;

    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },


  // Preview URL
  getDevelopmentAccounts: async (organization_id: string, page_no: number, page_size: number) => {
    try {
      let axiosOptions = Object.assign(
        {},
        getCommonHeaderOptions()
      )
      let response = await ApiClient.get(URLS.GET_DEVELOPMENT_ACCOUNTS(organization_id, page_no, page_size), axiosOptions);
      return response.data;

    } catch(error) {
      consolidateErrorMessage(error?.response?.status, error?.response?.statusText, error?.request?.method, error?.response?.data?.message, error?.request?.path);
    }
  },
}