<img src="https://res.cloudinary.com/dwzm9bysq/image/upload/v1576497695/addsale/applications/0.1914751846702707/media/company/pan/FDK_mdmpbd.png" height="200"></img>

## Fynd Development Kit

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM License][license-image]][license-url]
[![Build Status](https://travis-ci.org/gofynd/fdk-cli.svg?branch=master)](https://travis-ci.org/gofynd/fdk-cli)

<!-- [![Code Coverage][coveralls-image]][coveralls-url] -->

<!-- [![Test Coverage][coveralls-image]][coveralls-url] -->

## Installation

```sh
npm install -g @gofynd/fdk-cli
```

```sh
npx @gofynd/fdk-cli [command]
```

## Usage

| Command             |            Arguments            | Description                                           |
| :------------------ | :-----------------------------: | :---------------------------------------------------- |
| fdk --host          | api.addsale.com \| api.fynd.com | Set Theme Host                                        |
| fdk completion      |              null               | Generate autocompletion script                        |
| fdk theme init      |              null               | Initialize Theme                                      |
| fdk theme fetch     |              null               | Fetch current theme of app                            |
| fdk theme sync      |           --component           | Sync Theme to DB                                      |
| fdk theme sync-live |           --component           | Sync Theme Live to DB                                 |
| fdk theme pull      |              null               | Pull latest app theme                                 |
| fdk theme auth      |                                 | Authentication using App ID, Token & User Credentials |

#### NOTE

Autocomplete script to be pasted in ./bashrc or ./zshrc file depending on the shell.

```sh
echo 'AUTOCOMPLETE_SCRIPT_HERE' >>~/.bash_profile
```

### Single Line Command for init

```sh
fdk theme init --name [app_name] --email [demo@gmail.com] --password [your_password] --app-id [app_id] --app-token [app_token] --fetch [true | false] --dir [your-directory] --host [your_host]
```

Above command is available in the admin panel under the theme section.

### Single Line Command for auth

```sh
fdk theme auth --email [demo@gmail.com] --password [your_password] --app-id [app_id] --app-token [app_token] --host [your_host]
```

## Examples

|  Command   |          Example           |
| :--------: | :------------------------: |
| fdk --host | fdk --host api.addsale.com |
| fdk --host |  fdk --host api.fynd.com   |

[npm-image]: https://img.shields.io/npm/v/@gofynd/fdk-cli?color=blue
[npm-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[downloads-image]: https://img.shields.io/npm/dm/@gofynd/fdk-cli
[downloads-url]: https://www.npmjs.com/package/@gofynd/fdk-cli
[coveralls-image]: https://img.shields.io/coveralls/github/gofynd/fdk-cli?color=success
[coveralls-url]: https://coveralls.io/github/gofynd/fdk-cli
[travis-url]: https://travis-ci.org/gofynd/fdk-cli/
[license-image]: https://img.shields.io/npm/l/@gofynd/fdk-cli?color=success
[license-url]: https://github.com/gofynd/fdk-cli/blob/master/LICENSE
