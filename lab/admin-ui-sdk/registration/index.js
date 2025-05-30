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

async function main() {
    const extensionId = 'emea_partner_days_2025'
    const seatNumber = '';

    return {
        statusCode: 200,
        body: {
            registration: {
                menuItems: [
                    {
                        id: `${extensionId}::${seatNumber}::config`,
                        title: `Configuration ${seatNumber}`,
                        parent: `${extensionId}::${seatNumber}::emea_partner_days`,
                        sortOrder: 1,
                    },
                    {
                        id: `${extensionId}::${seatNumber}::emea_partner_days`,
                        title: 'EMEA Partner Days',
                        isSection: true,
                        sortOrder: 100
                    }
                ],
                page: {
                    title: 'EMEA Partner Days 2025',
                }
            }
        }
    }
}

exports.main = main
