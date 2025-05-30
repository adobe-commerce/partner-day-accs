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
import actions from './config.json'

export async function callPostAction(props, action, operation, body = {}, headers = {}) {
  const res = await fetch(actions[action], {
    method: 'POST',
    headers: appendMandatoryHeaders(headers, props),
    body: JSON.stringify({
      operation,
      ...body,
    })
  })

  return res.ok ? res.json() : '';
}

export async function callGetAction(props, action, headers = {}) {
  const res = await fetch(actions[action], {
    method: 'GET',
    headers: appendMandatoryHeaders(headers, props)
  })

  return res.ok ? res.json() : '';
}

function appendMandatoryHeaders(headers, props) {
  headers['x-gw-ims-org-id'] = props?.ims?.org ?? 'orgId'
  headers['Authorization'] = `Bearer ${props?.ims?.token ?? 'token'}`
  headers['Content-Type'] = 'application/json'
  return headers
}
