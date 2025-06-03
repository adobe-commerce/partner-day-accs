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

const stateLib = require('@adobe/aio-lib-state')
const { Core } = require('@adobe/aio-sdk')
const { HTTP_INTERNAL_ERROR, HTTP_OK, ORDER_KEY_PREFIX } = require('../../constants')
const { actionErrorResponse } = require('../../responses')

/**
 * This web action is used to update the stock of a product.
 *
 * @param {object} params - method params includes environment and request data
 * @returns {object} - response with success status and result
 */
async function main (params) {
  const logger = Core.Logger('spa-get-orders', { level: params.LOG_LEVEL || 'debug' })
  try {
    logger.info('Start processing request')

    const state = await stateLib.init()
    const orders = []
    for await (const orderKeyList of state.list({ match: ORDER_KEY_PREFIX + '*' })) {
      for (const orderKey of orderKeyList.keys) {
        const order = await state.get(orderKey)
        try {
          const orderValueObject = JSON.parse(order.value)
          orders.push({
            entity_id: orderValueObject.entity_id,
            increment_id: orderValueObject.increment_id,
            grand_total: parseFloat(orderValueObject.grand_total).toFixed(2),
            total_item_count: orderValueObject.total_item_count,
            status: orderValueObject.status
          })
        }
        catch (error) {
          logger.debug(`Error parsing order with key: ${orderKey}`)
        }
      }
    }

    logger.debug('Process finished successfully')
    return {
      statusCode: HTTP_OK,
      body: orders
    }
  } catch (error) {
    logger.error(`Server error: ${error.message}`, error)
    return actionErrorResponse(HTTP_INTERNAL_ERROR, error.message)
  }
}

exports.main = main
