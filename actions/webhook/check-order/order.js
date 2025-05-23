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
const { checkMissingRequestInputs } = require('../../../actions/utils')

/**
 * This method check the stock of received items in an external backoffice application
 * @param {object} params include the parameters received in the runtime action
 * @param {object} stockValidationConfig the current stock validation configuration
 * @returns {object} success status and error message
 */
async function checkOrderLimit (params, stockValidationConfig) {
  const logger = Core.Logger('webhook-check-order', { level: params.LOG_LEVEL || 'debug' })

  const errorMessage = checkMissingRequestInputs(stockValidationConfig, ['enableStockValidation', 'maxAmount'], [])
  if (errorMessage) {
    return {
      success: false,
      message: 'Failed to read stock validation configuration'
    }
  }

  if (!stockValidationConfig.enableStockValidation) {
    return {
      success: true
    }
  }
  logger.debug(`Validating order items' quantity is less than: ${stockValidationConfig.maxAmount}`)

  let isValid = true
  const listOfInvalidItems = []
  params.items.forEach(item => {
    if (item.qty_ordered > stockValidationConfig.maxAmount) {
      isValid = false
      listOfInvalidItems.push(item)
    }
  })

  if (isValid) {
    return {
      success: true
    }
  }

  return {
    success: false,
    message: `The following items have exceeded the item quantity limit: ${listOfInvalidItems.map(item => item.sku).join((','))}`
  }
}

module.exports = {
  checkOrderLimit
}
