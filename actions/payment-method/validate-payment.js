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
 * This file contains the payment validation logic for Adobe Commerce.
 * It demonstrates how to:
 * 1. Validate payment sessions
 * 2. Handle payment method information
 * 3. Use Adobe I/O Runtime state management
 * 4. Implement proper error handling and logging
 */

const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')
const { webhookErrorResponse, webhookSuccessResponse } = require('../responses')

/**
 * Validates a payment session by checking if it exists in the state store
 *
 * @param {Object} paymentInfo - The payment information object
 * @param {string} paymentInfo.paymentSessionId - The unique identifier for the payment session
 * @returns {Promise<boolean>} - Returns true if the payment session is valid, false otherwise
 */
async function validatePaymentSession(paymentInfo) {
  // TODO: Replace this with actual payment gateway validation logic
  // This is a simplified example for demonstration purposes
  const { paymentSessionId } = paymentInfo;

  // Initialize state management
  const state = await stateLib.init();

  if (!paymentSessionId) {
    throw new Error('Payment session ID is required');
  }

  const paymentSession = await state.get(paymentSessionId);
  return Boolean(paymentSession?.value);
}

/**
 * Main action handler for payment validation
 * This function:
 * 1. Validates incoming payment information
 * 2. Checks payment session validity
 * 3. Returns appropriate webhook responses
 *
 * @param {Object} params - The parameters object containing:
 *   @param {string} params.payment_method - The type of payment method being used
 *   @param {Object} params.payment_additional_information - Additional payment details
 *   @param {string} [params.LOG_LEVEL='info'] - Optional log level for debugging
 * @returns {Object} Webhook response indicating success or failure
 */
async function main(params) {
  // Initialize logger with configurable log level
  const logger = Core.Logger('payment-method', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Starting payment validation process');
    // Extract payment information from params
    const {
      payment_method: paymentMethod,
      payment_additional_information: paymentInfo
    } = params;

    logger.info(`Processing payment method: ${paymentMethod}`, { paymentInfo });

    // Validate required payment information
    if (!paymentInfo) {
      logger.warn('Missing payment_additional_information in request', { paymentMethod });
      return webhookErrorResponse(
        'Payment information is required. Please provide payment_additional_information.'
      );
    }

    // Validate payment session
    const isValid = await validatePaymentSession(paymentInfo);

    if (!isValid) {
      logger.warn('Invalid payment session detected', { paymentInfo });
      return webhookErrorResponse('Payment session validation failed');
    }

    // Payment validation successful
    logger.info('Payment validation completed successfully', { paymentMethod });
    return webhookSuccessResponse();

  } catch (error) {
    // Enhanced error logging
    logger.error('Payment validation failed', {
      error: error.message,
      paymentMethod: params.payment_method
    });

    return webhookErrorResponse(
      `Payment validation error: ${error.message}`
    );
  }
}

exports.main = main
