<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit
>**Note:** Experimental support for Windows is available, it may not be fully stable.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Coverage Status][coveralls-badge]]([coveralls-url])

</div>

Fynd development Kit (FDK CLI) is a cli tool developed by Fynd to create and update themes, extensions and various other components of the [Fynd Platform](https://platform.fynd.com/).
### Quick Links
| [Fynd Platform](https://platform.fynd.com/) | [Fynd Partners](https://partners.fynd.com/) | [Partners Documentation](https://partners.fynd.com/help) | [Platform Documentation](https://platform.fynd.com/help) | [Other Projects](#other-fynd-projects) | [Contributing](CONTRIBUTING.md) |

# Prerequisites

- You must have created a [partner account](https://partners.fynd.com/)
- You must have created development account [guide](https://partners.fynd.com/help/docs/partners/testing-extension/development-acc)
- You must have installed [Git](https://github.com/git-guides/install-git), if you don't already have it.
- You must have installed [Nodejs](https://nodejs.org/en/download/package-manager) version 18.X.X or higher version, if you don't already have it.
-  Optional Prerequisites
	- Maven (To use `fdk extension init` for java extension initialization)



# Installation
```sh
npm install -g @gofynd/fdk-cli
```
# Basic Commands
To help you get started, there are some basic commands you can use.

```sh
fdk --help
```
To see the current fdk version, enter:
```sh
fdk version
```
To see the available theme commands, enter:
```sh
fdk theme
```
To see the available extension commands, enter:
```sh
fdk extension
```
See the the [Command reference](#commands-reference) for syntax details and usage examples of the commands.



## Commands
___

### Global Commands
| Command        | Description           |
| ------------- |-------------|
| [login](#login)     | Login user |
| [user](#user)     | Shows user details of logged in user |
| [logout](#logout)     | Logout user |
| [populate](#populate)     | Populate sample data into development account to get started with theme and extension development |
| [tunnel](#tunnel) | Create a tunnel on the specified port number to enable remote access for development and testing. |



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

### Extension Commands
| Command        | Description           |
| ------------- |-------------|
| [init](#extension-init)     | Utilize this command to set up a new extension locally, leveraging existing templates of your choice.  |
| [preview](#extension-preview-url)   | Start the extension development server and provide a tunnel URL to preview the extension on the development company. |
| [pull-env](#extension-pull-env)     | Retrieve extension context values from the partners panel and update current extension context. |
| [launch-url](#extension-launch-url)     | Get/set extension's lanuch url |

### Extension Binding Commands
| Command        | Description           |
| ------------- |-------------|
| [init](#binding-init)     | Utilize this command to set up a new extension section binding locally, leveraging existing templates of either Vue 2 or React JS.  |
| [draft](#binding-draft)     | Create a draft entry of section binding accessible on dev companies.
| [publish](#binding-publish)     | Publish the bindings across all the companies where extension is installed..
| [preview](#binding-preview)     | Create a tunnel and provide a link to tryout extension on any company.
| [show-context](#binding-show-context)     | Show current extension section context.
| [clear-context](#binding-clear-context)     | Clear current extension section context.

### Partner Commands
| Command        | Description           |
| ------------- |-------------|
| [connect](#partner-connect)     | Add partner access token so that you don't need to add it explicitly  |

### Config Commands

| Command Type | Description                          |
|--------------|--------------------------------------|
| [set](#config-set-commands)        | Set configuration values.            |
| [get](#config-get-commands)        | Retrieve current configuration values.|
| [delete](#config-delete-commands)  (alias: `rm`)    | Delete configuration values.

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
| --host    | URL of the partners panel host or API host |
| --help    | Show help |
| --verbose, -v | enable debug mode |

#### **Example**
```sh
fdk login
```
```sh
fdk login --host partners.fynd.com
```
```sh
fdk login --host api.fynd.com
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

<div id="populate"></div>

___
#### **populate**
Using this command populate sample data into development account to get started with theme and extension development.
#### **Syntax**
```sh
fdk populate
```

___


<div id="tunnel"></div>

#### **tunnel**
This command will start a tunnel using cloudflare by which you can access your local port on public url

#### ****Syntax****
```sh
fdk tunnel [options]
```

#### **Command Options**
| Option    | Description   |
| ----------|---------------|
| --port | Port (required) |
| --help    | Show help |
| --verbose | enable debug mode |

#### **Example**
```sh
fdk tunnel --port 8080
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

##### Prerequisites
- You must have installed [Git](https://github.com/git-guides/install-git), if you don't already have it.

#### ****Syntax****
```sh
fdk extension init [options]
```
#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| --target-dir    | Target Directory |
| --template    | Specify the template you want to use to create the extension |
| --help    | Show help |
| --verbose | enable debug mode |

#### **Example**
```sh
fdk extension init --target-dir [your-directory]
```
```sh
fdk extension init --template [template-name]
```
You can pass the following values for the template:
1. node-vue
2. node-react
3. java-vue
4. java-react
___
<div id="extension-preview-url"></div>

#### **preview**
This command will return the preview URL, which the user can use to launch or install the extension.

#### ****Syntax****
```sh
fdk extension preview [options]
```

#### **Command Options**
| Option    | Description   |
| ----------|---------------|
| --company-id | Unique identifier of your company |
| --api-key | Extension API key |
| --access-token | Partner Access Token |
| --tunnel-url | Specify a manual Tunnel URL to bypass automatic tunnel creation. |
| --no-auto-update | Disables auto-updating of tunnel URL as extension launch url on partners panel |
| --reset | Resets the extension's context data, prompting you to re-enter all required details. Useful for a fresh start! |
| --help    | Show help |
| --verbose | Enables debug mode, providing detailed logs for troubleshooting. |

#### **Example**
```sh
fdk extension preview
```
```sh
fdk extension preview --tunnel-url https://broke-casey-eric-recommendations.trycloudflare.com
```
```sh
fdk extension preview --company-id 999
```

- **Cloudflared** will be used as the tunneling tool.

- If you pass Tunnel URL, it will not created new tunnel and use the passed url as tunnel url.

___


<div id="extension-pull-env"></div>

#### **pull-env**
This command will fetch extension context details from partners panel and update current extension context.

#### ****Syntax****
```sh
fdk extension pull-env
```

#### **Example**
```sh
fdk extension pull-env
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

### Extension Binding Commands
Extensions bindings are reusable components which are pluggable through the theme editor to improve the user interface of your application. These can be used just like theme sections.

Set the active environment before running extension commands
```sh
fdk env set -u api.fynd.com
```


<div id="binding-init"></div>

#### **init**
This command is used to create a basic boilerplate code for extension binding with required dependencies.
#### ****Syntax****
```sh
fdk binding init [options]
```
#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding |
| -i, --interface    | (Optional) Interface where this binding will be used. Currently, we only support Web Theme. |
| -f, --framework | (Optional) Runtime framework. Supported values are vue2 and react |

#### **Example**
```sh
fdk binding init
```
___
<div id="binding-draft"></div>

#### **draft**
This command is used to register the binding with your development companies for alpha or beta testing.

#### ****Syntax****
```sh
fdk binding draft [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding |
| -f, --framework | (Optional) Runtime framework. Supported values are vue2 and react |
| -id, --extensionId    | (Optional) Extension Id of the current extension. |
| -org, --organisationId    | (Optional) Organisation Id of the current extension. |


#### **Example**
```sh
fdk binding draft
```
___

<div id="binding-publish"></div>

#### **publish**
This command is used to publish the binding across all live companies.

#### ****Syntax****
```sh
fdk binding publish [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding |
| -f, --framework | (Optional) Runtime framework. Supported values are vue2 and react |
| -id, --extensionId    | (Optional) Extension Id of the current extension. |
| -org, --organisationId    | (Optional) Organisation Id of the current extension. |


#### **Example**
```sh
fdk binding publish
```
___

<div id="binding-preview"></div>

#### **preview**
This command will allow developers to locally serve the extension binding which has been added to a live storefront.

#### ****Syntax****
```sh
fdk binding preview [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding |
| -f, --framework | (Optional) Runtime framework. Supported values are vue2 and react |
| -id, --extensionId    | (Optional) Extension Id of the current extension. |
| -org, --organisationId    | (Optional) Organisation Id of the current extension. |


#### **Example**
```sh
fdk binding preview
```

___

<div id="binding-show-context"></div>

#### **show-context**
This command will allow developers to see the current extension section context.

#### ****Syntax****
```sh
fdk binding show-context
```
___

<div id="binding-clear-context"></div>

#### **clear-context**
This command will allow developers to clear the current extension section context.

#### ****Syntax****
```sh
fdk binding clear-context
```

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
### Config Commands
<div id="config-commands"></div>

<div id="config-set-commands"></div>

#### Set Commands
The `set` commands allow you to configure the `cafile` and `strict-ssl` settings for the tool. This is useful for ensuring that the tool uses the correct SSL certificates and validation settings according to your requirements.

| Command                                   | Description                                  |
|-------------------------------------------|----------------------------------------------|
| `set cafile <file-path>`       | Sets the CA file to the specified file path.  |
| `set strict-ssl <true/false>`  | Enables or disables strict SSL validation.   |

#### **Example**
```sh
fdk config set cafile /etc/ssl/certs/ca-certificates.pem
```
```sh
fdk config set strict-ssl false
```

#### Notes

> - Ensure that the file path provided for the CA file is valid and accessible.
> - The strict SSL setting should be either `true` or `false`.

#### Environment Variables

> Developers can configure settings using environment variables.<br/><hr/>`FDK_EXTRA_CA_CERTS`: Set this variable to specify the CA file path (`cafile`).
<br/><hr/>`FDK_SSL_NO_VERIFY`: Set this variable to `true` to disable strict SSL validation (`strict-ssl=false`).<hr/>

#### **Example**

```sh
FDK_EXTRA_CA_CERTS=/path/to/your/cafile fdk login
```
```sh
FDK_SSL_NO_VERIFY=true fdk login
```

<div id="config-get-commands"></div>

#### Get Commands
The `get` commands allow you to view the current configuration values for `cafile` and `strict-ssl`. This is useful for verifying what values are currently set and ensuring that your configuration is correct.

| Command                       | Description                                  |
|-------------------------------|----------------------------------------------|
| `get cafile`       | Retrieves the current CA file path.          |
| `get strict-ssl`   | Retrieves the current strict SSL setting.    |

#### **Example**
```sh
fdk config get cafile
```
```sh
fdk config get strict-ssl
```

<div id="config-delete-commands"></div>

#### Delete Commands
The `delete` commands allow you to remove the current configuration for `cafile` and `strict-ssl`. This can be useful for resetting configurations or removing settings that are no longer needed.

| Command                        | Description                                  |
|------------------------------- |----------------------------------------------|
| `delete cafile`     | Deletes the current CA file configuration.   |
| `delete strict-ssl` | Deletes the current strict SSL configuration.|
| `rm cafile`         | Alias for `delete`: Deletes the current CA file configuration.   |


#### **Example**
```sh
fdk config delete cafile
```
```sh
fdk config delete strict-ssl
```
```sh
fdk config rm cafile
```
___

<div id="OtherProjects"></div>

## Known Issues

### Cloudflare Tunnel Startup Issue on Apple Silicon Machines

When attempting to start a Cloudflare tunnel using the `fdk tunnel` or `fdk ext preview` commands, users on Apple Silicon machines may encounter difficulties due to the Cloudflare binary's compatibility requirements.

**Solution:** Install Rosetta, which allows you to run applications that contain x86_64 instructions on Apple Silicon. You can do this by executing the following command in your terminal:

```shell
softwareupdate --install-rosetta
```

This command prompts your system to install Rosetta, resolving the compatibility issue and allowing the Cloudflare tunnel to run smoothly on your machine.

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
