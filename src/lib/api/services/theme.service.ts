import { getActiveContext } from '../../../helper/utils';
import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCommonHeaderOptions } from './utils';

export default {
    createTheme: async (data) => {
        try {
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions(),
            );
            const res = await ApiClient.post(
                URLS.CREATE_THEME(data.company_id, data.application_id),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    getThemeById: async (data) => {
        try {
            const activeContext = data ? data : getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.THEME_BY_ID(
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
    updateTheme: async (data) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions(),
            );
            const res = await ApiClient.put(
                URLS.THEME_BY_ID(
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
    deleteThemeById: async (data) => {
        try {
            const activeContext = data ? data : getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.del(
                URLS.THEME_BY_ID(
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

    getAvailablePage: async (pageValue) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.AVAILABLE_PAGE(
                    activeContext.application_id,
                    activeContext.company_id,
                    activeContext.theme_id,
                    pageValue,
                ),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    getDefaultPageDetails: async (pageValue) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.PAGE_DEFAULT_VALUES(
                    activeContext.application_id,
                    activeContext.company_id,
                    pageValue,
                ),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    getAllAvailablePage: async () => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            return ApiClient.get(
                URLS.AVAILABLE_PAGE(
                    activeContext.application_id,
                    activeContext.company_id,
                    activeContext.theme_id,
                ),
                axiosOption,
            );
        } catch (error) {
            throw error;
        }
    },
    createAvailabePage: async (data) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions(),
            );
            const res = await ApiClient.post(
                URLS.AVAILABLE_PAGE(
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
    deleteAvailablePage: async (pageValue) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            return ApiClient.del(
                URLS.AVAILABLE_PAGE(
                    activeContext.application_id,
                    activeContext.company_id,
                    activeContext.theme_id,
                    pageValue,
                ),
                axiosOption,
            );
        } catch (error) {
            throw error;
        }
    },
    updateAvailablePage: async (data) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign(
                {},
                {
                    data: data,
                },
                getCommonHeaderOptions(),
            );
            const res = await ApiClient.put(
                URLS.AVAILABLE_PAGE(
                    activeContext.application_id,
                    activeContext.company_id,
                    activeContext.theme_id,
                    data.value,
                ),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    updateAllAvailablePages: async (data) => {
        try {
            const activeContext = getActiveContext();
            const axiosOption = Object.assign(
                {},
                { data },
                getCommonHeaderOptions(),
            );
            return ApiClient.put(
                URLS.AVAILABLE_PAGE(
                    activeContext.application_id,
                    activeContext.company_id,
                    activeContext.theme_id,
                ),
                axiosOption,
            );
        } catch (error) {
            throw error;
        }
    },
    getAllThemes: async (data) => {
        try {
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.GET_ALL_THEME(data.company_id, data.application_id, data.accountType),
                axiosOption,
            );
            return res;
        } catch (error) {
            throw error;
        }
    },
    getDefaultTheme: async (data) => {
        try {
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.GET_DEFAULT_THEME(data.company_id, data.application_id, data.mode),
                axiosOption,
            );
            return res?.data;
        } catch (err) {
            throw err;
        }
    },
    getAppliedTheme: async (data) => {
        try {
            const axiosOption = Object.assign({}, getCommonHeaderOptions());
            const res = await ApiClient.get(
                URLS.GET_APPLIED_THEME(data.company_id, data.application_id),
                axiosOption,
            );
            return res?.data;
        } catch (err) {
            throw err;
        }
    },
};
