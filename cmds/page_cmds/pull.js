const Listr = require('listr');
const chalk = require('chalk');
const { generateSlug } = require('./init');
const inquirer = require('inquirer');
const { createDirectory, writeFile } = require('../../utils/file-utlis');
const { getPage } = require('../../apis/page');
const cheerio = require('cheerio');
const { getActiveContext } = require('../../utils/utils');
const fs = require('fs');
const command = 'pull';
const desc = 'Pull application custom pages';
const builder = (yargs) => {
  return yargs.options('name', {
    alias: 'n',
    describe: 'Page Name',
  });
};
const handler = async (args) => {
  await pullPages(args);
};
const questions = [
  {
    type: 'list',
    name: 'pull_all',
    message: 'Are you sure you want to pull all pages:',
    choices: ['Yes', 'No'],
    default: 'Yes',
  },
];
const savePage = (pageObj, local_update) => {
  let $ = cheerio.load(pageObj.content[0].value);
  let html = $('div.html-tag').html();
  let script = $('div.script-tag script').html();
  let less = $('div.style-tag style').html();
  let links = {};
  let scripts = {};
  $('head link').map((i, x) => {
    links[`link_${i}`] = $(x).attr('href');
  });
  $('head script').map((i, x) => {
    scripts[`link_${i}`] = $(x).attr('src');
  });
  const pageJSON = {
    links,
    scripts,
    pageId: pageObj._id,
    title: pageObj.title,
  };
  if (!local_update) {
    const pageDir = process.cwd() + '/pages' + `/${pageObj.title}`;
    createDirectory(pageDir);
    writeFile(pageDir + '/index.html', html ? html : '');
    writeFile(pageDir + '/index.js', script ? script : '');
    writeFile(pageDir + '/index.less', less ? less : '');
    writeFile(pageDir + '/page.json', JSON.stringify(pageJSON, undefined, 2));
  } else {
    const pageDir = process.cwd() + '/pages' + `/${pageObj.title}`;
    writeFile(pageDir + '/index.html', html ? html : '');
    writeFile(pageDir + '/index.js', script ? script : '');
    writeFile(pageDir + '/index.less', less ? less : '');
  }
};
const savePages = async (ctx) => {
  //   savePage(ctx.pageDataArr[0]);
  if (ctx.pageDataArr) {
    ctx.pageDataArr.forEach((data) => {
      if (data.type === 'rawhtml') {
        savePage(data, false);
      }
    });
  } else {
    savePage(ctx.pageData, ctx.local_update);
  }

  //   console.log(ctx.pageDataArr[0].content);
};
const pullPages = async (args) => {
  try {
    if (!fs.existsSync('./config.json')) {
      throw Error('Not a theme directory');
    }
    const currentContext = getActiveContext();
    console.log(chalk.green.bold('Current Context:', currentContext.name));
    let tasks = [];
    if (!args.name) {
      inquirer.prompt(questions).then(async (answer) => {
        if (answer.pull_all === 'No') {
          console.log(chalk.gray('Pass -n option to pull a specific page'));
        } else {
          tasks = new Listr([
            {
              title: 'Fetching Pages',
              task: async (ctx) => {
                const response = await getPage();
                ctx.pageDataArr = response.data.data;
              },
            },
            {
              title: 'Saving pages locally',
              task: async (ctx) => {
                await savePages(ctx);
              },
            },
          ]);
        }
        await tasks.run();
      });
    } else {
      console.log(chalk.blue('Checking if page exists locally'));
      if (fs.existsSync(process.cwd() + '/pages' + `/${args.name}`)) {
        console.log(chalk.blue('Page found locally'));
        tasks = new Listr([
          {
            title: 'Fetching Pages',
            task: async (ctx) => {
              const response = await getPage(args.name);
              ctx.pageData = response.data.data;
              ctx.local_update = true;
            },
          },
          {
            title: 'Overwriting Page Files',
            task: async (ctx) => {
              await savePages(ctx);
            },
          },
        ]);
      } else {
        console.log(chalk.blue('Page not found locally, creating new folder'));
        tasks = new Listr([
          {
            title: 'Fetching Pages',
            task: async (ctx) => {
              const response = await getPage(args.name);
              ctx.pageData = response.data.data;
              ctx.local_update = false;
            },
          },
          {
            title: 'Creating Page Files',
            task: async (ctx) => {
              await savePages(ctx);
            },
          },
        ]);
      }
      await tasks.run();
    }
  } catch (error) {
    console.log(chalk.red(error.message));
  }
};

module.exports = {
  command,
  desc,
  handler,
  builder,
};
