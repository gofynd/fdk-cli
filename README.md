<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM License][license-image]][license-url]
[![Build Status](https://travis-ci.org/gofynd/fdk-cli.svg?branch=master)](https://travis-ci.org/gofynd/fdk-cli)

<!-- [![Code Coverage][coveralls-image]][coveralls-url] -->

<!-- [![Test Coverage][coveralls-image]][coveralls-url] -->
Fynd development Kit (FDK CLI) is a cli tool developed by Fynd to create and update themes, extensions and various other components of the [Fynd Platform](https://platform.fynd.com/).
### Quick Links
[Themes](#Themes) | [Extensions](#Extensions) | [Other Projects](#OtherProjects) | 
|---|---|---|
## Installation
```sh
npm install -g @gofynd/fdk-cli
```
<div id="Themes"></div>

## Themes
A theme is a VueJS project that developers can scaffold using this cli tool. Themes change the look and feel of websites built using Fynd Platform

Use the below commands to create a new theme
```sh
mkdir new-theme
cd new-theme
fdk theme new --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token] --host api.fynd.com --theme-name [your-theme-name] --context-name [context-name] --company-id [your-company-id]
```

### Initializing an existing theme
Lets say you want to make changes to an existing theme that was developed by you previously. For this you will need application id and application token as well as theme id. Theme ID can be found in the theme detail modal. [Screenshot](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625636390802.png)

Use the below commands to initialize a theme

```sh
mkdir init-theme
cd init-theme
fdk theme init --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token]  --host api.fynd.com  --theme-name [your-theme-name] --context-name [context-name] --company-id [your-company-id] --theme-id [your-theme-id]
```

### Local Development
For local development you can locally run the theme by running

```sh
fdk theme serve
```
By default themes are served with server-side rendering so if there are any issues in the code that can cause an error during SSR are shown, however if you wish to disable server-side rendering you can use

```sh
fdk theme serve --ssr=false
```

### Understanding contexts
Context is a JSON object which holds the configurations related the the application and theme. When you initialize or create a new theme a context is created with the name provided in the commands and assigned as the active context. You can add multiple contexts if you want to use the same theme on multiple applications or envoirnments 
To add a context use the below command
```sh
fdk context add --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token]  --host api.fynd.com --context-name [context-name] --company-id [your-company-id] --theme-id [your-theme-id]
```

To set a different context use the below command and from the dropdown select the context you want to use.
```sh
fdk context list
```
### Syncing Themes
To update theme on you application you have to first sync the theme. To sync use the below command.
Note: Always verify if you are syncing to correct context using ```fdk context get```

```sh
fdk theme sync
```

### Publishing Themes
To publish a theme so that it appears in the theme library and can be used by other applications use the below command
```sh
fdk theme publish
```

### Updating session
Sometimes you might get unauthenticated errors. In that case you should update your context.
Use the below command to update context
```sh
fdk context update --email [your-email-id] --password '[your-password]'
```

### Other commands

| Plugin | README |
| ------ | ------ |
| Pull Config | fdk theme pull-config |
| Pull latest theme code | fdk theme pull |
| List themes | fdk theme list --app-id [your-application-id]  --app-token [your-application-token]  --host api.fynd.com |
| Unpublish theme | fdk theme unpublish |

<div id="Extensions"></div>

## Extensions
Coming soon

<div id="OtherProjects"></div>

## Other Fynd projects
| Project |Link |
|---|-|
**Nitrozen Vue** | [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@gofynd/nitrozen-vue)
**Javascript SDK** | [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://github.com/gofynd/fdk-client-javascript)
**Extension SDK** | [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://github.com/gofynd/fdk-extension-javascript)
**Extension Bridge** | [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://github.com/gofynd/fdk-extension-bridge-javascript)



[npm-image]: https://img.shields.io/npm/v/@gofynd/fdk-cli?color=blue
[npm-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[downloads-image]: https://img.shields.io/npm/dm/@gofynd/fdk-cli
[downloads-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[coveralls-image]: https://img.shields.io/coveralls/github/gofynd/fdk-cli?color=success
[coveralls-url]: https://coveralls.io/github/gofynd/fdk-cli
[travis-url]: https://travis-ci.org/gofynd/fdk-cli/
[license-image]: https://img.shields.io/npm/l/@gofynd/fdk-cli?color=success
[license-url]: https://github.com/gofynd/fdk-cli/blob/master/LICENSE


