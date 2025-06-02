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
const { Core } = require('@adobe/aio-sdk')
const { checkMissingRequestInputs } = require('../../utils')
const { actionErrorResponse } = require('../../responses')
const filesLib = require('@adobe/aio-lib-files')

async function main(params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info(`Params: ${JSON.stringify(params)}`)
    const requiredHeaders = ['Content-Type']
    const requiredParams = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return actionErrorResponse(400, errorMessage)
    }

    let stockValidationConfig = {
      enableStockValidation: false,
      maxAmount: 0
    }

    const files = await filesLib.init()
    const stockValidationFile = await files.list('config/stock-validation.json')
    if (stockValidationFile.length) {
        let buffer = await files.read('config/stock-validation.json')
        stockValidationConfig = JSON.parse(buffer.toString())
    }

    return {
      statusCode: 200,
      body: stockValidationConfig
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      body: { error: error.message }
    }
  }
}

exports.main = main
