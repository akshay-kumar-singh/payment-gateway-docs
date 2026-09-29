---
id: overview
title: SDKs
sidebar_position: 1
---

# SDKs

There are two packages. They do opposite jobs and must never be swapped.

| | `payment-gateway-node-sdk` | `payment-gateway-browser-sdk` |
|---|---|---|
| Runs on | Your **server** | Your **web page** |
| Holds the secret key | Yes | **Never** |
| Job | Call the REST API | Open the checkout |
| Install | `npm i payment-gateway-node-sdk` | `npm i payment-gateway-browser-sdk` or a `<script>` tag |
| Size | ~6 KB | **1.3 KB** gzipped |

```bash
npm install payment-gateway-node-sdk    # server
npm install payment-gateway-browser-sdk    # browser
```

## Why two

The secret key can create charges and issue refunds. It must stay on your server. The
browser package holds nothing secret — it only opens a page on the gateway's domain, where
the customer types their card. That separation is what keeps card data off your servers
and you out of PCI-DSS scope.

## You do not have to use them

Everything is plain HTTPS. The SDKs just save you writing authentication, retries,
timeouts, error types and signature verification by hand.

```bash
curl https://payment-gateway-api-1juk.onrender.com/pg/orders \
  -H "x-client-id: $CLIENT_ID" \
  -H "x-client-secret: $CLIENT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"order_amount_paise":49900,"customer_details":{"customer_id":"c1","customer_phone":"9999999999"}}'
```

## Other languages

Node is the only server SDK we publish today. Every endpoint is described in an
[OpenAPI 3.1 spec](https://github.com/akshay-kumar-singh/payment-gateway-api/blob/main/openapi.yaml),
so you can generate a typed client for your own language instead of waiting for us.

```bash
# Python
openapi-python-client generate --path openapi.yaml

# PHP, Java, Go, Ruby, C#, and 40-odd others
openapi-generator-cli generate -i openapi.yaml -g php -o ./sdk-php
```

A generated client covers authentication, request bodies and typed responses. Two things
it will **not** give you, because they are not part of the HTTP surface:

- **Webhook signature verification.** That is HMAC-SHA256 over the raw request body —
  see [Webhooks](../integration/webhooks.md) for the algorithm.
- **Retries.** Add your own: retry only on a network error, a `429`, or a `5xx`, and retry
  a write only when you are sending the same idempotency key.
