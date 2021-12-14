import CommandError from './CommandError';
import Logger from './Logger';
import CompanySetupService from './api/services/company_setup.service';
import inquirer from 'inquirer';
import ConfigStore, { CONFIG_KEYS } from './Config';
import ora from 'ora';

export default class CompanySetup {
    constructor() {}
    public static async setupDevelopmentCompany() {
        try {
            const questions = [
                {
                    type: 'text',
                    name: 'company_id',
                    message: 'Enter Company ID: ',
                },
            ];
            let request_id, next_step;
            let prompt_message = 'Creating Brand';
            await inquirer.prompt(questions).then(async answers => {
                if (!answers.company_id) throw new CommandError('Invalid Company ID');
                ConfigStore.set(CONFIG_KEYS.COMPANY_ID, answers.company_id);
                await CompanySetup.setupComponent(answers.company_id, request_id, prompt_message)
            });
        } catch (error) {
            throw new CommandError(error.message, error.code);
        }
    }
    private static async setupComponent(company_id, request_id, prompt_message, init = true){
        let spinner
        if(init){
            spinner = ora(prompt_message).start();
        }
        const { data, headers } = await CompanySetupService.setupCompany(company_id, request_id);
        spinner.succeed(data.message);
        if(data.next_step){
            spinner = ora(prompt_message).start();
            setTimeout(async() => {
                return await CompanySetup.setupComponent(company_id, data.request_id, data.prompt_message, false)
            }, data.cli_wait_time || 100);
        }
        return data
    }
}
