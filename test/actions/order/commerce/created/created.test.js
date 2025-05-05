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

const action = require('../../../../../actions/order/commerce/created')
jest.mock('../../../../../actions/utils')
const { checkMissingRequestInputs } = require('../../../../../actions/utils')

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

describe('Given order commerce created action', () => {
  describe('When method main is defined', () => {
    test('Then is an instance of Function', () => {
      expect(action.main).toBeInstanceOf(Function)
    })
  })
  describe('When order event is missing required inputs', () => {
    test('Then returns action error response', async () => {
      const params = {
        data: {}
      }

      const errorMessage = 'Missing required data'
      checkMissingRequestInputs.mockReturnValue(errorMessage)

      const response = await action.main(params)

      expect(response).toEqual({
        statusCode: 400,
        body: {
          success: false,
          error: errorMessage
        }
      })
    })
  })
})
