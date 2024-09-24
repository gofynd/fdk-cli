# FDK CLI v6: Enhanced Extension Preview Command and Migration Guide

### About the New Extension Preview Command

The `fdk extension preview` command has been improved with several enhancements. The command works through a sequence of steps, as described below:

1. **Inputs**:  
   The command requires `Extension ID` and `Development Company ID` as inputs. It will check for these inputs in the following order:
   - Command flags such as `--api-key` and `--company-id`
   - Read from the `extension.context.json` file for `extension_id` and `development_company_id`
   - If no input is found, the command will prompt the user to manually select the extension and company.
   - The command will also need the `fdk.ext.config.json` file for `port` (optional, if not provided, it will use a random port), and for the `install` and `dev` commands.

2. **Handling Multiple Projects**:  
   If your project contains two `fdk.ext.config.json` files (e.g., separate projects for the frontend and backend of the extension), the system will treat them as distinct projects. Otherwise, it assumes both the frontend and backend are served from the same server.

3. **Dependency Installation**:  
   The command will run the `install` command specified in the config file to install dependencies for your project(s).

4. **Tunnel Management**:  
   If a tunnel URL is not provided via the `--tunnel-url` flag, the command will automatically start a new tunnel:
   - In a multi-project setup, the tunnel will start on the frontend service port. You’ll need to redirect traffic from your frontend server to the backend server. You can do this by adding a Vite proxy route to redirect traffic from the frontend to the backend server port. Refer to the [boilerplate](https://github.com/gofynd/example-extension-react) for an example.

5. **Auto-Update Configuration**:  
   By default, the tunnel URL will automatically update in the partner panel unless the `--no-auto-update` flag is passed.

6. **Starting Servers**:  
   The command will execute the `dev` commands specified in the config file for both the frontend and backend. The following environment variables will be provided:
   - `FRONTEND_PORT`
   - `BACKEND_PORT`
   - `EXTENSION_API_KEY`
   - `EXTENSION_API_SECRET`
   - `EXTENSION_BASE_URL`

   If you need additional environment variables, you can provide them using a `.env` file.

7. **Accessing the Extension**:  
   Your extension will be accessible at the tunnel URL, which will be printed in the console.

---

### Migration Guide

To migrate from `fdk-cli` versions ≤ 5 to the new version 6, follow these steps:

1. **Add Configuration File**:  
   Add an `fdk.ext.config.json` file to your project. Refer to [the documentation](./fdk-extension-config.md) for more details on configuring this file.

2. **Proxy Backend Traffic**:  
   Configure your frontend project to accept backend traffic and redirect it to the backend server of your extension.
   - Use Vite’s proxy configuration for this. Check the [extension boilerplate](https://github.com/gofynd/example-extension-react) for a sample `vite.config.js` file.
