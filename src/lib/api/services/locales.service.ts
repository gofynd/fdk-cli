import { getActiveContext } from '../../../helper/utils';
 import ApiClient from '../ApiClient';
 import { URLS } from './url';
 import { getCommonHeaderOptions } from './utils';
 
 
 export default {
     getLocalesByThemeId: async (data) => {
         try {
             const activeContext = data ? data : getActiveContext();
             const axiosOption = Object.assign({}, getCommonHeaderOptions());
             const res = await ApiClient.get(
                 URLS.GET_LOCALES(
                     activeContext.application_id,
                     activeContext.company_id,
                     activeContext.theme_id,
                 ),
                 axiosOption,
             );
             return res;
         } catch (error) {
             throw error;
         }
     },
     createLocale: async (data, requestBody) => {
         try {
             const activeContext = data ? data : getActiveContext();
             const axiosOption = Object.assign({}, 
                 {
                     data: requestBody
                 },
                 getCommonHeaderOptions());
             const res = await ApiClient.post(
                 URLS.CREATE_LOCALE(
                     activeContext.application_id,
                     activeContext.company_id
                 ),
                 axiosOption,
             );
             return res;
         } catch (error) {
             throw error;
         }
     },
     updateLocale: async (data, resource_id, requestBody) => {
         try {
             const activeContext = data ? data : getActiveContext();
             const axiosOption = Object.assign({}, 
                 {
                     data: requestBody,
                 },
                 getCommonHeaderOptions());
             const res = await ApiClient.put(
                 URLS.UPDATE_LOCALE(
                     activeContext.application_id,
                     activeContext.company_id,
                     resource_id
                 ),
                 axiosOption,
             );
             return res;
         } catch (error) {
             throw error;
         }
     }
 }