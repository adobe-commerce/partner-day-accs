# Commerce Partner Days - EDS Storefront Session

## Overview
This lab will guide you through creating and integrating a custom payment method into your Adobe Commerce storefront, including setting up the payment processing logic and webhook subscriptions.

## Important Links
After scaffolding your storefront, you'll have access to these important URLs:
- **Storefront Preview**: `https://main--{repo}--{owner}.aem.page/`
- **Content Editor**: `https://da.live/#/{owner}/{repo}`
- **Configuration Manager**: `https://da.live/#/{owner}/{repo}/configs-stage`
- **Admin URL**: `https://na1-sandbox.admin.commerce.adobe.com/{tenant_id}`
- **REST API Endpoint**: `https://na1-sandbox.api.commerce.adobe.com/{tenant_id}`

## Prerequisites
1. Ensure you have access to your Adobe Commerce sandbox environment
2. Have your tenant ID ready
3. Have a terminal with `curl` and `jq` installed
4. Have the Adobe I/O CLI (`aio`) installed and configured
5. Have access to your Stage workspace

## Payment Method Integration
In this section, we'll create a new payment method called "PARTNER-PAY" and integrate it into your storefront.

### Step 1: Set Up Environment Variables
1. Open your terminal
2. Set your REST API endpoint (replace `{tenant_id}` with your actual tenant ID):
```bash
export REST_API=https://na1-sandbox.api.commerce.adobe.com/{tenant_id}
```

### Step 2: Generate and Set Access Token
1. Go to your Stage workspace
2. Navigate to Credentials > OAuth Server-to-Server section
3. Click on "Generate access token" button
4. Copy the generated token
5. Set the token in your terminal:
```bash
export BEARER_TOKEN="paste here"
```

### Step 3: Verify Existing Payment Methods
1. Run the following command to check current payment methods:
```bash
curl -s \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  https://$REST_API/V1/oope_payment_method | jq .
```
2. Review the output to ensure "PARTNER-PAY" is not already in the list

### Step 4: Create New Payment Method
1. Create a new payment method by running:
```bash
PAYMENT_METHOD_JSON='{
  "payment_method": {
    "code": "PARTNER-PAY",
    "title": "PARTNER PAY title",
    "active": true
  }
}'

curl -XPOST \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H 'Content-type: application/json' \
  -d "$PAYMENT_METHOD_JSON" \
  https://$REST_API/V1/oope_payment_method
```

### Step 5: Verify Payment Method Creation
1. Run the verification command again:
```bash
curl -s \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  https://$REST_API/V1/oope_payment_method | jq .
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
3. Deploy the runtime actions:
```bash
aio app deploy
```
4. Verify that two new runtime actions are created:
   - `actions/payment-method/create-session.js`
   - `actions/payment-method/validate-payment.js`
5. Note down the new URLs generated after deployment

### Step 8: Configure Webhook Subscription
1. Log in to the Admin Panel using the Admin URL
2. Navigate to System > Webhooks > Webhooks Subscriptions
3. Click the "Add New Webhook" button
4. Configure the webhook with the following settings:

**Hook Settings:**
- Webhook Method: `observer.sales_order_place_before`
- Webhook Type: `before`
- Batch Name: `validate_payment`
- Hook Name: `oope_payment_methods_sales_order_place_before`
- URL: `https://<your-validate-payment-app>` (use the URL from Step 7)
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

## Troubleshooting
If you encounter any issues:
- Verify your bearer token is valid and not expired
- Check that your tenant ID is correct
- Ensure you have the necessary permissions to create payment methods
- Clear your browser cache if the payment method doesn't appear in the storefront
- Verify the webhook URL is correct and accessible
- Check the webhook logs in the Admin Panel for any errors

## Next Steps
After completing this lab, you can:
- Customize the payment method's appearance
- Add additional payment method configurations
- Implement payment processing logic
- Set up webhook monitoring and logging
- Add error handling and retry mechanisms
