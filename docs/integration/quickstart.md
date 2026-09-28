---
id: quickstart
title: Quickstart
sidebar_position: 1
---

# Quickstart

A working payment in about ten minutes.

:::tip Credentials
Use the seeded sandbox merchant — there is no signup:

```bash title=".env"
PG_CLIENT_ID=TEST_clientid_demo
PG_CLIENT_SECRET=pgsk_TEST_secret_demo_00000000
```

Serve your frontend on `localhost:5173` or `localhost:3000`, or the framed checkout will
refuse to open. [Why →](/#before-you-start)
:::

## Step 1 — Create an order (server-side)

This call needs your secret key, so it must run on your server. Never call it from a browser.

```js title="server.js"
import { PaymentGateway } from 'payment-gateway-node-sdk';

const gateway = new PaymentGateway({
  clientId: process.env.PG_CLIENT_ID,
  clientSecret: process.env.PG_CLIENT_SECRET,
  environment: 'sandbox',
});

// Prices live on your server. The browser only sends a product id.
const PRODUCTS = { sku_notebook: 499, sku_headphones: 12499 };

app.post('/api/checkout/start', async (req, res) => {
  const amount = PRODUCTS[req.body.productId];
  if (!amount) return res.status(400).json({ error: 'Unknown product' });

  const order = await gateway.orders.create({
    orderAmount: amount,
    orderCurrency: 'INR',
    customerDetails: {
      customerId: req.user.id,
      customerPhone: req.user.phone,
      customerEmail: req.user.email,
    },
    returnUrl: 'https://yoursite.com/payment/return',
  });

  // Only the session id crosses to the browser.
  res.json({ paymentSessionId: order.paymentSessionId, orderId: order.orderId });
});
```

:::tip Why the browser never sends the price
If it did, a customer could change `12499` to `1` in devtools and buy your product for a
rupee. Send a product id; look the price up yourself.
:::

## Step 2 — Open the checkout (client-side)

```jsx title="PayButton.jsx"
import { load } from 'payment-gateway-browser-sdk';

export function PayButton({ productId }) {
  async function pay() {
    const { paymentSessionId, orderId } = await fetch('/api/checkout/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }).then((r) => r.json());

    const gateway = await load({ mode: 'sandbox' });
    await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

    // The popup closed. That is NOT proof of payment — confirm on your server.
    const { paid } = await fetch(`/api/checkout/status/${orderId}`).then((r) => r.json());
    window.location.href = paid ? '/thank-you' : '/payment-pending';
  }

  return <button onClick={pay}>Pay now</button>;
}
```

## Step 3 — Confirm (server-side)

```js title="server.js"
app.get('/api/checkout/status/:orderId', async (req, res) => {
  const order = await gateway.orders.fetch(req.params.orderId);
  res.json({ paid: order.orderStatus === 'PAID' });
});
```

:::warning Always verify before you ship
The browser is controlled by the customer. An order is only paid when **your server**
sees `orderStatus === 'PAID'`, or a **signed webhook** says so.
:::

## Test it

Use `success@pgtest` as the UPI ID, or card `4111 1111 1111 1111`. See
[test instruments](/integration/testing) for every failure you can reproduce.
