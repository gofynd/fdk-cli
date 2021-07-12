<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM License][license-image]][license-url]
[![Build Status](https://travis-ci.org/gofynd/fdk-cli.svg?branch=master)](https://travis-ci.org/gofynd/fdk-cli)
Fynd development Kit (FDK CLI) is a cli tool developed by Fynd to create and update themes, extensions and various other components of the [Fynd Platform](https://platform.fynd.com/).
### Quick Links
[Fynd Platform](https://platform.fynd.com/) | [Fynd Partners](https://partners.fynd.com/) | [Documentation](https://documentation.fynd.com/) | [Other Projects](#OtherProjects) | 
|---|---|---|---|
# Installation
___
```sh
npm install -g @gofynd/fdk-cli
```
# Basic Commands
___
To help you get started, there are some basic commands you can use.

```sh
fdk --help
```
To see the available theme commands, enter:
```sh
fdk theme
```
To see the available context commands, enter:
```sh
fdk context
```
To see the available extension commands, enter:
```sh
fdk extension
```
See the [Command overview](#commands-overview) for a listing of all available commands, or the [Command reference](#commands-reference) for syntax details and usage examples of the commands.
<div id="commands-overview"><div/>

# Commands Overview
All FDK CLI commands start with fdk. The general syntax for the commands is as follows:
```sh
fdk [module] [method] [options]
```
This command can be broken down as follows:

| **Syntax**        | **Example**           | 
| ------------- |-------------| 
| module     | theme |
| method     | init |
| options     | --email email@gmail.com |

## Commands
___
### Theme Commands
| Command        | Description           | 
| ------------- |-------------| 
| [new](#theme-new)     | Create new theme |
| [init](#theme-init)     | Initialize an existing theme |
| [serve](#theme-serve)     | Locally run a theme |
| [sync](#theme-sync)     | Sync theme to application |
| [pull](#theme-pull)     | Pull latest theme code |
| [pull-config](#theme-pull-config)     | Pull latest theme config |
| [publish](#theme-publish)     | Publish theme to library |
| [unpublish](#theme-unpublish)     | Unpublish theme |
| [list](#theme-list)     | List themes added to application |

### Context Commands
| Command        | Description           | 
| ------------- |-------------| 
| [add](#context-add)     | Add new context |
| [update](#context-update)     | Update active context |
| [get](#context-get)     | Get active context |
| [list](#context-list)     | List all available contexts |
| [set](#context-set)     | Set active context |

### Extension Commands
| Command        | Description           | 
| ------------- |-------------| 
| [init](#extension-init)     | Initialize extension |
| [launch-url](#extension-launch-url)     | Get/set lanuch url |

### Partner Commands
| Command        | Description           | 
| ------------- |-------------| 
| [connect](#partner-connect)     | Add partner access token |

<div id="commands-reference"><div/>

## Commands Reference
___
### Theme Commands
A theme is a VueJS project that developers can scaffold using this cli tool. Themes change the look and feel of websites built using Fynd Platform. Always create a new directory while creating or initializing a theme.
<div id="theme-new"></div>


#### **new**
This command is used to create a new theme for your application
#### **Syntax**
```sh
fdk theme new [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --email    | Email |
| --password    | Password |
| --app-id    | Application ID |
| --app-token    | Application token |
| --company-id    | Company ID |
| --host    | Host |
| --theme-name    | Theme name |
| --context-name    | Context name |
| --help    | Show help |

You can find the application ID and application token under the developers panel of Fynd Platform. [Reference](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625635306591.png)

#### **Example**
```sh
fdk theme new --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token] --host api.fynd.com --theme-name [your-theme-name] --context-name [context-name] --company-id [your-company-id]
```

___

<div id="theme-init"></div>


#### **init**
This command is used to initialize an exisiting theme on your local system.
#### **Syntax**
```sh
fdk theme init [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --email    | Email |
| --password    | Password |
| --app-id    | Application ID |
| --app-token    | Application token |
| --company-id    | Company ID |
| --host    | Host |
| --theme-id    | Theme ID |
| --context-name    | Context name |
| --help    | Show help |

You can find the application ID and application token under the developers panel of Fynd Platform. [Reference](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625635306591.png)
For theme ID view the theme modal in under Appearance -> Theme. [Reference](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625636390802.png)

#### **Example**
```sh
fdk theme init --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token]  --host api.fynd.com  --theme-name [your-theme-name] --context-name [context-name] --company-id [your-company-id] --theme-id [your-theme-id]
```
___

<div id="theme-serve"></div>


#### **serve**
This command is used to run a theme on your local system.
#### **Syntax**
```sh
fdk theme serve [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --ssr    | Enable/disable Server-side rendering |
| --help    | Show help |

By default Server-side rendering is enable. To disable it use `--ssr=false` with the serve command

#### **Example**
```sh
fdk theme serve
```
___
<div id="theme-sync"></div>

#### **sync**
This command is used to sync your theme to the application.
#### **Syntax**
```sh
fdk theme sync
```
Always verify if you have set the correct context before syncing your theme. Refer [context](#context-commands) commands.

___
<div id="theme-pull"></div>

#### **pull**
This command is used to pull latest theme code.
#### **Syntax**
```sh
fdk theme pull
```
___
<div id="theme-pull-config"></div>

#### **pull-config**
This command is used to pull latest theme config.
#### **Syntax**
```sh
fdk theme pull-config
```
___
<div id="theme-publish"></div>

#### publish
This command is used to publish your theme.
#### **Syntax**
```sh
fdk theme publish
```
___
<div id="theme-unpublish"></div>

#### **unpublish**
This command is used to unpublish your theme.
#### **Syntax**
```sh
fdk theme unpublish
```
___
<div id="theme-list"></div>

#### **list**
This command is used to publish your theme.
#### **Syntax**
```sh
fdk theme list [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --app-id    | Application ID |
| --app-token    | Application token |
| --host    | Host |
| --help    | Show help |

#### **Example**
```sh
fdk theme list --app-id [your-application-id] --app-token [your-application-token]  --host api.fynd.com
```
___
<div id="context-commands"></div>

### Context Commands
Context is a JSON object which holds the configurations related the the application and theme. When you initialize or create a new theme a context is created with the name provided in the commands and assigned as the active context. You can add multiple contexts if you want to use the same theme on multiple applications or envoirnments.

<div id="context-add"></div>

#### **add**
This command is used to add a new context.
#### **Syntax**
```sh
fdk context add [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --email    | Email |
| --password    | Password |
| --app-id    | Application ID |
| --app-token    | Application token |
| --company-id    | Company ID |
| --theme-id    | Theme ID |
| --host    | Host |
| --context-name    | Context name |
| --help    | Show help |

You can find the application ID and application token under the developers panel of Fynd Platform. [Reference](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625635306591.png)
For theme ID view the theme modal in under Appearance -> Theme. [Reference](https://hdn-1.fynd.com/company/884/applications/000000000000000000000003/theme/pictures/free/original/theme-image-1625636390802.png)
#### **Example**
```sh
fdk context add --email [your-email] --password '[your-password]' --app-id [your-application-id] --app-token [your-application-token]  --host api.fynd.com --context-name [context-name] --company-id [your-company-id] --theme-id [your-theme-id]
```
___
<div id="context-update"></div>

#### **update**
Sometimes you can get Unauthenticated errors in between sync. This might have happened because your session has expired. For this update your context using this command.
#### **Syntax**
```sh
fdk context update [options]
```
#### **Command Options**
| Option        | Description  | 
| ------------- |-------------| 
| --email, -e    | Email |
| --password, -p    | Password |
| --help    | Show help |

#### **Example**
```sh
fdk context update -e [your-email] -p '[your-password]'
```
___
<div id="context-get"></div>

#### **get**
This command is used to get active context.
#### **Syntax**
```sh
fdk context get
```
___
<div id="context-list"></div>

#### **list**
This command is used to get a list of available context. You can also set active context by selecting one of the options in the list
#### **Syntax**
```sh
fdk context list
```
___
<div id="context-set"></div>

#### **set**
This command is used to set a active context.
#### **Syntax**
```sh
fdk context set [options]
```
#### **Command Options**
| Option        | Description  | 
| ------------- |-------------| 
| --name, -n    | Context name |
| --help    | Show help |

#### **Example**
```sh
fdk context set -n [example-context]
```
___
### Extension Commands
Extensions are pluggable snippets of code that can be installed in your applications so improve the feature set of your application. To know more visit - [Fynd Partners](https://partners.fynd.com/)

<div id="extension-init"></div>

#### **init**
This command is used to create a extension's initial code with required dependency. It will also register extension for you on your partner account.
#### ****Syntax****
```sh
fdk extension init [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --dir    | Target Directory |
| --host    | Host |
| --help    | Show help |

#### **Example**
```sh
fdk extension init --dir [your-directory] --host [your_host]
```
___
<div id="extension-launch-url"></div>

#### **launch-url**
This command is used to get or set the launch url of your extension
#### **Syntax**
```sh
fdk extension launch-url get/set [options]
```
#### **Command Options**
| Option        | Description  | 
| ------------- |-------------| 
| --url | URL to be set |
| --api_key    | Extension ID |
| --host    | Host |
| --help    | Show help |

#### **Set Launch URL Example**
```sh
fdk extension launch-url set --url [url] --api_key [extension ID] --host [your_host]
```

#### **Get Launch URL Example**
```sh
fdk extension launch-url get --api_key [extension id] --host [your_host]
```
___
### Partner Commands

<div id="partner-connect"></div>

#### connect
This command is used to add your partner access token to update extension details on partners panel.
#### **Syntax**
```sh
fdk partner connect [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --host    | Host |
| --help    | Show help |

#### **Example**
```sh
fdk partner connect --host [your_host]
```
___

<div id="OtherProjects"></div>


## Other Fynd projects
| Project |Link |
|---|-|
**Nitrozen Vue** | [![Know more](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@gofynd/nitrozen-vue)
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



