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
const uuid = require('uuid')
const stateLib = require('@adobe/aio-lib-state')
const { actionSuccessResponse, actionErrorResponse } = require('../responses')
const { HTTP_OK, HTTP_INTERNAL_ERROR } = require('../constants')

async function main (params) {
  const logger = Core.Logger('payment-method', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('Calling create session')
    // init with implicit I/O Runtime credentials, default region is 'amer'.
    const state = await stateLib.init()

    const paymentSessionId = uuid.v4()
    await state.put(paymentSessionId, "true")

    return actionSuccessResponse({
        paymentSessionId
    })
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return actionErrorResponse(HTTP_INTERNAL_ERROR, `Server error: ${error.message}`)
  }
}

exports.main = main
