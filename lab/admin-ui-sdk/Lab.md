# Admin UI SDK Lab | EMEA Partner Days 2025

- [Objective](#objective)
- [Problem Statement](#problem-statement)
- [Helpful resources](#helpful-resources)
- [Step-by-Step instructions](#step-by-step-instructions)
  - [Step 1: Configuration files](#step-1-configuration-files)
  - [Step 2: Migrate from application to extension](#step-2-migrate-from-application-to-extension)
  - [Step 3: Register the menu extension point](#step-3-register-the-menu-extension-point)
  - [Step 4: Deploy the extension to the Stage workspace](#step-4-deploy-the-extension-to-the-stage-workspace)
  - [Step 5: Configure the Adobe Commerce Admin Panel](#step-5-configure-the-adobe-commerce-admin-panel)
  - [Step 6: Test the integration](#step-6-test-the-integration)
  - [Step 7: Add the configuration component](#step-7-add-the-configuration-component)
- [Troubleshooting](#troubleshooting)

## Objective

This lab provides hands-on experience with the Adobe Commerce Admin UI SDK by integrating a single-page application (SPA) into the Admin Panel interface, entirely through JavaScript; without requiring any PHP code.

## Problem statement

The single-page application (SPA) includes a configuration toggle that enables or disables stock validation rules, along with a parameter defining the maximum quantity allowed per item in an order. These settings are securely persisted in App Builder’s lib-files storage and retrieved at runtime to dynamically control webhook execution behavior.

## Helpful resources

- Most of required files are located in the `lab/admin-ui-sdk` folder to streamline setup and avoid time spent on boilerplate creation.
- [Admin UI SDK documentation](https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/)
- [Adobe App Builder Extensions documentation](https://developer.adobe.com/app-builder/docs/guides/app_builder_guides/extensions/extensions/)

## Step-by-Step instructions

### Step 1: Configuration files

1. Create the `install.yaml` file

    Place this file at the root of your project. Ensure it correctly targets the `commerce/backend-ui/1` extension point ID to register your application with the Adobe Commerce Admin Panel.

    > A sample file is available in the `lab/admin-ui-sdk` folder.

2. Create the `extension-manifest.json` file

    Also located at the root of your project, this file must define the `platform` as `"web"` and include a unique `name` and `id` for your extension.

    > A sample file is provided in the `lab/admin-ui-sdk` folder.

### Step 2: Migrate from application to extension

1. Create a new `src/commerce-backend-ui-1` folder.

2. Move the `actions` folder under `src/commerce-backend-ui-1`.

3. Move the `web-src` folder under `src/commerce-backend-ui-1`.

4. Create an `ext.config.yaml` file under `src/commerce-backend-ui-1` folder.

5. Copy the content under `application` from `app.config.yaml` file and paste it into `src/commerce-backend-ui-1/ext.config.yaml`. Adjust indentation to remove empty space before `actions`.

6. Append the `src/commerce-backend-ui-1/ext.config.yaml` to start with:

    ```yaml
    operations:
       view:
          - type: web
            impl: index.html
    ```

7. Append the `src/commerce-backend-ui-1/ext.config.yaml` with `web-src` below `actions` line:

    ```yaml
    web: web-src
    ```

    > A sample file `ext.config.yaml` is provided in the `lab/admin-ui-sdk/migration` folder.

8. Replace the `application` line in `app.config.yaml` with the following:

    ```yaml
    extensions:
       commerce/backend-ui/1:
          $include: src/commerce-backend-ui-1/ext.config.yaml
    ```

    > A sample file `app.config.yaml` is provided in the `lab/admin-ui-sdk/migration` folder.

9. Update the `src/commerce-backend-ui-1/actions/starter-kit-info/index.js` file to reference the correct path for the `version` and `registrations`:

    ```javascript
    const version = require('../../../../package.json').version
    const registrations = require('../../../../scripts/onboarding/config/starter-kit-registrations.json')
    ```

10. Run `npm install` if your dependencies are not up to date.

11. Run `aio app build --force-build` to make sure complitation is successful.

    ```bash
    ✔ Built 5 action(s) for 'commerce/backend-ui/1'
    ✔ Building web assets for 'commerce/backend-ui/1'
    ```

### Step 3: Register the menu extension point

1. Create the registration runtime action

    - Append the `ext.config.yaml` file to add the `admin-ui-sdk` package with a `registration` runtime action under `actions`.

        ```yaml
        admin-ui-sdk:
           license: Apache-2.0
           actions:
              registration:
                  function: actions/registration/index.js
                  web: 'yes'
                  runtime: 'nodejs:20'
                  inputs:
                     LOG_LEVEL: debug
                  annotations:
                     require-adobe-auth: true
                     final: true
        ```

    - Create the `registration/index.js` file under `actions` folder.

        > A sample file is provided in the `lab/admin-ui-sdk/registration` folder.

    - Open the `registration/index.js` and update the `seatNumber` constant with your assigned seat.

2. Create the ExtensionRegistration component

    The ExtensionRegistration component allows to register the application using the `adobe/uix-sdk`.

    Create the component under `web-src/src/components`.

    > A sample file `extension-registration.jsx` is provided in the `lab/admin-ui-sdk` folder.

3. Update the return component in the `extension-registration.jsx` file to return the home page.

    ```javascript
    return <Home ims={props.ims} runtime={props.runtime} />
    ```

4. Update the extension routing in the `app.jsx` file.

    ```javascript
    const routes = [
        {
        path: "/",
        pageComponent: <ExtensionRegistration ims={props.ims} runtime={props.runtime} />,
        },
    ];
    ```

5. Run `aio app build --force-build` to make sure complitation is successful for 6 runtime actions.

    ```bash
    ✔ Built 6 action(s) for 'commerce/backend-ui/1'
    ✔ Building web assets for 'commerce/backend-ui/1'
    ```

### Step 4: Deploy the extension to the Stage workspace

1. Verify the selected project & workspace by running the following command:

    `aio console where`

    Response example:

    ```bash
    You are currently in:
    1. Org: <your-org>
    2. Project: <your-project>
    3. Workspace: Stage
    ```

2. If the selected project is not the correct one, select the project using:

    `aio console project select`

3. If the selected workspace is not the correct one, select the workspace using:

    `aio console workspace select`

4. Open the developer console, go to your project, select the Stage workspace and make sure the `I/O Management API` is added. If not, click on `Add Service`, select `API` and select the `I/O Management API`.

    ![I/O Management API](../../docs/admin-ui-sdk/io-management-api.png)

5. In your project terminal, run the following command:

    `aio app use`

    > Make sure the selected org, project and workspace are correct. This step will create the `.env` and `.aio` files.

    Response example:

    ```bash
    A. Use the global Org / Project / Workspace configuration:
        1. Org: <your-org>
        2. Project: <your-project>
        3. Workspace: Stage
    B. Switch to another Workspace in the current Project
    ```

6. Build and deploy the extension using:

    `aio app deploy --force-build --force-deploy`

    You'll see that the project is now deployed to a new extension point:

    ```bash
    New Extension Point(s) in Workspace 'Stage': 'commerce/backend-ui/1'
    ```

### Step 5: Configure the Adobe Commerce Admin Panel

1. Go the Adobe Commerce Admin Panel.

2. Navigate to Stores > Settings > Configuration > Adobe Services > Admin UI SDK.

    ![Enable Admin UI SDK config](../../docs/admin-ui-sdk/general-config.png)

3. Enable the Admin UI SDK.

4. Click on `Configure extensions` button.

    ![Eligible extensions config](../../docs/admin-ui-sdk/eligible-extensions.png)

5. Check that the selected workspace is the correct one (Stage).

6. Search for the name of your application and select it.

7. Click on Save and wait till you get a notification with the following message: "Extensions saved successfully."

    ![Extensions saved successfully](../../docs/admin-ui-sdk/extensions-saved-success.png)

### Step 6: Test the integration

1. In the menu, a new section `EMEA Partner Days` is created.

2. Click on the menu and find your application `Configuration`.

    ![Configuration menu](../../docs/admin-ui-sdk/configuration-menu.png)

3. Open the menu, it'll load your application from App Builder.

### Step 7: Add the configuration component

1. Create the `Config` component under `web-src/src/components`.

    > A sample file `config.jsx` is provided in the `lab/admin-ui-sdk` folder.

2. Copy the `utils.js` file from `lab/admin-ui-sdk` folder and add it under `web-src/src`. This files contains helpers to call runtime actions in the `config.jsx` file.

3. Create the `save-config` runtime action under the `emea_partner_days_2025` package in the `ext.config.yaml` file.

    ```yaml
    emea_partner_days_2025:
       license: Apache-2.0
       actions:
          save-config:
             function: actions/data/saveConfig.js
             web: 'yes'
             runtime: 'nodejs:20'
             inputs:
                LOG_LEVEL: debug
             annotations:
                require-adobe-auth: false
                final: true
    ```

4. Create `saveConfig.js` file for the runtime action under `actions/data`.

    > A sample file `saveConfig.js` is provided in the `lab/admin-ui-sdk/data` folder.

5. Update the `data/getConfig.js` file to load configuration from the `filesLib`.

    ```javascript
    const files = await filesLib.init()
    const stockValidationFile = await files.list('config/stock-validation.json')
    if (stockValidationFile.length) {
        let buffer = await files.read('config/stock-validation.json')
        stockValidationConfig = JSON.parse(buffer.toString())
    }
    ```

    Don't forget the require part:

    ```javascript
    const filesLib = require('@adobe/aio-lib-files')
    ```

    > A sample file `getConfig.js` is provided in the `lab/admin-ui-sdk/data` folder.

6. Update the `home.jsx` file to include the `Config` component. Here's a suggested layout:

    ```javascript
    <View height="100%" overflow="auto">
      <Flex direction="row" gap="size-200">
        <View width='50%'>
          <LatestOrdersCard ims={props.ims}/>
        </View>
        <View width='50%'>
          <Config ims={props.ims} />
        </View>
      </Flex>
    </View>
    ```

7. Build and deploy the extension using:

    `aio app deploy --force-build --force-deploy`

8. Refresh the Admin panel page and you'll see the changes with the config component.

9. You can now change the configuration values, save it and test the webhook.

## Troubleshooting

### 1. Org is not selected

- When running `aio console where` if the org is not selected, you can run `aio console org select` and find your org.

- If the org is not found in the list, logout using `aio auth logout` and login using `aio auth login`. Then run `aio console org select`.

- If you're still not finding the correct org, logout with `aio auth logout` and force login using `aio auth login -f`. Then run `aio console org select`.

- If none of the above steps are woking, please reach out to an available technical assistant for help.

### 2. Application is not found in the `Configure extensions` screen

- Check that the selected workspace is the correct one, and click on `Apply` button to reload all applications.

- Make sure you deployed your changes to the correct workspace. You can run `aio console where` for more details on the selected org, project and workspace.

- Check your `.env` file is updated and pointing to the correct project and workspace. If not, run `aio app use`, then deploy again `aio app deploy --force-build --force-deploy`.

- If none of the above steps are woking, please reach out to an available technical assistant for help.

### 3. Menu is not appearing in the Adobe Commerce Admin Panel

- Check that the application is selected in the `Configure extensions` screen.

- Go to Stores > Settings > Configuration > Adobe Services > Admin UI SDK, and in the general configuration section click on `Refresh registrations` button. Once you get a banner notification confirming registrations are refreshed successfully, check your menu.

- If none of the above steps are woking, please reach out to an available technical assistant for help.
