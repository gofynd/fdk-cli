const chalk = require('chalk');
const fs = require('fs');
const { createPage } = require('./../../apis/page');
const Listr = require('listr');
const { getActiveContext } = require('../../utils/utils');
const { createDirectory, writeFile } = require('../../utils/file-utlis');
const command = 'init';
const desc = 'Initialize FDK Page';
const builder = (yargs) => {
  return yargs
    .options('name', {
      alias: 'n',
      describe: 'Page Name',
    })
    .demandOption(
      ['name'],
      `Please provide 'name' arguments to work with this tool`
    );
};
const handler = async (args) => {
  await initializeNewPage(args.name);
};

const generateSlug = (pageName) => {
  return pageName.split(' ').join('-').toLowerCase();
};

const createPageInDB = async (pageData) => {
  try {
    const response = await createPage(pageData);
    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    throw Error(error);
  }
};
const createPageDirectory = async (pageData) => {
  if (!fs.existsSync(process.cwd() + '/pages')) {
    createDirectory(process.cwd() + '/pages');
  }
  const pageJSON = {
    links: {},
    scripts: {},
    pageId: pageData.data._id,
    title: pageData.data.title,
  };
  const pageDir = process.cwd() + '/pages' + `/${pageData.data.title}`;
  createDirectory(pageDir);
  writeFile(pageDir + '/index.html', '');
  writeFile(pageDir + '/index.js', '');
  writeFile(pageDir + '/index.less', '');
  writeFile(pageDir + '/page.json', JSON.stringify(pageJSON, undefined, 2));
};
const initializeNewPage = async (pageName) => {
  try {
    const currentContext = getActiveContext();
    console.log(chalk.green.bold('Current Context:', currentContext.name));
    const date = new Date();
    const ISODate = date.toISOString();
    const requestObject = {
      title: pageName,
      slug: generateSlug(pageName),
      description: pageName,
      published: true,
      tags: [],
      type: 'rawhtml',
      _schedule: {
        start: ISODate,
      },
    };
    const tasks = new Listr([
      {
        title: 'Validating Page Title',
        task: async (ctx) => {
          ctx.pageData = await createPageInDB(requestObject);
        },
      },
      {
        title: 'Creating Files',
        task: async (ctx) => {
          await createPageDirectory(ctx.pageData);
        },
      },
    ]);
    await tasks.run();
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = {
  command,
  desc,
  handler,
  builder,
  generateSlug,
};
