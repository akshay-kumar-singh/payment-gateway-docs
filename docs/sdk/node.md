---
id: node
title: Node.js — payment-gateway-node-sdk
sidebar_position: 1
---

# payment-gateway-node-sdk

The server SDK. Runs on Node 18+. ESM and CommonJS, with TypeScript types included.

```bash
npm install payment-gateway-node-sdk
```

## Setup

```js
import { PaymentGateway } from 'payment-gateway-node-sdk';

const gateway = new PaymentGateway({
  clientId: process.env.PG_CLIENT_ID,
  clientSecret: process.env.PG_CLIENT_SECRET,
  environment: 'sandbox',      // or 'production'
  timeout: 30000,              // optional, ms
});
```

## `orders.create(request)`

```js
const order = await gateway.orders.create({
  orderAmount: 499,                    // rupees; converted to paise on the wire
  orderCurrency: 'INR',
  customerDetails: {
    customerId: 'cust_1',
    customerPhone: '9999999999',       // required
    customerEmail: 'a@example.com',
    customerName: 'Asha Menon',
  },
  orderId: 'order_my_ref_123',         // optional; also the idempotency key
  returnUrl: 'https://yoursite.com/return',
  orderNote: 'Dot Grid Notebook',
  orderTags: { campaign: 'diwali' },
});

order.paymentSessionId   // → send this to the browser
order.orderId
order.orderStatus        // 'ACTIVE'
```

Passing your own `orderId` makes the call **retry-safe**: the same id returns the same
order instead of creating a second one.

## `orders.fetch(orderId)`

```js
const order = await gateway.orders.fetch('order_abc');
if (order.orderStatus === 'PAID') { /* safe to ship */ }
```

## `orders.payments(orderId)`

Every attempt against an order, including failed ones.

```js
const attempts = await gateway.orders.payments('order_abc');
// [{ paymentId, paymentStatus, paymentMethod, paymentMessage, errorCode }]
```

## `payments.fetch(paymentId)`

```js
const payment = await gateway.payments.fetch('pay_abc');
```

## `refunds.create(orderId, options)`

```js
const refund = await gateway.refunds.create('order_abc', {
  refundAmount: 499,             // omit for a full refund
  refundNote: 'Customer request',
});
```

## `webhooks.verify(rawBody, signature, timestamp)`

Throws on a bad signature; returns the parsed event otherwise.

```js
const event = gateway.webhooks.verify(
  req.body,                              // RAW Buffer, not parsed JSON
  req.header('x-webhook-signature'),
  req.header('x-webhook-timestamp'),
);
```

## Errors

Every non-2xx throws a `PaymentGatewayError`.

```js
import { PaymentGatewayError } from 'payment-gateway-node-sdk';

try {
  await gateway.orders.create({ /* ... */ });
} catch (err) {
  if (err instanceof PaymentGatewayError) {
    err.code;        // 'INVALID_AMOUNT', 'AUTH_FAILED', 'NETWORK_ERROR', 'TIMEOUT'
    err.statusCode;  // 400, 401, … or 0 if the request never left
    err.requestId;   // quote this to support
  }
}
```

:::warning `NETWORK_ERROR` and `TIMEOUT` do not mean "failed"
They mean the outcome is **unknown** — the request may have succeeded on our side.
Call `orders.fetch()` before assuming anything or retrying a charge.
:::

## TypeScript

Types ship with the package; no `@types` install needed.

```ts
import { PaymentGateway, type Order, type PaymentGatewayError } from 'payment-gateway-node-sdk';
```
