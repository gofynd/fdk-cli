import urljoin from 'url-join';
import Spinner from '../helper/spinner';
import CompanySetupService from './api/services/company_setup.service';
import { getCompanyId } from '../helper/extension_utils';
import { successBox } from '../helper/formatter';
import CommandError, { ErrorCodes } from './CommandError';
import Logger from './Logger';
import { getPlatformUrls } from './api/services/url';

export default class CompanySetup {
  constructor() {}

  public static async setupDevelopmentCompany() {
    const spinner = new Spinner();
    try {
      let request_id; let
        next_step;
      const prompt_message = 'Creating Brand';
      const companyID = await getCompanyId("Select the development company you'd like to populate data: ?");
      await CompanySetup.setupComponent(
        companyID,
        request_id,
        prompt_message,
        spinner,
      );
      spinner.stop();
    } catch (error) {
      if (error.code != ErrorCodes.API_ERROR) {
        spinner.fail(
          'Failed during populating development company, please retry!',
        );
        throw new Error('Failed during populating development company');
      }
      throw new CommandError(error.message, error.code);
    }
  }

  private static async setupComponent(
    company_id,
    request_id,
    prompt_message,
    spinner,
  ) {
    const { data, headers } = await CompanySetupService.setupCompany(
      company_id,
      request_id,
    );
    spinner.start(data.message);
    if (data.next_step) {
      setTimeout(async () => await CompanySetup.setupComponent(
        company_id,
        data.request_id,
        data.prompt_message,
        spinner,
      ), data.cli_wait_time || 100);
    } else {
      spinner.succeed(
        'Development company is now populated with sample data.',
      );
      const createDevelopmentCompanyFormURL = company_id
        ? urljoin(
          getPlatformUrls().platform,
          'company',
          `${company_id}`,
          'products',
          'list',
        )
        : getPlatformUrls().platform;
      Logger.info(
        successBox({
          text: `Check sample products: ${createDevelopmentCompanyFormURL}`,
        }),
      );
    }
    return data;
  }
}
