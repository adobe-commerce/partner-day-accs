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

const { checkMissingRequestInputs } = require('../../../actions/utils')

/**
 * Validate the received information
 *
 * @param {object} params input parameters
 * @returns {object} returns the success status and error message
 */
function validateData (params) {
  const requiredParams = ['order.items']
  const errorMessage = checkMissingRequestInputs(params, requiredParams, [])

  if (errorMessage) {
    return {
      success: false,
      message: errorMessage
    }
  }

  return {
    success: true
  }
}

module.exports = {
  validateData
}
