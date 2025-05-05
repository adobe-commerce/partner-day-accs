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
const stateLib = require('@adobe/aio-lib-state')
const {Core} = require("@adobe/aio-sdk");
const { STOCK_ITEM_QTY_KEY } = require('../../../actions/constants')

/**
 * This method check the stock of received items in an external backoffice application
 * @param {object} params include the parameters received in the runtime action
 * @returns {object} success status and error message
 */
async function checkOrderLimit (params) {
  const logger = Core.Logger('webhook-check-order', { level: params.LOG_LEVEL || 'debug' })
  // @TODO implement the logic to check authentication with you external application
  // @TODO return { success: false, message: 'error message'} in case of failure

  const state = await stateLib.init()
  const stockItemQty = (await state.get(STOCK_ITEM_QTY_KEY))?.value || 3
  logger.debug(`${STOCK_ITEM_QTY_KEY}: ${stockItemQty}`)

  let isValid = true;
  let listOfInvalidItems = [];
  params.items.forEach(item => {
    if (item.qty_ordered > stockItemQty) {
      isValid = false;
      listOfInvalidItems.push(item);
    }
  });

  if (isValid) {
    return {
      success: true
    }
  }

  return {
    success: false,
    message: `The following items have exceeded the item order limit: ${listOfInvalidItems.map(item => item.sku).join((','))}`
  }
}

module.exports = {
  checkOrderLimit
}
