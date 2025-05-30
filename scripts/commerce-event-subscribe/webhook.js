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

require('dotenv').config()

/**
 * This method handles the commerce webhook subscribe script
 * @returns {object} - returns a response with successful and failed commerce webhook subscriptions
 */
async function main () {
  console.log('Starting the commerce webhook subscribe process')

  const result = {
    successful_subscriptions: [],
    failed_subscriptions: []
  }

  try {
    const commerceWebhookSubscriptions = require('./config/commerce-webhook-subscribe.json')
    for (const commerceWebhookSubscription of commerceWebhookSubscriptions) {
      const webhookSubscribeResult = await require('../lib/webhook-subscribe').main(commerceWebhookSubscription, process.env)
      const webhookName = commerceWebhookSubscription.webhook.webhook_method + ':' + commerceWebhookSubscription.webhook.webhook_type
      if (!webhookSubscribeResult.success) {
        let errorMessage = `Failed to subscribe to webhook: ${webhookName} with error: ${webhookSubscribeResult.error}`
        if (webhookSubscribeResult.error.includes('Response code 400 (Bad Request)')) {
          errorMessage += ' - Please make sure the webhook name is valid and the subscription payload is not malformed'
          errorMessage += ' - ' + webhookSubscribeResult.error
        }
        if (webhookSubscribeResult.error.includes('Response code 404 (Not Found)')) {
          errorMessage += ' - Make sure the latest version of the Webhook module is installed.'
        }
        console.log(errorMessage)
        result.failed_subscriptions.push(webhookName)
        continue
      }
      console.log(`Successfully subscribed to webhook: ${webhookName}`)
      result.successful_subscriptions.push(webhookName)
    }
    console.log('Finished the commerce webhook subscribe process with result', result)
    return {
      code: 200,
      success: true,
      result
    }
  } catch (error) {
    if (error?.code === 'MODULE_NOT_FOUND') {
      console.log('Failed to subscribe to webhooks with error: "commerce-webhook-subscribe.json" file not found. Make sure the file exists in the "scripts/commerce-event-subscribe/config" directory')
      return {
        code: 500,
        success: false,
        error: error.message
      }
    }
    if (error?.name === 'SyntaxError') {
      console.log('Failed to subscribe to webhooks with error: "commerce-webhook-subscribe.json" file is not a valid JSON file. Make sure the file in the "scripts/commerce-event-subscribe/config" directory contains well-formed JSON')
      return {
        code: 500,
        success: false,
        error: error.message
      }
    }
    console.log('Failed to subscribe to webhooks with error:', error)
    return {
      code: 500,
      success: false,
      error: error.message
    }
  }
}

exports.main = main
