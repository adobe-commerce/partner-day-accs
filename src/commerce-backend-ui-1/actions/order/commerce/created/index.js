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
const { Core } = require('@adobe/aio-sdk')
const { stringParameters } = require('../../../utils')
const { HTTP_INTERNAL_ERROR, HTTP_BAD_REQUEST, ORDER_KEY_PREFIX } = require('../../../constants')
const { validateData } = require('./validator')
const { actionErrorResponse, actionSuccessResponse } = require('../../../responses')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {

    // create a Logger
    const logger = Core.Logger('order-commerce-created', { level: params.LOG_LEVEL || 'info' })

    try {
        logger.info('Start processing request')
        logger.debug(`Received params: ${stringParameters(params)}`)

        const validationResult = validateData(params)
        if (!validationResult.success) {
          logger.error(`Validation failed with error: ${validationResult.message}`)
          return actionErrorResponse(HTTP_BAD_REQUEST, validationResult.message)
        }

        const state = await stateLib.init()
        await state.put(ORDER_KEY_PREFIX + params.data.entity_id, JSON.stringify(params.data))

        logger.debug('Process finished successfully')
        return actionSuccessResponse(`Order with commerce id ${params.data.entity_id} saved successfully`)
    } catch (error) {
        logger.error(`Server error: ${error.message}`)
        return actionErrorResponse(HTTP_INTERNAL_ERROR, error.message)
    }
}

exports.main = main
