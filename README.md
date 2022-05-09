<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM License][license-image]][license-url]
[![Build Status](https://travis-ci.org/gofynd/fdk-cli.svg?branch=master)](https://travis-ci.org/gofynd/fdk-cli)
[![Coverage Status](https://coveralls.io/repos/github/gofynd/fdk-cli/badge.svg?branch=master)](https://coveralls.io/github/gofynd/fdk-cli?branch=master)
Fynd development Kit (FDK CLI) is a cli tool developed by Fynd to create and update themes, extensions and various other components of the [Fynd Platform](https://platform.fynd.com/).
### Quick Links
[Fynd Platform](https://platform.fynd.com/) | [Fynd Partners](https://partners.fynd.com/) | [Documentation](https://documentation.fynd.com/) | [Other Projects](#OtherProjects) | | [Contributing](#Contributing) | 
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
### Environment Commands
| Command        | Description           | 
| ------------- |-------------| 
| [env ls](#env-ls)     | List environments |
| [env get](#env-get)     | Shows current environment |
| [env set](#env-set)     | Set active environment to the value provided by the user|

### Authentication Commands
| Command        | Description           | 
| ------------- |-------------| 
| [login](#login)     | Login user |
| [user](#user)     | Shows user details of logged in user |
| [logout](#logout)     | Logout user |


### Theme Commands
| Command        | Description           | 
| ------------- |-------------| 
| [new](#theme-new)     | Create new theme |
| [init](#theme-init)     | Initialize an existing theme |
| [context](#theme-context)     | Add context of a theme |
| [context-list](#theme-context-list)     | List all available contexts |
| [serve](#theme-serve)     | Start theme serving on localhost |
| [sync](#theme-sync)     | Sync theme to application |
| [pull](#theme-pull)     | Pull latest theme code |
| [pull-config](#theme-pull-config)     | Pull latest theme config |
| [publish](#theme-publish)     | Publish theme to library |
| [unpublish](#theme-unpublish)     | Unpublish theme |

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
### Environment Commands
Before you setup a theme using FDK CLI you will have to set an environment in which you will be initializing your theme
<div id="env-ls"></div>

#### **env ls**
This command displays a list of all supported environments.
#### **Syntax**
```sh
fdk env ls
```

<div id="env-set"></div>

___

#### **env set**
This command sets the active environment to the value provided by the user.

#### **Syntax**
```sh
fdk env set -n [env-name]
```
#### **Example**
```sh
fdk env set -n fynd
```
#### **Command Options**
| Option        | Description | Required |
| ------------- |-------------|----------|
| --name, -n   | Environment name | Yes |
| --help    | Show help | No |

<div id="env-get"></div>

___

#### **env get**
This command displays the active environment set by the user.
#### **Syntax**
```sh
fdk env get
```
___
### Authentication Commands
After setting the environment the user has to login to the cli. They can use their email ID or phone number to login.
<div id="login"></div>

#### **login**
This command allows user to login with email or password
#### **Syntax**
```sh
fdk login
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --email, -e   | Email |
| --mobile, -m    | Mobile |
| --help    | Show help |

#### **Example**
```sh
fdk login -e [your-email]
```

```sh
fdk login -m [your-mobile]
```

<div id="user"></div>

___
#### **user**
This command show user details of the currently logged in user.
#### **Syntax**
```sh
fdk user
```

<div id="logout"></div>

___
#### **logout**
This command will logout the user.
#### **Syntax**
```sh
fdk logout
```
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
| --token, -t    | Theme token |
| --name, -n    | Theme name |
| --help    | Show help |

You can find the theme token under the themes panel of Fynd Platform. [Reference](https://hdn-1.addsale.com/x0/company/1/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1628752638519.png)

#### **Example**
```sh
fdk theme new -t [theme-token] -n [your-theme-name] 
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
| --token, -t   | Theme token |
| --help    | Show help |

You can find the theme token under the themes panel of Fynd Platform. [Reference](https://hdn-1.addsale.com/x0/company/1/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1628752713854.png)


#### **Example**
```sh
fdk theme init -t [your-theme-token]
```
___

<div id="theme-context"></div>

#### **context**
Context is a JSON object which holds the configurations related the the application and theme. When you initialize or create a new theme a context is created with the name provided in the commands and assigned as the active context. You can add multiple contexts if you want to use the same theme on multiple applications or envoirnments. <br/> <br/>
This command is used to add a new context.
#### **Syntax**
```sh
fdk theme context [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --token, -t    | Theme token |
| --name, -n    | Context name |
| --help    | Show help |

You can find the theme token under the theme panel of Fynd Platform. [Reference](https://hdn-1.addsale.com/x0/company/1/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1628752713854.png)

#### **Example**
```sh
fdk theme context -t [your-theme-token] -n [context-name] 
```
___
<div id="theme-context-list"></div>

#### **context-list**
This command is used to get a list of available context. You can also set active context by selecting one of the options in the list
#### **Syntax**
```sh
fdk theme context-list
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
| --port   | Pass custom port number to serve theme. `Default: 5001` |
| --help   | Show help |

By default Server-side rendering is enable. To disable it use `--ssr false` with the serve command
#### **Example**
```sh
fdk theme serve
```

```sh
fdk theme serve --port 5002
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
| --target-dir    | Target Directory |
| --host    | Host |
| --help    | Show help |

#### **Example**
```sh
fdk extension init --target-dir [your-directory] --host [your_host]
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

___

<div id="Contributing"></div>

## Contributing

Checkout [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started contributing to this repository.

****