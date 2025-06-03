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

const HTTP_OK = 200
const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_ERROR = 500

const PUBLISH_EVENT_SUCCESS = 'OK'

const BACKOFFICE_PROVIDER_KEY = 'backoffice'
const SHIPMENT_CREATED_EVENT = 'be-observer.sales_order_shipment_create'

const ORDER_KEY_PREFIX = 'order-'
const STOCK_ITEM_QTY_KEY = 'stockItemQty'

module.exports = {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_ERROR,
  BACKOFFICE_PROVIDER_KEY,
  PUBLISH_EVENT_SUCCESS,
  SHIPMENT_CREATED_EVENT,
  ORDER_KEY_PREFIX,
  STOCK_ITEM_QTY_KEY
}
