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

const openwhisk = require('openwhisk')

class Openwhisk {
  #openwhiskClient

  constructor (host, apiKey) {
    this.#openwhiskClient = openwhisk({ apihost: host, api_key: apiKey })
  }

  async invokeAction (action, data) {
    const { __ow_headers = {}, ...rest } = data
    return await this.#openwhiskClient.actions.invoke({
      name: action,
      blocking: true,
      params: {
        data: rest,
        __ow_headers
      }
    })
  }
}

module.exports = Openwhisk
