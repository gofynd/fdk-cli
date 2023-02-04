const yargs = require('yargs');
const inquirer = require('inquirer');
const axios = require('axios');
const execa = require('execa');
const fs = require('fs');

const { NODE_VUE } = require('../partners/utils/extension-constant');
let extensionUtils = require('../partners/utils/extension-utils');


describe('Setup Extension Command', () => {
    afterEach(async () => {
        await execa('rm', ['-rf', 'Test_Extension']);
    });
    
    beforeEach(async () => {
        jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            extension_api_key: 'api_key',
            extension_api_secret: 'api_secret',
            project_type: NODE_VUE,
        });
        
        jest.spyOn(axios, 'get').mockResolvedValue({
            data: { base_url: 'https://abc.com', name: 'Test_Extension' },
        });
        
        jest.spyOn(extensionUtils, 'installDependencies').mockResolvedValue();
    });
    
    it('should clone template files', async () => {
        const envFileData = `EXTENSION_API_KEY="api_key"\nEXTENSION_API_SECRET="api_secret"\nEXTENSION_BASE_URL="https://abc.com"\nEXTENSION_CLUSTER_URL="https://api.fynd.com"`;
        await yargs().wrap(null).commandDir('../partners/cmds').parseAsync('extension setup');
        expect(fs.existsSync('./Test_Extension')).toEqual(true);
        expect(fs.existsSync('./Test_Extension/.fdk')).toEqual(true)
        expect(fs.readFileSync('./Test_Extension/.env',  { encoding: 'utf-8' })).toBe(envFileData);
        const packageJson = fs.readFileSync("./Test_Extension/package.json", { encoding: 'utf-8' });
        expect(JSON.parse(packageJson).name).toBe("Test_Extension")
    });
    
    it('should throw directory already exists error', async () => {
        try{
            jest.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error("Directory already exists");
            })
            await yargs().wrap(null).commandDir('../partners/cmds').parseAsync('extension setup --target-dir ./bin');
        }catch(err){
            expect(err.message).toBe('Directory already exists');
        }
    })
});
