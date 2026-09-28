---
id: webhooks
title: Webhooks
sidebar_position: 4
---

# Webhooks

A webhook is the gateway calling **your server** directly when something happens. It arrives
whether or not the customer's browser survived the payment — which is why it, not the
browser, is what you build on.


:::warning Webhooks and the hosted sandbox
The hosted sandbox cannot reach a webhook endpoint running on your laptop — it has no
route to `localhost`. To receive webhooks you have two options:

- **Run the gateway locally** and point it at your app:
  `MERCHANT_WEBHOOK_URL=http://localhost:4000/webhook npm start`
- **Expose your local endpoint** with a tunnel (ngrok, cloudflared) and run the gateway
  yourself with `MERCHANT_WEBHOOK_URL` set to the public tunnel URL.

Everything else in the integration — orders, checkout, confirming a payment — works
against the hosted sandbox with no setup.
:::

## Setup

```js title="server.js"
// Mount BEFORE express.json(). The signature covers the raw bytes.
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    event = gateway.webhooks.verify(
      req.body,                              // the raw Buffer
      req.header('x-webhook-signature'),
      req.header('x-webhook-timestamp'),
    );
  } catch (err) {
    return res.status(400).send('bad signature');
  }

  res.sendStatus(200);                       // acknowledge fast

  if (event.type === 'payment.success') {
    fulfilOnce(event.data.order.orderId);    // then do the work
  }
});
```

## The three mistakes everyone makes

:::danger 1. Parsing the body first
If `express.json()` runs before your webhook route, `req.body` is an object.
Re-serialising it changes the bytes and **every signature fails**. Use
`express.raw()` on that route.
:::

:::danger 2. Working before acknowledging
The gateway times out after ~5 seconds and retries. A slow handler turns one event into a
retry storm. Send `200` first, process after.
:::

:::danger 3. Not deduplicating
Delivery is **at-least-once**. The same event *will* arrive twice one day. Without a
dedupe check, you ship the order twice.
:::

## Events

| Event | When |
|---|---|
| `payment.success` | Money captured. The order is `PAID`. |
| `payment.failed` | The attempt failed. The customer can retry. |
| `refund.success` | A refund reached the customer |

## Security

Each request carries two headers:

```
x-webhook-signature: base64(HMAC-SHA256(`${timestamp}.${rawBody}`, clientSecret))
x-webhook-timestamp: 1756704000
```

`webhooks.verify()` checks the signature in constant time **and** rejects anything older
than five minutes — the timestamp is inside the signed payload, so an attacker cannot
replay yesterday's success with a fresh clock. It throws rather than returning a boolean,
so you cannot forget to check the result.

## Testing locally

Your local server is not reachable from the internet. Use a tunnel:

```bash
npx localtunnel --port 4000
# or
ngrok http 4000
```

Then set that URL as your webhook endpoint in the dashboard.
