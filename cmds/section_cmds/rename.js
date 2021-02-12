
const fs = require('fs');
const chalk = require('chalk')
const cheerio = require('cheerio')
const _ = require('lodash')
const { readFile, writeFile } = require('../../utils/file-utlis')
const child = require('child_process');

const command = "rename";
const desc = "Rename section";

let settingPathObj = {}

const builder = (yargs) => {
    return yargs
        .options('old', {
            alias: 'o',
            describe: 'Old section name',
        })
        .options('new', {
            alias: 'n',
            describe: 'New section name',
        })

        .demandOption(
            ['old', 'new'],
            `Please provide 'name' arguments to work with this tool`
        );
};
function extractSettingsFromFile(path) {
    try {
        let $ = cheerio.load(readFile(path));
        let settingsText = $('settings').text();
        let settingJSON = settingsText ? JSON.parse(settingsText) : {};
        //Map setting name with path of section file to update later
        settingJSON.name ? settingPathObj[`${settingJSON.name}`] = path : null;
        return settingJSON
    } catch (error) {
        throw new Error(error.message)
    }
}
function renameSectionNameInSections(sections, args) {
    return sections.map(page => {
        if (page.page_key === page) {
            page.page_sections = page.page_sections.map(s => {
                s.name = s.name === args.old ? args.new : s.name;
                return s;
            })
        }
        return page;
    });
}
async function getSettingsArr() {
    try {
        let sectionsFiles = fs.readdirSync(`${process.cwd()}/theme/sections`).filter(o => o != 'index.js');
        let settingsArr = sectionsFiles.map((f) => {
            return extractSettingsFromFile(`${process.cwd()}/theme/sections/${f}`);
        })
        return settingsArr
    } catch (error) {
        throw new Error(error.message)
    }

}
async function updateSectionFileSettings(settings, newName) {
    try {
        const path = settingPathObj[`${settings.name}`];
        settings.name = newName;

        let sectionString = readFile(path);
        const startIndex = sectionString.search('<settings');
        const endIndex = sectionString.search('</settings>');
        const newSettings = `<settings>
            ${JSON.stringify(settings, undefined, 2)}
        </settings>`
        sectionString = sectionString.replace(
            sectionString.substring(startIndex, endIndex + 11),
            newSettings
        );
        writeFile(path, sectionString)
        // console.log($.text());
    } catch (error) {
        throw new Error(error.message)
    }
}
const handler = async (args) => {
    try {
        if (!fs.existsSync(process.cwd() + '/config.json')) {
            throw new Error('Not a theme directory')
        }
        //Get settings array to find if section to be renamed exists
        console.log(chalk.yellow.bold('Reading sections'));
        let settingsArr = await getSettingsArr();
        const existsSetting = _.find(settingsArr, { name: args.old });
        if (!existsSetting) {
            throw new Error('Section to be renamed does not exists');
        }
        // console.log(existsSetting, "existsSetting")
        console.log(chalk.yellow.bold('Updating sections in presets'));
        //update local presets
        let globalConfigData = JSON.parse(readFile(`${process.cwd()}/theme/config/settings_data.json`));
        sections = globalConfigData.preset.sections;
        globalConfigData.preset.sections = renameSectionNameInSections(sections, args)
        writeFile(`${process.cwd()}/theme/config/settings_data.json`, JSON.stringify(globalConfigData, undefined, 2));
        console.log(chalk.yellow.bold('Updating sections on local'));
        updateSectionFileSettings(existsSetting, args.new)
        child.execSync(
            `fdk theme sync `,
            {
                stdio: 'inherit'
            }
        );

    } catch (error) {

        console.log(error);
        process.kill(process.pid);
    }
}
module.exports = {
    command,
    desc,
    handler,
    builder
};
