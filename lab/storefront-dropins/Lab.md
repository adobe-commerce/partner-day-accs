# Commerce Partner Days - Storefront Drop-ins Lab

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [What You'll Learn](#what-youll-learn)
- [Links](#links)
- [Exercise 1: Enhanced Cart Experience](#exercise-1-enhanced-cart-experience)
- [Exercise 2: Payment Method Integration](#exercise-2-payment-method-integration)
  - [Part I: Create Payment Method](#part-i-create-payment-method)
  - [Part II: Add Payment Method Logic](#part-ii-add-payment-method-logic)
  - [Part III: Storefront Integration](#part-iii-storefront-integration)
- [Optional Exercises: Enhanced Payment Security](#optional-exercises-enhanced-payment-security)
  - [Exercise 1: Two-Factor Authentication (2FA)](#exercise-1-two-factor-authentication-2fa)
  - [Exercise 2: Input Validation](#exercise-2-input-validation)

## Overview
This lab consists of two main exercises that will help you understand and implement key features in Adobe Commerce storefront:

1. **Enhanced Cart Experience**: A smaller exercise that demonstrates how to add visual category indicators to cart items.
2. **Payment Method Integration**: A comprehensive exercise that guides you through creating and integrating a custom OOPE (Out Of Process Extensibility) payment method.

## Prerequisites
Before starting this lab, you must have completed the Commerce Partner Days - ACCS Session. This ensures you have:

1. A ready-to-use ACCS lab codespace (lab codespace).
2. A configured storefront codespace (storefront codespace).
3. An App Builder project set up with the necessary permissions.

## What You'll Learn
- How to extend storefront drop-ins with slots.
- How to create and configure a custom payment method in Adobe Commerce.
- How to set up webhook subscriptions for payment validation.
- How to integrate payment method logic into the storefront checkout drop-in.

## Links
After scaffolding your storefront, you'll have access to these URLs:

| Resource | URL |
|----------|-----|
| Storefront Preview | `https://main--<REPO>--<OWNER>.aem.page/` |
| Content Editor | `https://da.live/#/<OWNER>/<REPO>` |
| Admin URL | `https://na1-sandbox.admin.commerce.adobe.com/<TENANT_ID>` |
| REST Endpoint | `https://na1-sandbox.api.commerce.adobe.com/<TENANT_ID>` |

## Exercise 1: Enhanced Cart Experience
In this exercise, we'll enhance the shopping cart experience by adding visual category indicators to cart items. Each product's categories will be displayed as badges with corresponding icons.

### Step 1: Enable Slot Visualization
1. Open your storefront codespace.
2. Navigate to the terminal.
3. Start the development server:

```bash
yarn start
```

4. Open your browser, add a product to the cart, and go to the cart page.
5. Open browser developer tools (right-click > Inspect).
6. In the console tab, run:

```javascript
DROPINS.showSlots(true)
```

7. You should now see highlighted areas on the cart page where you can inject custom content.
8. In the console tab, run this to disable it:

```javascript
DROPINS.showSlots(false)
```

### Step 2: Add Product Categories to Cart
1. Open the cart block file in your storefront codespace:

```bash
blocks/commerce-cart/commerce-cart.js
```

2. Locate the `enableRemoveItem` prop (around line 82). Below this line, you'll add a new `slots` configuration that will display product categories as badges with icons.

3. Add the following code snippet exactly as shown below:

```javascript
slots: {
    ProductAttributes: (ctx) => {
        const productAttributes = document.createElement('div');
        productAttributes.className = 'product-attributes';

        // Create categories section
        if (ctx.item && ctx.item.categories && ctx.item.categories.length > 0) {
        const categoryIcons = {
            'All': '🌍',
            'Office': '📁',
            'Apparel': '👕',
            'Bags': '🎒',
            'Collections': '🖼️',
            'Lifestyle': '🌟',
            'Tech': '💻',
            'Gifts': '🎁',
            'Travel': '✈️'
        };

        const categoryElements = ctx.item.categories.map(category => {
            const categoryName = category;
            const categoryIcon = categoryIcons[categoryName] || '🌍';
            return `<div class="product-attribute-category">${categoryIcon} ${categoryName}</div>`;
        });

        productAttributes.innerHTML = categoryElements.join('');

        // Add some basic styles
        const style = document.createElement('style');
        style.textContent = `
            .product-attributes {
            padding: 10px;
            margin: 10px 0;
            }
            .product-attribute-category {
            display: inline-block;
            margin: 5px;
            padding: 5px 10px;
            background: #f5f5f5;
            border-radius: 15px;
            font-size: 0.9em;
            }
        `;
        productAttributes.appendChild(style);
        }

        ctx.appendChild(productAttributes);
    },
}
```

### Step 3: Test the Enhanced Cart
1. Refresh your cart page.
2. Add different products to your cart.
3. Verify that:
   - Category badges appear with icons.
   - Badges are properly styled.
   - Content is properly aligned and spaced.

## Exercise 2: Payment Method Integration
In this exercise, we'll implement a custom payment method called "PARTNER-PAY" using Adobe App Builder.

Here's the simplified integration flow:

![Alt text](../../docs/partner-pay-diagram.png "PARTNER-PAY Integration")

When a user clicks the place order button:

1. The storefront checkout will create a session on the payment gateway (simulated with the App Builder runtime action `payment-method/create-session`). This will generate a random UUID simulating the payment session identifier and return it to the storefront.
2. The storefront will set the payment method to PARTNER-PAY with the payment session ID returned by `payment-method/create-session`.
3. ACCS will trigger the webhook `payment-method/validate-payment` on the event `observer.sales_order_place_before`.

### Lab Structure
The exercise is divided into three main parts:

1. **Part I**: Create payment method (ACCS).
2. **Part II**: Add payment method logic (App Builder).
3. **Part III**: Storefront integration (EDS Storefront).

## Part I: Create Payment Method
> **Note:** The steps in this lab to create a payment method, runtime actions, and webhooks are shown in detail for learning purposes. In a real implementation, you would use the [Checkout Starter Kit](https://developer.adobe.com/commerce/extensibility/starter-kit/checkout/) as foundation which helps to accelerate the development of out of process applications related to payments, shipping, and taxes.

The Checkout Starter Kit provides:
- Payment method configuration.
- Runtime action scaffolding.
- Webhook subscription setup.
- Storefront integration code.

This lab walks through the manual steps to help you understand what happens behind the scenes when using the starter kit.

### Step 1.1: Set Up Environment Variables
1. Open your lab codespace.
2. Open the terminal.
3. Set your REST API endpoint (replace `<TENANT_ID>` with the tenant ID for your assigned seat):

```bash
export REST_API=https://na1-sandbox.api.commerce.adobe.com/<TENANT_ID>
```

### Step 1.2: Generate and Set Access Token
1. Navigate back to the Adobe Developer Console at https://developer.adobe.com/console/. If prompted, log in and select the **Adobe Commerce Labs** organization.
2. Click **Projects** in the Developer Console top menu.

    ![Alt text](../../docs/developer-console-home.png "Developer console home")

3. Select the project assigned to your seat:
   **PD SY <SEAT_NUMBER>**
4. Select the **Stage** workspace.
5. Navigate to Credentials > OAuth Server-to-Server section.
6. Click on "Generate access token" button.
7. Copy the generated token.
8. Set the token in your terminal:

```bash
# TODO Paste your access token between the quotes
export ACCESS_TOKEN=""
```

### Step 1.3: Verify Existing Payment Methods
1. Run the following command to check current payment methods:

```bash
curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  $REST_API/V1/oope_payment_method | jq .
```

2. Review the output to ensure "PARTNER-PAY" is not already in the list.

### Step 1.4: Create New Payment Method
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
  -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-type: application/json" \
  -d "$PAYMENT_METHOD_JSON" \
  $REST_API/V1/oope_payment_method | jq .
```

### Step 1.5: Verify Payment Method Creation
1. Run the verification command again:

```bash
curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  $REST_API/V1/oope_payment_method | jq .
```

2. Confirm that "PARTNER-PAY" appears in the list of payment methods.

### Step 1.6: Test in Storefront
1. Go to your storefront.
2. Add items to your cart.
3. Proceed to checkout.
4. Verify that "PARTNER-PAY" appears in the list of available payment methods.

## Part II: Add Payment Method Logic
In this section, you'll connect your new payment method to backend logic using Adobe App Builder. This ensures that the payment method is validated before an order is placed.

### Step 2.1: Enable Payment Method Logic in App Builder
1. Open your lab codespace.
2. Locate the `ext.config.yaml` file under `src/commerce-backend-ui-1` in your App Builder project.
3. Add the following payment method package and adjust indentation if needed:

```yaml
      payment-method:
        license: Apache-2.0
        actions:
          $include: ./actions/payment-method/actions.config.yaml
```

4. **Deploy your changes** to App Builder by running:

```bash
aio app deploy --force-build --force-deploy
```

5. After deployment, run:

```bash
aio app get-url
```

6. Confirm that both the following endpoints are listed:
   - `payment-method/create-session`
   - `payment-method/validate-payment`
7. **Note:** You will need the URL for `validate-payment` in the next step.

### Step 2.2: Subscribe to the Webhook
1. Copy your validate-payment endpoint URL from Step 2.1 (the URL that ends with `/validate-payment`).

2. Run these commands in your terminal (copy and paste each block):

```bash
# TODO Paste your validate-payment URL between the quotes
VALIDATE_PAYMENT_URL=""
```

```bash
WEBHOOK_JSON='
{
  "webhook": {
    "webhook_method": "observer.sales_order_place_before",
    "webhook_type": "before",
    "batch_name": "validate_payment",
    "hook_name": "oope_payment_methods_sales_order_place_before",
    "url": "'$VALIDATE_PAYMENT_URL'",
    "required": true,
    "method": "POST",
    "fields": [
      {"name": "payment_method", "source": "data.order.payment.method"},
      {"name": "payment_additional_information", "source": "data.order.payment.additional_information"}
    ],
    "rules": [
      {"field": "data.order.payment.method", "operator": "equal", "value": "PARTNER-PAY"}
    ]
  }
}'

curl -s -X POST $REST_API/V1/webhooks/subscribe \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_JSON" | jq .
```

### Step 2.3: Verify Webhook Subscription in Admin
1. Log in to the Admin Panel:
   `https://na1-sandbox.admin.commerce.adobe.com/<TENANT_ID>`
2. Go to **System > Webhooks > Webhooks Subscriptions**.
3. You should see your new webhook listed. Click "Select" to view its details.
4. Confirm the following settings:

   **Hook Settings**
   | Setting | Value |
   |---------|-------|
   | Webhook Method | `observer.sales_order_place_before` |
   | Webhook Type | `before` |
   | Batch Name | `validate_payment` |
   | Hook Name | `oope_payment_methods_sales_order_place_before` |
   | URL | `https://<your-validate-payment-endpoint-url>` |
   | Active | `Yes` |
   | Method | `POST` |

   **Hook Fields**
   | Field Name | Source |
   |------------|--------|
   | payment_method | data.order.payment.method |
   | payment_additional_information | data.order.payment.additional_information |

   **Hook Rules**
   | Field | Operator | Value |
   |-------|----------|-------|
   | data.order.payment.method | equal | PARTNER-PAY |

### Step 2.4: Test Payment Validation
1. Go to your storefront checkout page.
2. Try to place an order using the "PARTNER-PAY" payment method.
3. You should see an error message:
   **"Invalid payment session"**
4. This confirms that your webhook is active and the validation logic is working.

> **Tips:**
> - If you do not see the webhook in the Admin Panel, double-check your `WEBHOOK_JSON` and ensure the correct endpoint URL is used.
> - If the error message does not appear, check the logs for your App Builder action and ensure it is deployed and accessible.

## Part III: Storefront Integration

### Step 3.1: UI Render
1. Open your storefront codespace.
2. Open the block `blocks/commerce-checkout/commerce-checkout.js`.
3. In Line 340, add the following code to render a warning message when the payment method is selected:

```javascript
"PARTNER-PAY": {
    render: (ctx) => {
        const $content = document.createElement('div');
        UI.render(IllustratedMessage,
          {
            className: "checkout__payment-method-partners-payment",
            heading: "PARTNER PAY",
            headingLevel: 3,
            variant: "secondary",
            message: h("p", {className: "checkout__payment-method-partners-payment--message", children: "This is a test payment method for demonstration purposes only"})
          }
        )($content);
        ctx.replaceHTML($content);
    },
},
```

4. In line 10, after `import { initializers } ...`, add the following line to import Preact `h` function:

```javascript
import { h } from '@dropins/tools/preact.js';
```

5. In line, after `ProgressSpinner`, add the following line to import the `IllustratedMessage`:

```javascript
IllustratedMessage,
```

6. Go to the browser's storefront tab, and go to the checkout page.
7. Select `PARTNER-PAY` payment method. It should display a warning message below the payment methods.

For more information, check [drop-in SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/), [components](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/components/overview/), and [base design](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/design/).

### Step 3.2: UI Styling
1. Open the CSS file of the commerce-checkout block `blocks/commerce-checkout/commerce-checkout.css`.
2. Append the following CSS rules to the end of the file:

```css
/* PARTNER-PAY payment method */
.checkout__payment-method-partners-payment .dropin-card--secondary {
  border: var(--shape-border-width-1) solid var(--color-warning-500);
}

.checkout__payment-method-partners-payment h3 {
  font: var(--type-headline-2-strong-font);
  letter-spacing: var(--type-headline-2-strong-letter-spacing);
}

.checkout__payment-method-partners-payment--message {
  color: var(--color-warning-500);
}
```

3. Go back to the browser and reload the checkout page. It should display the message in a styled box.

### Step 3.3: Payment Logic
1. In Line 470, before `// place order`, add the following code to create the session and set the payment session identifier:

```javascript
// Add payment session creation for PARTNER-PAY
if (code === "PARTNER-PAY") {
    // TODO Paste your create-session URL between the quotes
    const PAYMENT_SESSION_API = '';

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

2. Go back to the browser's storefront tab.
3. Place an order with PARTNER-PAY payment method. Now it should work.

## Optional Exercises: Enhanced Payment Security
These exercises will help you understand how to extend the PARTNER-PAY payment method with additional security features.

### Exercise 1: Two-Factor Authentication (2FA)
Extend the PARTNER-PAY payment method to include a 2FA field with the following requirements:

1. Add a 2FA input field to the payment method UI.
2. Implement validation logic:
   - Accept the payment if the 2FA code is "1234"
   - Reject the payment with the error message "You shall not pass" for any other code

### Exercise 2: Input Validation
Implement client-side validation for the 2FA field with these requirements:

1. Validate that the input is exactly 4 digits
2. Show an error message next to the 2FA field when:
   - The input is not 4 digits
   - The input contains non-numeric characters
3. Only proceed with the order placement if the validation passes
