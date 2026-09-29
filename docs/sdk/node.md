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

## `orders.all(options)`

One page of orders, newest first.

```js
const page = await gateway.orders.all({ limit: 20 });

page.data        // Order[]
page.hasMore     // boolean
page.nextCursor  // pass to the next call; absent when you have reached the end
```

| Option | | |
|---|---|---|
| `limit` | 1–100, default 20 | values outside the range are clamped |
| `cursor` | from a previous `nextCursor` | omit for the first page |

Paging is cursor-based, not offset-based. An order created while you are paging
cannot shift rows along and make you skip one — which `?page=2` would.

## `orders.each(options)`

Every order, fetched one page at a time.

```js
for await (const order of gateway.orders.each({ limit: 50 })) {
  console.log(order.orderId, order.orderStatus);
}
```

Prefer this over a large `limit`. It holds one page in memory at a time, and stops
fetching the moment you `break`.

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

## Retries

Failures that are the gateway's problem are retried automatically — network errors,
timeouts, `429`, and any `5xx`. Two retries by default, with exponential backoff and
jitter so a fleet of your servers does not retry in lockstep.

```js
new PaymentGateway({
  clientId, clientSecret,
  maxRetries: 2,      // retries after the first attempt. 0 disables.
  retryBaseMs: 300,   // first delay; doubles each attempt
});
```

**Nothing else is retried.** A `4xx` other than `429` will fail identically the second
time, so the SDK surfaces it immediately.

### Writes are only retried when it is safe

A retried `POST` could create a second order and charge twice. The SDK therefore only
retries a write that carries an idempotency key — and `orders.create()` always sends
one, derived from `orderId`.

The gateway deduplicates on that key, so a retry returns the order the first call
created:

```js
// Two calls with the same orderId = one order.
await gateway.orders.create({ orderId: 'inv_1001', orderAmount: 499, ... });
await gateway.orders.create({ orderId: 'inv_1001', orderAmount: 499, ... });
```

Pass your own `orderId` — your invoice number, your cart id — and retries become safe
for free.

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
