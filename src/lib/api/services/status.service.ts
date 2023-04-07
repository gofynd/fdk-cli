import axios, { AxiosResponse } from 'axios';
import chalk from 'chalk';
import ora from 'ora';

export const axiosInstance = axios.create({});

type ENDPOINTS = {
    url: string;
    name: string;
};

export default {
    checkServices: async (serviceEndpoints: ENDPOINTS[]) => {
        let spinner = ora('Checking services...\n').start();

        if (serviceEndpoints.length === 0) {
            spinner.fail('No service found.');
            return;
        }

        const allPrmoises = [];
        serviceEndpoints.forEach(endpoint => {
            allPrmoises.push(axiosInstance.get(endpoint.url, { data: endpoint.name }));
        });

        const results: PromiseSettledResult<any>[] = await Promise.allSettled(allPrmoises);

        const failedServices = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                // console.log(chalk.green('\u2713 ' + result.value.config.data));
            } else {
                const serviceName = result.reason.config.data;
                failedServices.push(serviceName.charAt(0).toUpperCase() + serviceName.slice(1));
                // console.log('\u26D4 ', result.reason.config.data);
            }
        });
        if (failedServices.length > 0) {
            spinner.fail(failedServices.join(', ') + ' are not working.');
        } else {
            let pretext = 'All services are ';
            if (serviceEndpoints.length === 1) {
                pretext =
                    serviceEndpoints[0].name.charAt(0).toUpperCase() +
                    serviceEndpoints[0].name.slice(1) +
                    ' service is ';
            }
            spinner.succeed(pretext + 'working fine.');
        }
    },
};
