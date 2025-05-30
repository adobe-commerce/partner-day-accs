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
import { View, Flex, Heading, Text, NumberField, Switch, Footer, Button, ProgressCircle } from '@adobe/react-spectrum'
import React, { useEffect, useState } from 'react'
import { callGetAction, callPostAction } from '../utils'

export const Config = (props) => {

    const [maxAmount, setMaxAmount] = useState(0)
    const [enableStockValidation, setEnableStockValidation] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const response = await callGetAction(props, 'emea_partner_days_2025/get-config')
            if (response !== '') {
                setMaxAmount(response?.maxAmount ?? 0)
                setEnableStockValidation(response?.enableStockValidation ?? false)
            }
            setIsLoading(false)
        }
        fetchData()
    }, [props])

    const handleSave = async () => {
        setIsLoading(true)
        const body = {
            maxAmount,
            enableStockValidation
        }
        await callPostAction(props, 'emea_partner_days_2025/save-config', 'saveConfig', body)
        setIsLoading(false)
    }

    return (
        <View
            paddingX="size-250"
            paddingBottom="size-250"
            borderRadius="medium"
            borderWidth="thin"
            borderColor="gray-300"
        >
            {isLoading ? (
                <Flex alignItems="center" justifyContent="center">
                    <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
                </Flex>
            ) : (
                <View>
                    <Heading level={3}>
                        <Flex alignItems="center" gap="size-100">
                            <Text>Configuration</Text>
                        </Flex>
                    </Heading>
                    <Flex direction='column' gap='size-100' paddingY="size-200">
                        <Switch
                            isSelected={enableStockValidation}
                            onChange={setEnableStockValidation}>
                            Enable order stock validation
                        </Switch>
                        <NumberField
                            label={"Maximum amount for each item in an order"}
                            labelPosition='side'
                            value={maxAmount}
                            onChange={setMaxAmount}
                            inputMode='numeric'
                            isHidden={!enableStockValidation}
                            minValue={0}
                            step={1}
                            description="Only positive integer value allowed"
                        />
                    </Flex>
                    <Footer>
                        <Flex justifyContent="end" gap="size-100">
                            <Button variant="primary" onPress={handleSave}>Save</Button>
                        </Flex>
                    </Footer>
                </View>
            )}
        </View>
    )
}
