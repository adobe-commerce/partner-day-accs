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
import React, { useEffect, useState } from "react";
import { Flex, ProgressCircle, View } from "@adobe/react-spectrum";
import { attach } from '@adobe/uix-guest'

import { LatestOrdersCard } from "../components/latest-orders-card";
import { ShipOrderCard } from "../components/ship-order-card";
import { Config } from "../components/config";

/** Main component that displays the home page of the dashboard. */
export function Home(props) {
  const [orderIds, setOrderIds] = useState({});
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!props.ims.token) {
        const guestConnection = await attach({ id: 'stock_config' });
        props.ims.token = guestConnection?.sharedContext?.get('imsToken');
        props.ims.org = guestConnection?.sharedContext?.get('imsOrgId');
      }
      setIsLoading(false);
    };

    fetchCredentials();
  }, []);

  return (
    <View>
      {isLoading ? (
        <Flex alignItems="center" justifyContent="center" height="100vh">
          <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
        </Flex>
      ) : (
        <View height="100%" overflow="auto">
          <Flex direction="row" gap="size-200">
            <View width={'50%'}>
              <Flex direction="column" gap="size-200">
                <LatestOrdersCard
                  setOrderIds={setOrderIds}
                  ims={props.ims}
                />
                <ShipOrderCard
                  orderIds={orderIds}
                  setOrderIds={setOrderIds}
                  ims={props.ims}
                />
              </Flex>
            </View>
            <View width={'50%'}>
              <Config ims={props.ims} />
            </View>
          </Flex>
        </View>
      )}
    </View>
  )
}
