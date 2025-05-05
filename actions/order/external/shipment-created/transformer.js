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

/**
 * Transforms incoming items
 * @param {(Object|Array)} items - incoming items
 * @returns {Array} - transformed items
 */
function transformItems (items) {
  if (typeof items === 'object') {
    items = Object.values(items)
  }
  return items.map(item => (
    {
      order_item_id: item.item_id,
      qty: item.qty_ordered
    }
  ))
}

/**
 * This function transform the received shipment data from external back-office application to Adobe commerce
 *
 * @param {object} params - Data received from Adobe commerce
 * @returns {object} - Returns transformed data object
 */
function transformData (params) {
  return {
    items: transformItems(params.data.items),
    tracks: [{
      title: 'OOPE Shipment',
      carrier_code: 'OOPE Carrier',
      track_number: params.data.trackNumber
    }],
    comment: {
      comment: 'Shipment created from external back-office application',
      is_visible_on_front: 0
    }
  }
}

module.exports = {
  transformData
}
