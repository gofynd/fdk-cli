# FDK extension config file

## fdk.ext.config.json

- The `fdk.ext.config.json` file is a crucial configuration element in the development workflow for FDK extensions. This file is utilized by the `fdk extension preview` command to automate several essential tasks, including starting a tunnel, launching the server, and building the frontend, all in one streamlined step. The presence and location of this file help the `FDK CLI` determine the type of project you are working on.

- When you scaffold an extension using a provided template, an `fdk.ext.config.json` file is automatically generated in the `root` directory for backend projects and in the `/frontend` directory for frontend projects. If you prefer to run the backend and frontend server as separate processes, you can create individual `fdk.ext.config.json` files for each process. The FDK CLI will manage the startup of both processes and expects the frontend HTTP server to route traffic to the backend process accordingly.

- If your project structure includes a frontend located in some `subdirectory`, ensure that an `fdk.ext.config.json` file is placed within that specific subdirectory.

- For projects where both the frontend and backend applications are located at the root level (e.g., SSR projects), the `fdk.ext.config.json` file should be placed in the root directory.

- Additionally, if you need to override the default development command to build or preview your web application, you can specify a custom command within this configuration file.

### Examples
- For projects with both frontend and backend processes, you will have two separate fdk.ext.config.json files:

**Backend Configuration (fdk.ext.config.json)**
```
{
    "roles": ["backend"], // Indicates backend server
    "install": "npm install", // Install require dependecies
    "dev": "npm run start:dev" // Command to start backend server
}
```
**Frontend Configuration (fdk.ext.config.json)**
```
{
    "roles": ["frontend"], // Indicates frontend server
    "install": "npm install", // Install require dependecies
    "dev": "npm run start:dev" // Command to start frontend server
}
```
- For projects with single processes, you will have only one **fdk.ext.config.json** file:
```
{
    "roles": ["backend", "frontend"], // Indicates both frontend and backend server
    "install": "npm install", // Install require dependecies
    "dev": "npm run start:dev" // Command to start both frontend and backend server
}
```

### Parameters
| Property  | Required | Possible Values                                | Description                                                                                                                                                           |
|-----------|----------|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `roles`   | Yes      | `["frontend", "backend"]`, `["backend"]`, `["frontend"]` | A list of one or more roles for the process in the directory. For single-process projects, specify both `"frontend"` and `"backend"` in an array (e.g., `["frontend", "backend"]`). For multi-process projects, specify `"backend"` in the backend directory and `"frontend"` in the frontend directory. |
| `install` | Yes      | `npm install`, `yarn install`                  | The command to install all dependencies for the extension.                                                                                                             |
| `dev`     | Yes      | Defaults to `npm run start:dev`                | The command to start the extension's backend and frontend server with Hot Module Replacement (HMR).
| `port`     | No     | Defaults to a random port if not provided               | Specifies the port number for the development server. If a value is provided, the server will use the specified port. If not, the server will automatically assign a random port. |