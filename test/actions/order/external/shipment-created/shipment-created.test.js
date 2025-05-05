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
const mockStateInstance = {
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn()
}
jest.mock('@adobe/aio-lib-state', () => ({
  init: jest.fn().mockResolvedValue(mockStateInstance)
}))

jest.mock('../../../../../actions/order/external/shipment-created/validator')
const { validateData } = require('../../../../../actions/order/external/shipment-created/validator')

jest.mock('../../../../../actions/order/external/shipment-created/transformer')
const { transformData } = require('../../../../../actions/order/external/shipment-created/transformer')

jest.mock('../../../../../actions/order/external/shipment-created/sender')
const { sendData } = require('../../../../../actions/order/external/shipment-created/sender')

const action = require('../../../../../actions/order/external/shipment-created')
const { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_OK } = require('../../../../../actions/constants')

beforeEach(() => {
  mockStateInstance.get.mockReset()
  mockStateInstance.delete.mockReset()
  mockStateInstance.put.mockReset()
})

describe('Given order external shipment created action', () => {
  describe('When method main is defined', () => {
    test('Then is an instance of Function', () => {
      expect(action.main).toBeInstanceOf(Function)
    })
  })
  describe('When order shipment event data is invalid', () => {
    test('Then returns action error response', async () => {
      const IGNORED_PARAMS = { data: {} }
      const FAILED_VALIDATION_RESPONSE = {
        success: false,
        message: 'Data provided does not validate with the schema'
      }
      const ERROR_RESPONSE = {
        statusCode: HTTP_BAD_REQUEST,
        body: {
          success: false,
          error: 'Data provided does not validate with the schema'
        }
      }
      validateData.mockReturnValue(FAILED_VALIDATION_RESPONSE)
      expect(await action.main(IGNORED_PARAMS)).toMatchObject(ERROR_RESPONSE)
    })
  })
  describe('When order item data for the order id is not found', () => {
    test('Then returns action error response', async () => {
      const PARAMS = { data: {orderId: 1} }
      const SUCCESSFUL_VALIDATION_RESPONSE = {
        success: true
      }
      const ERROR_RESPONSE = {
        statusCode: HTTP_BAD_REQUEST,
        body: {
          success: false,
          error: 'Order item data not found for order with id: 1'
        }
      }
      validateData.mockReturnValue(SUCCESSFUL_VALIDATION_RESPONSE)
      mockStateInstance.get.mockImplementation(() => {return {value: '{}'}})
      expect(await action.main(PARAMS)).toMatchObject(ERROR_RESPONSE)
    })
  })
  describe('When an exception is thrown', () => {
    test('Then returns action error response', async () => {
      const IGNORED_PARAMS = { data: {orderId: 1} }
      const SUCCESSFUL_VALIDATION_RESPONSE = {
        success: true
      }
      const ERROR = new Error('generic error')
      const ERROR_RESPONSE = {
        statusCode: HTTP_INTERNAL_ERROR,
        body: {
          success: false,
          error: ERROR.message
        }
      }
      validateData.mockReturnValue(SUCCESSFUL_VALIDATION_RESPONSE)
      mockStateInstance.get.mockImplementation(() => {return {value: '{"items": [{"item_id": 1}]}'}})
      sendData.mockRejectedValue(ERROR)
      expect(await action.main(IGNORED_PARAMS)).toMatchObject(ERROR_RESPONSE)
    })
  })
  describe('When order shipment event data is valid', () => {
    test('Then returns action success response', async () => {
      const PARAMS = { data: {orderId: 1, id: 1, trackNumber: 'track234'} }
      const TRANSFORMED_DATA = { data: 'transformedData'}

      const SUCCESSFUL_VALIDATION_RESPONSE = {
        success: true
      }
      const SUCCESSFUL_SEND_DATA_RESPONSE = {
        success: true,
        response: 'anything'
      }
      const SUCCESS_RESPONSE = {
        statusCode: HTTP_OK,
        body: {
          success: true
        }
      }
      validateData.mockReturnValue(SUCCESSFUL_VALIDATION_RESPONSE)
      transformData.mockReturnValue(TRANSFORMED_DATA)
      mockStateInstance.get.mockImplementation(() => {return {value: '{"items": [{"item_id": 1, "qty_ordered": 1}]}'}})
      sendData.mockReturnValue(SUCCESSFUL_SEND_DATA_RESPONSE)
      expect(await action.main(PARAMS)).toMatchObject(SUCCESS_RESPONSE)
      expect(transformData).toHaveBeenCalledWith({
        data: {
          orderId: 1,
          id: 1,
          trackNumber: 'track234',
          items: [{item_id: 1, qty_ordered: 1}]
        }
      })
      expect(sendData).toHaveBeenCalledWith(PARAMS, TRANSFORMED_DATA)
    })
  })
})
