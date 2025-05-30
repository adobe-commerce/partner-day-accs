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
  TextField,
  Badge,
  ProgressCircle
} from "@adobe/react-spectrum";

import { useWebAction } from "../hooks/use-web-action";

import AlertCircle from "@spectrum-icons/workflow/AlertCircle";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";

/**
 * A component to allow the user to create shipments with a trackig number for a selected order.
 * @param {Object} orderIds - The currently-selected order IDs.
 * @param {Function} setOrderIds - Function to set the currently-selected order IDs.
 * @param {object} ims - Credentials for the active IMS org.
 */
export function ShipOrderCard({
  orderIds,
  setOrderIds,
  ims
}) {
  const headers = {}
  if (ims.token && !headers.authorization) {
      headers.authorization = 'Bearer ' + ims.token
  }
  if (ims.org && !headers['x-gw-ims-org-id']) {
      headers['x-gw-ims-org-id'] = ims.org
  }

  const [trackNumber, setTrackNumber] = useState("")
  const [showShipmentStatus, setShowShipmentStatus] = useState(false)

  useEffect(() => {
    setTrackNumber("")
    setShowShipmentStatus(false)
  }, [orderIds])

  const { status, lastRun, response, invokeAction } = useWebAction(
    "spa/create-shipment",
    {
      json: {
        data: {
          trackNumber: trackNumber,
          orderId: parseInt(orderIds.entity_id)
        },
      },
    },
    headers
  );

  if (Object.keys(orderIds).length == 0) {
    return null;
  }

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
          <Text>Ship Order</Text>
        </Flex>
      </Heading>

      <Text>
        Order number: {orderIds.increment_id}
      </Text>
      <View paddingY="size-200">
        <TextField width="100%" label={"Add tracking number"} value={trackNumber} onChange={setTrackNumber} />
      </View>

      <View paddingX="size-100">
        <Flex gap="size-100" justifyContent="right">
          {status === "running" ? (
            <Flex gap="size-100" alignItems="center">
              <ProgressCircle
                size="S"
                aria-label="Running..."
                isIndeterminate
              />
              <Text>Running...</Text>
            </Flex>
          ) : lastRun !== "never" && showShipmentStatus ? (
            response?.ok ? (
              <Badge variant="positive">
                <CheckmarkCircle size="S" />
                <Text>Shipment created</Text>
              </Badge>
            ) : (
              <Badge variant="negative">
                <AlertCircle size="S" />
                <Text>Shipment creation failed</Text>
              </Badge>
            )
          ) : null }
          <>
            <Button
              onPress={() => {
                setShowShipmentStatus(true)
                invokeAction()
              }}
              variant="accent"
              isDisabled={!trackNumber}
            >
              <Text>Ship</Text>
            </Button>
            <Button
              onPress={() => setOrderIds({})}
              variant="secondary"
            >
              <Text>Close</Text>
            </Button>
          </>
        </Flex>
      </View>
    </View>
  );
}
