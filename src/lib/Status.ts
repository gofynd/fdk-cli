import chalk from 'chalk';
import { SERVICE_URL } from '../helper/constants';
import StatusService from './api/services/status.service';
import { getBaseURL } from './api/services/utils';

export default class Status {
    public static checkServiceStatus = async options => {
        await Status.checkService(options);
    };

    private static checkService = async options => {
        const { name } = options;
        let services = Object.keys(SERVICE_URL);

        if (name) {
            if (!services.includes(name)) {
                console.log(chalk.red('Please enter valid service'));
            }
            services = [name];
        }
        const serviceAPIs = services
            .map(service => {
                if (typeof SERVICE_URL[service] === 'string')
                    return {
                        url: `${getBaseURL()}${SERVICE_URL[service]}/_healthz`,
                        name: service,
                    };

                return null;
            })
            // Remove null values
            .filter(obj => !!obj);

        StatusService.checkServices(serviceAPIs);
    };
}
