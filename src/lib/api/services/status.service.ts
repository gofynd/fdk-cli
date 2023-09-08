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
            allPrmoises.push(axiosInstance.get(endpoint.url, {
                headers: {
                    "x-service-name": endpoint.name
                }
            }));
        });

        const results: PromiseSettledResult<any>[] = await Promise.allSettled(allPrmoises);

        const failedServices = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
            } else {
                const serviceName = result.reason.config.headers["x-service-name"];
                failedServices.push(serviceName.charAt(0).toUpperCase() + serviceName.slice(1));
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
