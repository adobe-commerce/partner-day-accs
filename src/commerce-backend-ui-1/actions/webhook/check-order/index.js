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
const { HTTP_OK } = require('../../../actions/constants')
const Openwhisk = require('../../openwhisk')
const { validateData } = require('./validator')
const { checkOrderLimit } = require('./order')
const { stringParameters } = require('../../utils')
const { webhookErrorResponse, webhookSuccessResponse } = require('../../responses')

/**
 * This web action is used to check stock of cart items on real time.
 *
 * @param {object} params - method params includes environment and request data
 * @returns {object} - response with success status and result
 */
async function main (params) {
  const logger = Core.Logger('webhook-check-order', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('Start processing request')
    logger.debug(`Webhook main params: ${stringParameters(params)}`)

    const validationResult = validateData(params)
    if (!validationResult.success) {
      logger.error(`Validation failed with error: ${validationResult.message}`)
      return webhookErrorResponse(validationResult.message)
    }

    const openwhiskClient = new Openwhisk(params.API_HOST, params.API_AUTH)
    const res = await openwhiskClient.invokeAction('stock-config/get-config', {
      __ow_headers: params.__ow_headers
    })

    logger.debug(`Stock validation config: ${stringParameters(res)}`)
    const checkIsValidResult = await checkOrderLimit(params.order, res.response.result.body)
    if (!checkIsValidResult.success) {
      logger.error(`${checkIsValidResult.message}`)
      return webhookErrorResponse(checkIsValidResult.message)
    }

    logger.info(`Successful request: ${HTTP_OK}`)
    return webhookSuccessResponse()
  } catch (error) {
    logger.error(`Server error: ${error.message}`, error)
    return webhookErrorResponse('Order could not be validated.')
  }
}

exports.main = main
