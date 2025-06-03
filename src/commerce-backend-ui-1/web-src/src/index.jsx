/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import "core-js/stable";
import "regenerator-runtime/runtime";

import initExperienceCloudRuntime, { init } from "@adobe/exc-app";
import { createRoot } from "react-dom/client";

import React from "react";
import App from "./app";
import "./index.css";

/**
 * Get the root element from the DOM (where the app is rendered).
 * @returns {HTMLElement} The root element.
 */
function getRootElement() {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("Root element not found");
  }

  return container;
}

/**
 * Initialize the app to run in the Experience Cloud Shell.
 * @param {HTMLElement} container - The root element.
 */
function initialize(container) {
  const root = createRoot(container);
  try {
    // Try to load the Experience Cloud Runtime.
    require("./scripts/exc-runtime");
    init(() => {
      /** @type {ExcRuntime} */
      const experienceCloudRuntime = initExperienceCloudRuntime();
      experienceCloudRuntime.on("ready", ({ imsOrg, imsToken, imsProfile, locale }) => {
        experienceCloudRuntime.done();
        const ims = {
          profile: imsProfile,
          org: imsOrg,
          token: imsToken,
          locale,
        };
        root.render(<App runtime={experienceCloudRuntime} ims={ims}/>);
      });

      experienceCloudRuntime.title = "Extensibility Demo App";
      experienceCloudRuntime.solution = {
        icon: "AdobeExperienceCloud",
        title: "Extensibility Demo App",
        shortTitle: "Extensibility Demo App",
      };
    });
  } catch (_) {
    // If it fails, it means we're running outside of the Experience Cloud Shell.
    const mockRuntime = {
      on: () => {},
    };
    root.render(<App runtime={mockRuntime} ims={{}}/>);
  }
}

initialize(getRootElement());
