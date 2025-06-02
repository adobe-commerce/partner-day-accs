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

const { Core, Events } = require('@adobe/aio-sdk')
const uuid = require('uuid')
const { CloudEvent } = require('cloudevents')
const { stringParameters, checkMissingRequestInputs, getBearerToken } = require('../../utils')
const { HTTP_INTERNAL_ERROR, HTTP_BAD_REQUEST, SHIPMENT_CREATED_EVENT } = require('../../constants')
const { actionErrorResponse, actionSuccessResponse } = require('../../responses')
const { getProviderByKey } = require('../../../utils/adobe-events-api')

/**
 * This web action is used to update the stock of a product.
 *
 * @param {object} params - method params includes environment and request data
 * @returns {object} - response with success status and result
 */
async function main (params) {
  const logger = Core.Logger('spa-create-shipment', { level: params.LOG_LEVEL || 'debug' })
  try {
    logger.info('Start processing request')
    logger.debug(`Received params: ${stringParameters(params)}`)

    // check for missing request input parameters and headers
    const requiredParams = ['data', 'OAUTH_CLIENT_ID', 'IO_CONSUMER_ID', 'IO_MANAGEMENT_BASE_URL']
    const requiredHeaders = ['Authorization', 'x-gw-ims-org-id']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      logger.info(errorMessage)
      // return and log client errors
      return actionErrorResponse(HTTP_BAD_REQUEST, errorMessage)
    }

    // extract the user Bearer token from the Authorization header
    const token = getBearerToken(params)
    const provider = await getProviderByKey(params, token, 'backoffice')
    // initialize the client
    const orgId = params.__ow_headers['x-gw-ims-org-id']
    const eventsClient = await Events.init(orgId, params.OAUTH_CLIENT_ID, token)

    // Create cloud event for the given payload
    const cloudEvent = createCloudEvent(provider.id, SHIPMENT_CREATED_EVENT, params.data)
    // Publish to I/O Events
    const published = await eventsClient.publishEvent(cloudEvent)
    let statusCode = 200
    if (published === 'OK') {
      logger.info('Published successfully to I/O Events')
    } else if (published === undefined) {
      logger.info('Published to I/O Events but there were not interested registrations')
      statusCode = 204
    }
    const response = {
      statusCode: statusCode,
    }    

    logger.debug('Process finished successfully')
    return actionSuccessResponse(response)
  } catch (error) {
    logger.error(`Server error: ${error.message}`, error)
    return actionErrorResponse(HTTP_INTERNAL_ERROR, error.message)
  }
}

function createCloudEvent(providerId, eventCode, payload) {
  let cloudevent = new CloudEvent({
    id: uuid.v4(),
    source: 'urn:uuid:' + providerId,
    datacontenttype: 'application/json',
    type: eventCode,
    data: payload
  })

  return cloudevent;
}

exports.main = main
