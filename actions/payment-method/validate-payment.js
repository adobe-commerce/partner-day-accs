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

const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')
const { webhookErrorResponse, webhookSuccessResponse  } = require('../responses')


async function main (params) {
  const logger = Core.Logger('payment-method', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('Calling validate-payment')
    // init with implicit I/O Runtime credentials, default region is 'amer'.
    const state = await stateLib.init()

    const { payment_method: paymentMethod, payment_additional_information: paymentInfo } = params;

    logger.info(`Payment method ${paymentMethod} with additional info.`, paymentInfo);


    if (!paymentInfo) {
      // payment_additional_information is set using the graphql mutation setPaymentMethodOnCart
      // see https://developer.adobe.com/commerce/webapi/graphql/schema/cart/mutations/set-payment-method/#paymentmethodinput-attributes
      logger.warn('payment_additional_information not found in the request', paymentMethod);
      return webhookErrorResponse('payment_additional_information not found in the request');
    }

    const { paymentSessionId } = paymentInfo;
    const res = await state.get(paymentSessionId) // res = { value, expiration }

    if (!res?.value) {
      return webhookErrorResponse(`Invalid payment session`)
    }

    // Check if the payment information is valid with the payment gateway, this is vendor specific
    logger.debug('Validated payment information successfully.', paymentMethod, paymentInfo);
    return webhookSuccessResponse();
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return webhookErrorResponse(`Server error: ${error.message}`)
  }
}

exports.main = main
