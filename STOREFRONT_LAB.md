# Commerce Partner Days - EDS Storefront Session

## Table of Contents
- [Overview](#overview)
- [What You'll Learn](#what-youll-learn)
- [Links](#links)
- [Payment Method Integration](#payment-method-integration)

## Overview
This lab will guide you through creating and integrating a custom OOPE (Out-of-Process Extension) payment method into your Adobe Commerce storefront. You'll learn how to create a new payment method called "PARTNER-PAY" and implement the necessary backend and frontend components. This hands-on experience will help you understand the complete payment integration lifecycle in Adobe Commerce.

## What You'll Learn
- How to create and configure a custom payment method in Adobe Commerce
- How to set up webhook subscriptions for payment validation
- How to integrate payment method logic into the storefront
- How to handle payment sessions and validation

## Links
After scaffolding your storefront, you'll have access to these URLs:
- **Storefront Preview**: `https://main--{repo}--{owner}.aem.page/`
- **Content Editor**: `https://da.live/#/{owner}/{repo}`
- **Configuration Manager**: `https://da.live/#/{owner}/{repo}/configs-stage`
- **Admin URL**: `https://na1-sandbox.admin.commerce.adobe.com/{tenant_id}`
- **REST Endpoint**: `https://na1-sandbox.api.commerce.adobe.com/{tenant_id}`
- **Admin URL**: `https://na1-sandbox.admin.commerce.adobe.com/{tenant_id}`

## Payment Method Integration

For this lab, we'll implement a simplified version using Adobe App Builder:

1. A runtime action (`payment-method/create-session`) simulates the payment gateway
2. The payment session ID is shared between components using Adobe App Builder State storage
3. A webhook (`payment-method/validate-payment`) validates the payment before order placement

Here's the simplified integration flow:

![Alt text](docs/partner-pay-diagram.png "PARTNER-PAY Integration")


### Step 1: Set Up Environment Variables
1. Open your partner-day-accs codespace
1. Open the terminal
1. Set your REST API endpoint (replace `<TENANT_ID>` with the tenant ID for your assigned seat)
```bash
export REST_API=https://na1-sandbox.api.commerce.adobe.com/<TENANT_ID>
```

### Step 2: Generate and Set Access Token
1. Navigate back to the Adobe Developer Console at https://developer.adobe.com/console/. If prompted, login and select the **Adobe Commerce Labs** organization.
1. Click **Projects** in the Developer Console top menu.

    ![Alt text](docs/developer-console-home.png "Developer console home")

    Then select the project assigned to your seat:

    **PD SY <SEAT_NUMBER>**

    Select the **Stage** workspace.
1. Navigate to Credentials > OAuth Server-to-Server section
1. Click on "Generate access token" button
1. Copy the generated token
1. Set the token in your terminal:
```bash
export BEARER_TOKEN="paste here"
```

### Step 3: Verify Existing Payment Methods
1. Run the following command to check current payment methods:
```bash
curl -s \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  $REST_API/V1/oope_payment_method | jq .
```
2. Review the output to ensure "PARTNER-PAY" is not already in the list

### Step 4: Create New Payment Method
1. Create a new payment method by running:
```bash
PAYMENT_METHOD_JSON='{
  "payment_method": {
    "code": "PARTNER-PAY",
    "title": "PARTNER PAY",
    "active": true
  }
}'

curl -XPOST \
  -s -H "Authorization: Bearer $BEARER_TOKEN" \
  -H 'Content-type: application/json' \
  -d "$PAYMENT_METHOD_JSON" \
  $REST_API/V1/oope_payment_method | jq .
```

### Step 5: Verify Payment Method Creation
1. Run the verification command again:
```bash
curl -s \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  $REST_API/V1/oope_payment_method | jq .
```
2. Confirm that "PARTNER-PAY" appears in the list of payment methods

### Step 6: Test in Storefront
1. Navigate to your storefront preview URL: `https://main--{repo}--{owner}.aem.page/`
2. Add items to your cart
3. Proceed to checkout
4. Verify that "PARTNER-PAY" appears in the list of available payment methods

### Step 7: Enable Payment Method Logic
1. Open your `app.config.yaml` file
2. Locate and uncomment the payment-method block
3. Deploy the changes:
```bash
aio app deploy
```
4. Run `aio app get-url` and verify that both the [payment-method/create-session](./actions/payment-method/create-session.js) action and the [payment-method/validate-payment](./actions/payment-method/validate-payment.js) webhook are listed in the output.

### Step 8: Configure Webhook Subscription
1. Log in to the Admin Panel using the Admin URL `https://na1-sandbox.admin.commerce.adobe.com/<TENANT_ID>` (replace `<TENANT_ID>` with the tenant ID for your assigned seat)
2. Navigate to System > Webhooks > Webhooks Subscriptions
3. Click the "Add New Webhook" button
4. Configure the webhook with the following settings:

**Hook Settings:**
- Webhook Method: `observer.sales_order_place_before`
- Webhook Type: `before`
- Batch Name: `validate_payment`
- Hook Name: `oope_payment_methods_sales_order_place_before`
- URL: `https://<payment-method/validate-payment>` (use the URL from Step 7)
- Active: `Yes`
- Method: `POST`

**Hook Fields:**
- Field 1:
  - Name: `payment_method`
  - Source: `data.order.payment.method`
- Field 2:
  - Name: `payment_additional_information`
  - Source: `data.order.payment.additional_information`

**Hook Rules:**
- Name: `data.order.payment.method`
- Value: `PARTNER-PAY`
- Operator: `equal`

### Step 9: Test Payment Validation
1. Go to the checkout page
2. Try to place an order
3. You should see the error message "Invalid payment session"
4. This confirms that the validate-payment webhook is working correctly

### Step 10: Payment Method UI

#### UI Render
1. Go to the storefront repository
1. Open the block `blocks/commerce-checkout/commerce-checkout.js`
1. In Line 339,  add the following code to render a warning message when the payment method is selected
```javascript
"PARTNER-PAY": {
    render: (ctx) => {
        const $content = document.createElement('div');
        $content.innerHTML = `
        <div class="payment-method-card">
            <div class="payment-method-card__message">
            <p>This is a test payment method for demonstration purposes only.</p>
            </div>
        </div>
        `;
        ctx.replaceHTML($content);
    },
},
```
4. `npm start` to start the storefront in your local environment
5. Select PARTNER-PAY payment method. It should display a warning message below the payment methods.

#### UI Styling
1. Open the CSS file of the commerce-checkout block `blocks/commerce-checkout/commerce-checkout.css`
2. Append the following CSS rules to the end of the file
```css
/* Payment Method Card */
.checkout__payment-methods .payment-method-card {
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--shape-border-radius-medium);
    padding: var(--spacing-medium);
    margin-top: var(--spacing-small);
}

.payment-method-card {
    background-color: var(--color-neutral-50);
    border-radius: var(--shape-border-radius-medium);
    padding: var(--spacing-medium);
}

.payment-method-card__message {
    font: var(--type-body-2-default-font);
    color: var(--color-neutral-700);
}

.payment-method-card__warning {
    color: var(--color-error-600);
    font-weight: 500;
    margin-top: var(--spacing-small);
}
```
3. Go back to the browser and re-load the checkout page. It should display the message in a styled box.

#### Payment Logic
1. In Line 470, before `// place order`, add the following code to create the session and set the payment session identifier:

```javascript
// Add payment session creation for PARTNER-PAY
if (code === "PARTNER-PAY") {
    const PAYMENT_SESSION_API = '<payment-method/validate-session>'; // (use the URL from Step 7)

    try {
        const response = await fetch(PAYMENT_SESSION_API);
        const responseData = await response.json();
        const paymentSessionId = responseData?.message?.paymentSessionId;

        if (!paymentSessionId) {
            throw new Error('Unable to process payment at this time. Please try again later.');
        }

        await checkoutApi.setPaymentMethod({
            code: 'PARTNER-PAY',
            additional_data: [
                {
                    key: 'paymentSessionId',
                    value: paymentSessionId,
                },
            ],
        });
    } catch (error) {
        console.error('Payment session creation failed:', error);
        throw new Error('Payment processing failed. Please try again.');
    }
}
```
2. place an order with PARTNER-PAY payment method. Now it should work.

