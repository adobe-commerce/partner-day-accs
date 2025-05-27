/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Payment Session Creation Module
 *
 * This module simulates the session creation process of a payment gateway.
 * It generates a unique session ID and stores it in the state management system
 * for later validation during the payment process.
 *
 * Key features:
 * - Generates unique session IDs using UUID v4
 * - Stores session state for payment validation
 * - Implements error handling and logging
 * - Returns standardized responses
 */

const { Core } = require('@adobe/aio-sdk')
const uuid = require('uuid')
const stateLib = require('@adobe/aio-lib-state')
const { actionSuccessResponse, actionErrorResponse } = require('../responses')
const { HTTP_OK, HTTP_INTERNAL_ERROR } = require('../constants')

/**
 * Creates a new payment session
 *
 * @param {Object} params - The parameters object
 * @param {string} [params.LOG_LEVEL='info'] - The logging level
 * @returns {Object} Response object containing the payment session ID
 */
async function main(params) {
  // Initialize logger with the specified log level or default to 'info'
  const logger = Core.Logger('payment-method', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Starting payment session creation process')

    // Initialize the state management system
    // This will use the default region 'amer' and implicit I/O Runtime credentials
    const state = await stateLib.init()
    logger.info('State management system initialized')

    // Generate a unique session ID using UUID v4
    const paymentSessionId = uuid.v4()
    logger.info(`Generated payment session ID: ${paymentSessionId}`)

    // Store the session ID in the state management system
    // The sessionId is used as the key in the state management system
    // This allows for efficient lookup and validation of the session during payment processing
    // When validating a payment, we can quickly check if the sessionId exists in the state
    await state.put(paymentSessionId, "true")
    logger.info('Payment session stored in state management system')

    // Return success response with the session ID
    logger.info(`Session creation completed successfully with status: ${HTTP_OK}`)
    return actionSuccessResponse({
      paymentSessionId,
      message: 'Payment session created successfully'
    })
  } catch (error) {
    // Log the error with full details for debugging
    logger.error('Error during payment session creation:', error)

    // Return a standardized error response
    return actionErrorResponse(
      HTTP_INTERNAL_ERROR,
      `Failed to create payment session: ${error.message}`
    )
  }
}

exports.main = main
