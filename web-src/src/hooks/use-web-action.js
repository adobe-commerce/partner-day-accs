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
import { useState, useEffect } from "react";
import deepmerge from "deepmerge";
import ky from "ky";

import config from "../config.json";

/**
 * @template T
 * @typedef {[T, (value: T | ((prevState: T) => T)) => void]} UseStateHook
 */

/**
 * Formats a date as a relative time string.
 * @param {Date | null} lastChecked The date to format
 * @returns {string} The formatted relative time string
 */
export function formatRelativeTime(lastChecked) {
  if (!lastChecked) {
    return "";
  }

  const diffInSeconds = (new Date().getTime() - lastChecked.getTime()) / 1000;

  if (diffInSeconds < 60) {
    return "just now";
  }

  return new Intl.RelativeTimeFormat("en-US").format(
    -Math.round(diffInSeconds / 60),
    "minutes",
  );
}

/**
 * Hook to invoke a web action and return whether the action was successful or not and the result.
 * @type {UseWebActionHook}
 */
export const useWebAction = (name, params = {}, authHeaders = {}) => {
  const actionUrl = config[name];
  const [status, setStatus] = useState("idle");
  const [lastRun, setLastRun] = useState("never");

  /** @type {UseStateHook<Date | null>} */
  const [lastRunDate, setLastRunDate] = useState(null);

  /** @type {UseStateHook<import("ky").KyResponse<InvokeResult> | null>} */
  const [response, setResponse] = useState(null);

  /** @type {UseStateHook<InvokeResult | null>} */
  const [result, setResult] = useState(null);

  /**
   * Invokes the web action.
   * @param {import("ky").Options} [overrideParams] The parameters to pass to the web action.
   * @returns {Promise<void>}
   */
  async function invokeAction(overrideParams = params) {
    setStatus("running");

    /** @type {Record<string, string>} */
    const devHeaders =
      window.location.hostname === "localhost"
        ? { "x-ow-extra-logging": "on" }
        : {};

    try {
      const {
        method = 'POST',
        headers,
        ...rest
      } = deepmerge(params, overrideParams);

      const response = await ky(actionUrl, {
        method,
        headers: {
          ...devHeaders,
          ...headers,
          ...authHeaders
        },

        ...rest,
      });

      const lastRunDate = new Date();

      // Successfully fetched the action.
      setResponse(response);
      setLastRunDate(lastRunDate);
      setStatus("idle");
    } catch (error) {
      // Error while fetching (not the action.)
      const lastRunDate = new Date();

      // Reset the response and status.
      setResponse(null);
      setLastRunDate(lastRunDate);
      setStatus("idle");
    }
  }

  useEffect(() => {
    /** Handles the response from the web action. */
    async function handleResponse() {
      if (response) {
        const responseData = await response.json();
        setResult(responseData);
      }
    }

    handleResponse();
  }, [response]);

  useEffect(() => {
    /** Updates the last run time. */
    function updateLastRun() {
      if (lastRunDate) {
        setLastRun(formatRelativeTime(lastRunDate));
      }
    }

    // Update the last run time every second.
    const interval = setInterval(updateLastRun, 1000);
    updateLastRun();

    return () => clearInterval(interval);
  }, [lastRunDate]);

  return {
    response,
    invokeAction,
    status,
    lastRun,
    result,
  };
};
