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
import React, { useState, useEffect } from "react";
import {
  View,
  Heading,
  Flex,
  Text,
  Button,
  TableView,
  TableBody,
  TableHeader,
  Cell,
  Column,
  Row
} from "@adobe/react-spectrum";

import { useWebAction } from "../hooks/use-web-action";

/**
 * A component to display details of the latest saved orders.
 * @param {Function} setOrderIds - Function to set the currently-selected order IDs.
 * @param {Object} ims - Credentials for the active IMS org.
 * @param {number} updateInterval - The interval in milliseconds to update the order list.
 * 
 */
export function LatestOrdersCard({
  setOrderIds,
  ims,
  updateInterval = 10000
}) {
  const headers = {}
  if (ims.token && !headers.authorization) {
      headers.authorization = 'Bearer ' + ims.token
  }
  if (ims.org && !headers['x-gw-ims-org-id']) {
      headers['x-gw-ims-org-id'] = ims.org
  }

  const { result, invokeAction } = useWebAction(
    "spa/get-orders",
    {},
    headers
  );

  const [orders, setOrders] = useState([])
  
  useEffect(() => {
    try {
      if (result) {
        result.sort((a, b) => a.entity_id - b.entity_id)
        setOrders(result)
      } else {
        invokeAction()
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }

    const intervalId = setInterval(invokeAction, updateInterval);
    return () => clearInterval(intervalId)
  }, [result]);

  return (
    <View
      paddingX="size-250"
      paddingBottom="size-250"
      borderRadius="medium"
      borderWidth="thin"
      borderColor="gray-300"
    >
      <Heading level={3}>
        <Flex alignItems="center" gap="size-100">
          <Text>Latest Orders Received</Text>
        </Flex>
      </Heading>
      <View>
        <Flex gap="size-100" alignItems="center">
          <TableView aria-label="Table with saved orders" flex width="100%" maxHeight="size-3000">
            <TableHeader>
              <Column>Order #</Column>
              <Column>Amount</Column>
              <Column>Item Count</Column>
              <Column>Status</Column>
              <Column>Actions</Column>
            </TableHeader>
            <TableBody>
              {orders && orders.map((order) => (
                <Row key={order.entity_id}>
                  <Cell>{order.increment_id}</Cell>
                  <Cell>{order.grand_total}</Cell>
                  <Cell>{order.total_item_count}</Cell>
                  <Cell>{order.status}</Cell>
                  <Cell>
                    {order.status === "pending"? (
                    <Button 
                      variant="secondary"
                      onPress={() => setOrderIds({
                        entity_id: order.entity_id,
                        increment_id: order.increment_id
                      })}
                    >
                      <Text>Ship</Text>
                    </Button>
                    ) : null }
                  </Cell>
                </Row>
              ))}
            </TableBody>
          </TableView>
        </Flex>
      </View>
    </View>
  );
}
