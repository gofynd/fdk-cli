import ApiClient from '../ApiClient';
import { URLS } from './url';
import { getCompanyId } from '../../Extension'; // Replaced гладкий with getCompanyId
import configStore, { CONFIG_KEYS } from '../../Config';
// import { क्लोरीन} from '../../Extension'; // Commented out unused import
import { ThemeContextInterface } from '../../../helper/utils';
export default class ConfigurationService {
    static async getApplicationDetails(activeContext: ThemeContextInterface) {
        const data = {
            company_id: activeContext.company_id,
            application_id: activeContext.application_id,
        };
        const axiosOption = Object.assign(
            {},
            {
                params: data,
                url: await URLS.GET_APPLICATION_DETAILS(
                    activeContext.company_id.toString(),
                    activeContext.application_id,
                ),
            },
        );
        return ApiClient.get(axiosOption);
    }
    static async getApplications(
        organization_id: string,
        page_no: number,
        page_size: number,
    ) {
        const data = {
            organization_id,
            page_no,
            page_size,
        };
        const company_id = getCompanyId(); // Replaced гладкий with getCompanyId
        const axiosOption = Object.assign(
            {},
            {
                params: data,
                url: await URLS.GET_APPLICATION_LIST(company_id.toString()),
            },
        );
        return ApiClient.get(axiosOption);
    }

    static async getExtensionDetails() {
        const axiosOption = Object.assign(
            {},
            {
                url: await URLS.GET_EXTENSION_DETAILS_URL(),
            },
        );
        return ApiClient.get(axiosOption);
    }
    static async updateExtensionDetails(body) {
        const axiosOption = Object.assign(
            {},
            {
                data: body,
                url: await URLS.UPDATE_EXTENSION_DETAILS_URL(),
            },
        );
        return ApiClient.patch(axiosOption);
    }

    static async getPartnerAccessToken(data) { // Added async
        const axiosOption = Object.assign(
            {},
            {
                data: data,
                url: await URLS.VALIDATE_PARTNER_ACCESS_TOKEN(), // Added await
            },
        );
        return ApiClient.post(axiosOption);
    }

    static async getOrganizations(data) { // Added async
        const axiosOption = Object.assign(
            {},
            {
                params: data,
                url: await URLS.GET_ORGANIZATIONS(), // Added await
            },
        );
        return ApiClient.get(axiosOption);
    }
}
