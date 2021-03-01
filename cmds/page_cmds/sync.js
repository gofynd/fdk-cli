const chalk = require('chalk');
const Listr = require('listr');
const fs = require('fs');
const path = require('path');
const { getActiveContext } = require('../../utils/utils');
const { readFile, writeFile } = require('../../utils/file-utlis');
const {
  getStyleTag,
  getScriptTag,
  getHeadTag,
} = require('../../utils/pageUtils');
const { updatePage } = require('../../apis/page');
const { generateSlug } = require('./init');
const command = 'sync';
const desc = 'sync page contents';
const handler = async (args) => {
  await syncPage(args);
};
const builder = (yargs) => {
  return yargs
    .options('name', {
      alias: 'n',
      describe: 'Page Name',
    })
    .options('file', {
      alias: 'f',
      describe: 'File path',
    })
    .demandOption(
      ['name'],
      `Please provide 'name' arguments to work with this tool`
    );
};
const readPageData = async (pageDir, pageJSONPath, pageName) => {
  try {
    const pageJSON = JSON.parse(readFile(pageJSONPath));

    const pageId = pageJSON.pageId;
    const headTag = getHeadTag(pageJSON);
    const styleString = readFile(
      path.join(process.cwd(), `./${pageDir}/index.less`)
    );
    const htmlString = readFile(
      path.join(process.cwd(), `./${pageDir}/index.html`)
    );
    const scriptString = readFile(
      path.join(process.cwd(), `./${pageDir}/index.js`)
    );
    const styleTag = await getStyleTag(styleString);
    const scriptTag = getScriptTag(scriptString);
    const pageContent = `
  <html>
    ${headTag}
    <body>
    <div class="html-tag">
      ${htmlString}
    </div>
    <div class="style-tag">
      ${styleTag}
    </div>
    <div class="script-tag">
      ${scriptTag}
    </div>
    </body>
  </html>
  `;
    const slug = generateSlug(pageName);
    return { pageContent, pageId, slug };
  } catch (error) {
    console.log(error);

    return Promise.reject(error);
  }
};

const syncPageData = async (pageObj) => {
  try {
    const content = [
      {
        type: 'rawhtml',
        value: pageObj.pageContent,
      },
    ];

    const response = await updatePage(content, pageObj.slug);
    if (response.status === 200) {
      return response.data;
    }
    return Promise.reject(response.data.message);
  } catch (error) {
    return Promise.reject(error.message);
  }
};

const syncPage = async (args) => {
  try {
    let pageJSONPath = `./pages/${args.name}/page.json`;
    if (args.file) {
      pageJSONPath = `./pages/${args.name}/${args.file}.json`;
    }
    if (pageJSONPath) {
      const currentContext = getActiveContext();
      console.log(chalk.green.bold('Current Context:', currentContext.name));
      const tasks = new Listr([
        {
          title: 'Reading page data',
          task: async (ctx) => {
            ctx.pageObj = await readPageData(
              `./pages/${args.name}`,
              pageJSONPath,
              args.name
            );
          },
        },
        {
          title: 'Syncing your page',
          task: async (ctx) => {
            await syncPageData(ctx.pageObj);
          },
        },
      ]);
      await tasks.run().then(() => {
        console.log('%s Sync Completed Successfully', chalk.green.bold('DONE'));
        console.log(
          chalk.yellowBright(
            `View page at: https://${currentContext.domain}/page/${generateSlug(
              args.name
            )}`
          )
        );
      });
    } else {
      throw new Error('Invalid page name or not a page directory');
    }
  } catch (error) {
    console.log(chalk.red(error.message));
    process.exit(1);
  }
};
module.exports = {
  command,
  desc,
  handler,
  builder,
  readPageData,
};
