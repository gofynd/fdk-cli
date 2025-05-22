<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

# Fynd Development Kit

## Overview

The Fynd Development Kit (FDK) CLI is a command-line interface tool designed to streamline the development workflow for Fynd Platform. It empowers developers to create, customize, and manage themes, extensions, and other components of their Fynd Platform applications. Whether you are a seasoned developer or just starting, FDK CLI provides the necessary tools to build and deploy robust e-commerce solutions efficiently.

This tool is primarily for:
* Developers building or customizing themes for Fynd Platform stores.
* Developers creating extensions to add new features and integrations to Fynd Platform.
* Anyone looking to manage and update their Fynd Platform application components through a command-line interface.

## Getting Started

This guide will walk you through the initial setup of FDK CLI.

1.  **Prerequisites**: Ensure you have met all the [Prerequisites](#prerequisites) before proceeding.
2.  **Installation**: Install FDK CLI globally using npm by following the [Installation](#installation) guide.
3.  **Verify Installation**: Check if the CLI is installed correctly by running:
    ```sh
    fdk version
    ```
    Alternatively, you can see all available commands with:
    ```sh
    fdk --help
    ```
4.  **Login**: Authenticate yourself by running the login command. This will open a browser window for you to log in to your Fynd Platform account.
    ```sh
    fdk login
    ```
5.  **Next Steps**: You're all set! You can now:
    *   Create a new theme: `fdk theme new`
    *   Initialize an existing theme: `fdk theme init`
    *   Set up a new extension: `fdk extension init`
    *   Explore other commands using `fdk --help` or refer to the [Commands Reference](#commands-reference).

>**Note:** Experimental support for Windows is available, it may not be fully stable.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Coverage Status][coveralls-badge]]([coveralls-url])

</div>

### Quick Links & Resources
| Resource                 | Link                                                                 |
|--------------------------|----------------------------------------------------------------------|
| Fynd Platform            | [https://platform.fynd.com/](https://platform.fynd.com/)             |
| Fynd Partners            | [https://partners.fynd.com/](https://partners.fynd.com/)             |
| Partners Documentation   | [https://partners.fynd.com/help](https://partners.fynd.com/help)     |
| Platform Documentation   | [https://platform.fynd.com/help](https://platform.fynd.com/help)     |
| FDK CLI Commands Reference | [Commands Reference](#commands-reference)                            |
| Other Fynd Projects      | [Other Projects](#other-fynd-projects)                               |
| Contributing Guide       | [CONTRIBUTING.md](CONTRIBUTING.md)                                   |
| Community & Support      | Fynd Developer Community Forum (Link TBD) - Check official channels for tutorials. |

# Prerequisites

- You must have created a [partner account](https://partners.fynd.com/)
- You must have created development account [guide](https://partners.fynd.com/help/docs/partners/testing-extension/development-acc)
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
See the [Command reference](#commands-reference) for syntax details and usage examples of the commands.

## Project Structure

For those interested in understanding the codebase or contributing, here's a brief overview of the main directories:

*   `src/`: Contains the core source code for the FDK CLI.
    *   `src/commands/`: Houses the implementation for each CLI command (e.g., `login`, `theme new`, `extension init`). Each command typically has its own file.
    *   `src/lib/`: Includes core library functions and modules that provide the underlying logic for CLI operations, such as API interactions, file management, and business logic for themes and extensions.
    *   `src/helper/`: Contains utility functions and helper scripts used across various parts of the CLI, like logging, error handling, and configuration management.
*   `templates/`: Stores project templates that are used when you initialize a new theme or extension (e.g., `fdk theme new`, `fdk extension init`).
*   `documentation/`: This directory might contain additional documentation, guides, or resources related to the FDK CLI development or usage (though primary user documentation is in this README).

Understanding this structure can help you navigate the project and locate specific code if you plan to contribute or debug.

## Development Workflow

This section outlines the typical workflow when developing themes or extensions using the FDK CLI.

### 1. Setup & Initialization

*   **Login**: Ensure you are logged into the FDK CLI.
    ```sh
    fdk login
    ```
*   **Create or Initialize Project**:
    *   For a new theme:
        ```sh
        fdk theme new -n <your-theme-name>
        cd <your-theme-name>
        ```
    *   To initialize an existing theme:
        ```sh
        fdk theme init
        ```
    *   For a new extension:
        ```sh
        fdk extension init -n <your-extension-name>
        cd <your-extension-name>
        ```
    *   Ensure you have a development account and it's linked. Refer to [Prerequisites](#prerequisites).

### 2. Development & Local Preview

*   **Making Code Changes**: Modify the theme or extension files in your local project directory.
*   **Local Development Server**:
    *   For themes: Use `fdk theme serve` to start a local server with hot-reloading. This allows you to see your changes in real-time in your browser.
        ```sh
        fdk theme serve
        ```
    *   For extensions: Use `fdk extension preview` (or `fdk ext preview`) to start a local server. This command often uses a tunnel service (like Cloudflare) to create a public URL for your local development server, which is then used as the extension's launch URL on the development store.
        ```sh
        fdk extension preview
        ```
        You might need to specify your company ID or other options if not set globally.

### 3. Testing & Synchronization

*   **Theme Synchronization**: To see your local theme changes reflected on your development store (without making it live to all users), you can sync your local files.
    ```sh
    fdk theme sync
    ```
    After syncing, you can usually preview the changes via the Fynd Platform panel for your development store. Use `fdk theme open` to get preview links.
*   **Extension Preview**: The `fdk extension preview` command typically updates the extension's launch URL on your development company. You can then test the extension within the context of a Fynd Platform store by accessing it through the platform interface or a direct preview link if provided.
*   **Populate Sample Data**: For easier testing, especially for new themes or extensions, you can populate your development account with sample data:
    ```sh
    fdk populate
    ```

### 4. Deployment & Packaging

*   **Theme Packaging**: Once your theme development is complete and tested, package it into a ZIP file for upload to the Fynd Partners panel.
    ```sh
    fdk theme package
    ```
    This package can then be submitted for review or published to the marketplace.
*   **Extension Deployment**:
    *   For extensions, the deployment process usually involves ensuring your code is pushed to a repository (if applicable) and that your extension settings (like launch URLs, API keys) are correctly configured in the Fynd Partners panel.
    *   For extension bindings, you might use commands like `fdk binding draft` to test on development companies and `fdk binding publish` to make them live.

This workflow provides a general guideline. Specific commands and steps might vary based on your project's nature and requirements. Always refer to the detailed [Commands Reference](#commands-reference) for more options and specific use cases.

## Command Overview
___

The FDK CLI provides a range of commands to assist in your development. Below is a summary of command groups. For detailed syntax and options for each command, please refer to the [Commands Reference](#commands-reference) section.

### Global Commands
| Command        | Description           |
| ------------- |-------------|
| [login](#login)     | Login to your Fynd Platform account. |
| [user](#user)     | Shows user details of the logged-in user. |
| [logout](#logout)     | Logout from your Fynd Platform account. |
| [populate](#populate)     | Populate sample data into your development account. |
| [tunnel](#tunnel) | Create a secure tunnel to your local development server. |

### Theme Commands
| Command        | Description           |
| ------------- |-------------|
| [new](#theme-new)     | Create a new theme from scratch. |
| [init](#theme-init)     | Initialize an existing theme on your local system.  |
| [serve](#theme-serve)     | Start a local development server for your theme with hot-reloading. |
| [sync](#theme-sync)     | Sync your local theme changes to your development store. |
| [pull](#theme-pull)     | Pull the latest theme code from your development store. |
| [pull-config](#theme-pull-config)     | Pull the latest theme configuration from your development store. |
| [open](#theme-open)    | Open preview links for your current theme. |
| [package](#theme-package)    | Package your theme into a ZIP file for deployment. |
| [context](#theme-context)     | Add or manage theme contexts (e.g., for different environments or applications). |
| [context-list](#theme-context-list)     | List all available theme contexts. |
| [active-context](#theme-active-context)    | Show the currently active theme context. |

### Extension Commands
| Command        | Description           |
| ------------- |-------------|
| [init](#extension-init)     | Initialize a new extension using available templates.  |
| [preview](#extension-preview-url)   | Start a local server and tunnel to preview your extension. |
| [pull-env](#extension-pull-env)     | Pull extension environment variables from the Fynd Partners panel. |
| [launch-url](#extension-launch-url)     | Get or set your extension's launch URL. |

### Extension Binding Commands
| Command        | Description           |
| ------------- |-------------|
| [init](#binding-init)     | Initialize a new extension section binding using available templates.  |
| [draft](#binding-draft)     | Create a draft version of your section binding for testing.
| [publish](#binding-publish)     | Publish your section binding to make it live.
| [preview](#binding-preview)     | Serve your local extension binding for preview on a live storefront.
| [show-context](#binding-show-context)     | Show the current extension section context.
| [clear-context](#binding-clear-context)     | Clear the current extension section context.

### Config Commands
| Command Type | Description                          |
|--------------|--------------------------------------|
| [set](#config-set-commands)        | Set CLI configuration values.            |
| [get](#config-get-commands)        | Retrieve current CLI configuration values.|
| [delete](#config-delete-commands)  (alias: `rm`)    | Delete CLI configuration values.         |

<div id="debugMode"></div>

## Debug Mode
When troubleshooting, use the `--verbose` flag (or `-v`) with any command. This enables detailed logging to the console and creates a `debug.log` file in your current working directory. This log file is invaluable for diagnosing issues and can be shared with maintainers if you need further assistance.
#### **Example**
```sh
fdk login --verbose
```

<div id="commands-reference"></div>

## Commands Reference
All commands, their options, and usage examples are detailed below.
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

By default Server-side rendering is enable. To disable it use `--ssr false` with the serve command.
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
This command is used to sync your local theme changes to your development store.
#### **Syntax**
```sh
fdk theme sync
```
Always verify if you have set the correct context before syncing your theme. Refer to the [context](#theme-context) commands.

___
<div id="theme-pull"></div>

#### **pull**
This command is used to pull the latest theme code from your development store.
#### **Syntax**
```sh
fdk theme pull
```
___
<div id="theme-pull-config"></div>

#### **pull-config**
This command is used to pull the latest theme configuration from your development store.
#### **Syntax**
```sh
fdk theme pull-config
```
___

<div id="theme-package"></div>

#### **package**
This command is used to package your theme into a ZIP file for deployment.
#### **Syntax**
```sh
fdk theme package
```
___
<div id="theme-open"></div>

#### **open**
This command is used to open preview links for your current theme in the browser.
#### **Syntax**
```sh
fdk theme open
```
### Extension Commands
Extensions are pluggable code snippets that enhance the functionality of your applications. They can be installed on websites built using Fynd Platform. To learn more, visit [Fynd Partners](https://partners.fynd.com/).

<div id="extension-init"></div>

#### **init**
This command is used to initialize a new extension, creating the basic project structure and necessary dependencies. It will also register the extension for you on your partner account.

#### **Syntax**
```sh
fdk extension init [options]
```
#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| --target-dir    | Target directory for the new extension project. |
| --template    | Specify the template (e.g., `node-vue`, `java-react`) to use for the extension. |
| --help    | Show help for this command. |
| --verbose | Enable debug mode for detailed logging. |

#### **Example**
```sh
fdk extension init --target-dir ./my-new-extension
```
```sh
fdk extension init --template node-react
```
Available templates typically include:
*   `node-vue`
*   `node-react`
*   `java-vue`
*   `java-react`
___
<div id="extension-preview-url"></div>

#### **preview**
This command starts a local development server for your extension and provides a public preview URL (often using a tunnel like Cloudflare). This URL can be used to launch or install the extension on a development company for testing.

#### **Syntax**
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
| --custom-tunnel | Use this option when you want to use custom tunnel url. |
| --port | Specify the port number on which the application is listening. This option is mandatory if  tunnel URL option is provided. |
| --no-auto-update | Disables auto-updating of tunnel URL as extension launch url on partners panel |
| --reset | Resets the extension's context data, prompting you to re-enter all required details. Useful for a fresh start! |
| --help    | Show help |
| --verbose | Enables debug mode, providing detailed logs for troubleshooting. |

#### **Example**
```sh
fdk extension preview
```
```sh
fdk extension preview --company-id 999
```
To start a preview with a custom URL and port:
```sh
fdk extension preview --tunnel-url https://custom-tunnel-url.com --port 8080
```

- **Automatic Tunnel Creation**: If no options related to the tunnel URL and port are provided, the command will automatically use **Cloudflared** as the tunneling tool.
  
- **Custom Tunnel URL**: If you wish to use a custom tunnel URL, you can provide it using the `--tunnel-url` option. In this case, you must also specify the port using the `--port` option.

- **Interactive Prompt**: If `--custom-tunnel` option is provided, the command will prompt you to enter the tunnel URL listening on a provided port number.

- If you pass Tunnel URL, it will not created new tunnel and use the passed url as tunnel url.

___


<div id="extension-pull-env"></div>

#### **pull-env**
This command will fetch the extension's context details (environment variables) from the Fynd Partners panel and update your local extension context.

#### **Syntax**
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
This command is used to get or set the launch URL of your extension. The launch URL is the endpoint where your extension is hosted and accessed.
#### **Syntax**
```sh
fdk extension launch-url <get|set> [options]
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

Set the active environment before running extension binding commands if you are working with multiple environments:
```sh
fdk env set -u api.fynd.com
```


<div id="binding-init"></div>

#### **init**
This command initializes a new extension binding project, creating a basic boilerplate structure with necessary dependencies (e.g., for Vue 2 or React).
#### **Syntax**
```sh
fdk binding init [options]
```
#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name for your section binding. |
| -i, --interface    | (Optional) Interface where this binding will be used (e.g., Web Theme). Currently, Web Theme is the primary supported interface. |
| -f, --framework | (Optional) JavaScript framework for the binding (e.g., `vue2`, `react`). |

#### **Example**
```sh
fdk binding init --name my-custom-slider --framework vue2
```
___
<div id="binding-draft"></div>

#### **draft**
This command creates a draft version of your extension binding. This draft is typically registered with your development companies, allowing for alpha or beta testing before publishing.

#### **Syntax**
```sh
fdk binding draft [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding. |
| -f, --framework | (Optional) Runtime framework (e.g., `vue2`, `react`). |
| -id, --extensionId    | (Optional) Extension ID to which this binding belongs. |
| -org, --organisationId    | (Optional) Organisation ID associated with the extension. |


#### **Example**
```sh
fdk binding draft
```
___

<div id="binding-publish"></div>

#### **publish**
This command publishes your extension binding, making it live across all companies where the associated extension is installed. Ensure thorough testing before publishing.

#### **Syntax**
```sh
fdk binding publish [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding. |
| -f, --framework | (Optional) Runtime framework (e.g., `vue2`, `react`). |
| -id, --extensionId    | (Optional) Extension ID to which this binding belongs. |
| -org, --organisationId    | (Optional) Organisation ID associated with the extension. |


#### **Example**
```sh
fdk binding publish
```
___

<div id="binding-preview"></div>

#### **preview**
This command allows developers to locally serve an extension binding and preview its appearance and behavior on a live storefront, typically using a tunnel for secure access.

#### **Syntax**
```sh
fdk binding preview [options]
```

#### **Command Options**
| Option        | Description           |
| ------------- |-------------|
| -n, --name    | (Optional) Name of the section binding. |
| -f, --framework | (Optional) Runtime framework (e.g., `vue2`, `react`). |
| -id, --extensionId    | (Optional) Extension ID to which this binding belongs. |
| -org, --organisationId    | (Optional) Organisation ID associated with the extension. |


#### **Example**
```sh
fdk binding preview
```

___

<div id="binding-show-context"></div>

#### **show-context**
This command displays the current context (configuration and settings) for the active extension section binding.

#### **Syntax**
```sh
fdk binding show-context
```
___

<div id="binding-clear-context"></div>

#### **clear-context**
This command clears the current context for the active extension section binding, potentially resetting it to default values.

#### **Syntax**
```sh
fdk binding clear-context
```
___
### Config Commands
These commands allow you to manage the CLI's own configuration settings.
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

## Troubleshooting

If you encounter any issues while using the FDK CLI, consider the following steps:

*   **Enable Verbose Logging**: As detailed in the [Debug Mode](#debugMode) section, most commands support a `--verbose` flag (or `-v`). This provides detailed console output and generates a `debug.log` file in your current working directory. This log is essential for diagnosing problems.
    ```sh
    fdk <command> --verbose
    ```
*   **Check the `debug.log` File**: This file contains specific error messages, API request/response details (if applicable), and stack traces that can help pinpoint the source of an issue.
*   **Verify Prerequisites**: Ensure all items in the [Prerequisites](#prerequisites) section are met, especially Node.js version and account setup.
*   **Consult Documentation**: Review the relevant command in the [Commands Reference](#commands-reference) for correct syntax and options.
*   **Check Network Connectivity**: Some commands require internet access to communicate with Fynd Platform services.

Below are solutions to some specific known issues:

### Cloudflare Tunnel Startup Issue on Apple Silicon Machines

When attempting to start a Cloudflare tunnel using the `fdk tunnel` or `fdk ext preview` commands, users on Apple Silicon machines may encounter difficulties due to the Cloudflare binary's compatibility requirements.

**Solution:** Install Rosetta, which allows you to run applications that contain x86_64 instructions on Apple Silicon. You can do this by executing the following command in your terminal:

```shell
softwareupdate --install-rosetta
```

This command prompts your system to install Rosetta, resolving the compatibility issue and allowing the Cloudflare tunnel to run smoothly on your machine.

## Other Fynd Projects
Explore other open-source projects from Fynd:

| Project                 | Link                                                                                      | Description                                      |
|-------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------|
| **Nitrozen Vue**        | [![Know more](https://img.shields.io/badge/Nitrozen_Vue-blue.svg)](https://www.npmjs.com/package/@gofynd/nitrozen-vue) | Vue component library for Fynd UIs.            |
| **Javascript SDK**      | [![fdk-client-javascript](https://img.shields.io/badge/JavaScript_SDK-blue.svg)](https://github.com/gofynd/fdk-client-javascript) | JS SDK for Fynd Platform APIs.                 |
| **Extension SDK**       | [![fdk-extension-javascript](https://img.shields.io/badge/Extension_SDK-blue.svg)](https://github.com/gofynd/fdk-extension-javascript) | JS SDK specifically for building extensions.   |
| **Extension Bridge**    | [![fdk-extension-bridge-javascript](https://img.shields.io/badge/Extension_Bridge-blue.svg)](https://github.com/gofynd/fdk-extension-bridge-javascript) | Bridge for communication within extensions.    |

[npm-image]: https://img.shields.io/npm/v/@gofynd/fdk-cli.svg?color=blue&style=flat-square
[npm-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[downloads-image]: https://img.shields.io/npm/dm/@gofynd/fdk-cli.svg?style=flat-square
[downloads-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[coveralls-badge]: https://img.shields.io/coveralls/github/gofynd/fdk-cli/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/gofynd/fdk-cli?branch=master

---

<div id="Contributing"></div>

## Contributing

We welcome contributions to the FDK CLI! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started, including our code of conduct and development practices.

---
**Thank you for using FDK CLI!**
