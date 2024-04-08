<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit
>**Note:** Experimental support for Windows is available, it may not be fully stable.
<div>

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Coverage Status][coveralls-badge]]([coveralls-url])

</div>

Fynd development Kit (FDK CLI) is a cli tool developed by Fynd to create and update themes, extensions and various other components of the [Fynd Platform](https://platform.fynd.com/).
### Quick Links
| [Fynd Platform](https://platform.fynd.com/) | [Fynd Partners](https://partners.fynd.com/) | [Documentation](https://documentation.fynd.com/) | [Other Projects](#other-fynd-projects) | [Contributing](CONTRIBUTING.md) | 

# Prerequisites

- Git
- Nodejs
-  Optional Prerequisites
	- Maven (To use `fdk extension init` for java extension initialization)
	- pip (To use `fdk extension init` for python extension initialization)



# Installation
```sh
npm install -g @gofynd/fdk-cli
```
# Basic Commands
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



## Commands

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
| [init](#theme-init)     | Clone or download the code of the live website onto your local machine to set up a local development environment for testing and modifications.  |
| [serve](#theme-serve)     | Initiate theme development on your local machine. Your changes will automatically reflect in the browser whenever you save |
| [sync](#theme-sync)     | This command will sync your local changes on live store website so you can preview it.|
| [pull](#theme-pull)     | Pull latest theme code of your store website |
| [pull-config](#theme-pull-config)     | Retrieve the most recent theme configuration values from the theme editor on your local machine. |
| [open](#theme-open)    | Returns links that provide preview of the current theme. |
| [package](#theme-package)    | Package your local theme files into a ZIP file. This will allow you to upload the theme to the partners panel and list it on the marketplace. |
| [context](#theme-context)     | Add context of a theme |
| [context-list](#theme-context-list)     | List all available contexts |
| [active-context](theme-active-context)    | show currently active context |

### Partner Commands
| Command        | Description           | 
| ------------- |-------------| 
| [connect](#partner-connect)     | Add partner access token so that you don't need to add it explicitly  |

### Extension Commands
| Command        | Description           | 
| ------------- |-------------| 
| [init](#extension-init)     | Utilize this command to set up a new extension locally, leveraging existing templates of your choice.  |
| [setup](#extension-setup)     | Configure your extension locally using the existing API Key and API Secret provided for the extension inside the partners panel.
| [preview-url](#extension-preview-url)   | Create a ngrok tunnel and provide a link to tryout extension on development company
| [launch-url](#extension-launch-url)     | Get/set extension's lanuch url |

<div id="debugMode"></div>


## Debug Mode
Add the `--verbose` flag to the command you want to run in debug mode.

This will create `debug.log` file at the current working directory. In case you encounter any issues, this log file can be shared with maintainers for effective issue resolution.
#### **Example**
```sh
fdk login --verbose
```
<div id="commands-reference"><div/>

## Commands Reference
___
### Authentication Commands
To use fdk cli command the user has to login to the cli.
<div id="login"></div>

#### **login**
This command allows user to login via partner panel.
#### **Syntax**
```sh
fdk login [options]
```
#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --api-domain    | API domain |
| --help    | Show help |
| --verbose, -v | enable debug mode |

#### **Example**
```sh
fdk login
```
```sh
fdk login -ad api.fynd.com
```
```sh
fdk login --api-domain api.fynd.com
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
| Option        | Description | Required |
| ------------- |-------------|----------|
| --name, -n    | Theme name | Yes |
| --help    | Show help | No |
| --verbose, -v | enable debug mode | No |

#### **Example**
```sh
fdk theme new -n [your-theme-name] 
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
| Option        | Description | 
| ------------- |-------------| 
| --help    | Show help |
| --verbose, -v | enable debug mode |

#### **Example**
```sh
fdk theme init
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
| Option        | Description | Required | 
| ------------- |-------------| -------- |
| --name, -n    | Context name | Yes |
| --help    | Show help | No |
| --verbose, -v | enable debug mode | No |

#### **Example**
```sh
fdk theme context -n [context-name] 
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
<div id="theme-active-context"></div>

#### **active-context**
This command is used to get currently active context.
#### **Syntax**
```sh
fdk theme active-context
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
| --verbose, -v | enable debug mode |

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

<div id="theme-package"></div>

#### **package**
This command is used to create a zip file of theme.
#### **Syntax**
```sh
fdk theme package
```
___
<div id="theme-open"></div>

#### **open**
This command is used to preview the theme on browser.
#### **Syntax**
```sh
fdk theme open 
```
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
| --help    | Show help |
| --verbose | enable debug mode |

#### **Example**
```sh
fdk extension init --target-dir [your-directory]
```
___
<div id="extension-setup"></div>

#### **setup**
This command is used to setup extension's development environment in local machine with required dependencies created on [Fynd Partners](https://partners.fynd.com/) panel.
#### ****Syntax****
```sh
fdk extension setup [options]
```

#### **Command Options**
| Option        | Description           | 
| ------------- |-------------| 
| --target-dir    | Target Directory |
| --help    | Show help |
| --verbose | enable debug mode |

#### **Example**
```sh
fdk extension setup --target-dir [your-directory]
```
___

<div id="extension-preview-url"></div>

#### **preview-url**
This command will return the preview URL, which the user can use to launch or install the extension.

#### ****Syntax****
```sh
fdk extension preview-url [options]
```

#### **Command Options**
| Option    | Description   |
| ----------|---------------|
| -p, --port    | Port on which Extension is running |
| --company-id | specify company id |
| --update-authtoken | update Ngrok authtoken |
| --api-key | Extension API key |
| --help    | Show help |
| --verbose | enable debug mode |

#### **Example**
```sh
fdk extension preview-url --port 3000
```
```sh
fdk extension preview-url -p 3000 --update-authtoken
```
```sh
fdk extension preview-url -p 3000 --company-id 999 --update-authtoken
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
| --api-key    | Extension ID |
| --help    | Show help |
| --verbose | enable debug mode |

#### **Set Launch URL Example**
```sh
fdk extension launch-url set --url [url] --api-key [Extension API Key]
```

#### **Get Launch URL Example**
```sh
fdk extension launch-url get --api-key [Extension API Key]
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
| --help    | Show help |
| --verbose, -v | enable debug mode |

#### **Example**
```sh
fdk partner connect
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
[coveralls-badge]: https://coveralls.io/repos/github/gofynd/fdk-cli/badge.svg?branch=master&&kill_cache=1
[coveralls-url]: https://coveralls.io/github/gofynd/fdk-cli?branch=master

___

<div id="Contributing"></div>

## Contributing

Checkout [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started contributing to this repository.

****
