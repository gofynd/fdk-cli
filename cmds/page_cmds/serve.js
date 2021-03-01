const fs = require('fs');
const Listr = require('listr');
const chalk = require('chalk');
const command = 'serve';
const { generateSlug } = require('./init');
const { readPageData } = require('./sync');
const express = require('express');
const app = express();
const { getPage, previewPage } = require('../../apis/page');
const { Observer } = require('../../utils/file-watcher');
const WebSocket = require('ws');

const builder = (yargs) => {
  return yargs
    .option('name', {
      alias: 'n',
      desc: 'Name of the page to be served',
    })
    .option('port', {
      alias: 'p',
      desc: 'Port on which page will be previewed',
    })
    .demandOption(
      ['name'],
      `Please provide 'name' arguments to work with this tool`
    );
};
let responseHTML = '';
const http = require('http').createServer(app);
const ws = new WebSocket.Server({ server: http });
let soc = [];
ws.on('connection', (socket) => {
  socket.on('close', () => {
    const index = soc.findIndex((s) => s === socket);
    soc.splice(index, 1);
  });
  soc.push(socket);
});

app.get('/', async (req, res) => {
  res.send(responseHTML.data);
});

const handler = async (args) => {
  await startLiveServer(args);
};
const server = async (port) => {
  try {
    http.listen(port, () => { });
  } catch (error) {
    console.log(error);
  }
};
const getPagePreview = async (args) => {
  let port = args.port || 3000;
  const tasks = new Listr([
    {
      title: 'Generating Preview',
      task: async () => {
        let pageJSONPath = `./pages/${args.name}/page.json`;
        const slug = generateSlug(args.name);
        const response = await getPage(slug);
        let pageData = response.data.data;
        const pageObj = await readPageData(`./pages/${args.name}`, pageJSONPath, args.name);
        pageObj.pageContent =
          pageObj.pageContent +
          `
        <script>
        var ws = new WebSocket('ws://localhost:${port}');
        
        ws.onerror = function(socket){
          console.log("Error",socket)
        }
        ws.onmessage = function(event) {
          console.log(event);
          if(event.data === 'reload'){
            window.location.reload()

          }
        };
        ws.onclose = function() {
          // websocket is closed.
          console.log('Closed')
          ws.close()
        };
        window.onbeforeunload = function(){
          console.log("Before Tab Close");
          ws.send("close",ws)
          ws.close()

        }

        </script>

        `;
        const content = [
          {
            type: 'rawhtml',
            value: pageObj.pageContent,
          },
        ];

        pageData.content = content;
        responseHTML = await previewPage(pageData);
      },
    },
  ]);
  await tasks.run();
  if (soc.length > 0) {
    soc.forEach((s) => {
      s.send('reload');
    });
  }

  console.log(
    chalk.yellow(
      `Preview available at http://local.mirage.addsale.com:${port}/`
    )
  );
};
const startLiveServer = async (args) => {
  try {
    const observer = new Observer();
    if (!fs.existsSync(`./pages/${args.name}`)) {
      return Promise.reject('Page does not exists');
    }
    observer.watchFolder(`./pages/${args.name}/*.*`, getPagePreview, args);

    let port = args.port || 3000;
    server(port);
    await getPagePreview(args);
  } catch (error) {
    console.log(chalk.red(error));
  }
};
const desc = 'serve html on local';

module.exports = { command, desc, builder, handler };
