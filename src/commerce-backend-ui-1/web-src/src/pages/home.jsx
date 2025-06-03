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
import React, { useState } from "react";
import { Flex, View} from "@adobe/react-spectrum";

import { LatestOrdersCard } from "../components/latest-orders-card";
import { ShipOrderCard } from "../components/ship-order-card";

/** Main component that displays the home page of the dashboard. */
export function Home(props) {
  const [orderIds, setOrderIds] = useState({});

  return (
    <View height="100%" overflow="auto">
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
  );
}
