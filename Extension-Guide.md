## Getting Started Guide

Step wise guide on how to utilize fdk-cli on create a extension. Check more extension command references [here](https://github.com/gofynd/fdk-cli#extension-commands)

##### Step 1
As fdk extension commands will communicate with partner account. First step is to create one partner account and generate access token.
```sh
fdk partner connect
```
Generate partner access token from [partners account](https://partners.fynd.com).

##### Step 2
```sh
fdk extension init
```
In this step you will be asked to fill basic information of your extension like name and extension type. 

It will register a extension for you on your partner account. As well as it will create a sample project with basic setup to run extension with `API_KEY` and `API_SECRET` for your extension. 
##### Step 3

```sh
fdk extension launch-url set --url=<url value>
```

Once your extension project setup is done and you have deployed your extension on server or running from maching using local tunnel. Use above command to setup launch url for your extension. It will update same on project as well as on extension registered on partner account.

> All commands fired will create folders and files in current working directory only. Please make sure to create your extension directory before hand or use `--target-dir` parameter.