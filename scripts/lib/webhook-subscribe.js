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

const { webhookSubscribe } = require('./commerce-eventing-api-client')

/**
 * This method subscribes to the webhook in ACCS
 * @param {object} webhookSpec - webhook specification
 * @param {object} environment - environment variables
 * @returns {object} - returns response object
 */
async function main (webhookSpec, environment) {
  try {
    await webhookSubscribe(
      environment.COMMERCE_BASE_URL + environment.TENANT_ID + '/',
      environment,
      webhookSpec
    )
    return {
      code: 200,
      success: true
    }
  } catch (error) {
    const errorMessageReason = error.response.body?.message !== undefined ?
        error.response.body.message + ' : ' + error.response.body?.parameters : error.message

    const errorMessage = `Unable to complete the process of webhook subscription: ${errorMessageReason}`
    console.log(errorMessage)
    return {
      code: 500,
      success: false,
      error: errorMessage
    }
  }
}

exports.main = main
