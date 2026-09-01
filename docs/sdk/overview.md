---
id: overview
title: SDKs
sidebar_position: 1
---

# SDKs

Paywize ships two packages. They do opposite jobs and must never be swapped.

| | `paywize-dummy-pg` | `paywize-dummy-js` |
|---|---|---|
| Runs on | Your **server** | Your **web page** |
| Holds the secret key | Yes | **Never** |
| Job | Call the REST API | Open the checkout |
| Install | `npm i paywize-dummy-pg` | `npm i paywize-dummy-js` or a `<script>` tag |
| Size | ~6 KB | **1.3 KB** gzipped |

```bash
npm install paywize-dummy-pg    # server
npm install paywize-dummy-js    # browser
```

## Why two

The secret key can create charges and issue refunds. It must stay on your server. The
browser package holds nothing secret — it only opens a page on Paywize's domain, where
the customer types their card. That separation is what keeps card data off your servers
and you out of PCI-DSS scope.

## You do not have to use them

Everything is plain HTTPS. The SDKs just save you writing authentication, retries,
timeouts, error types and signature verification by hand.

```bash
curl https://sandbox-api.paywize.in/pg/orders \
  -H "x-client-id: $CLIENT_ID" \
  -H "x-client-secret: $CLIENT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"order_amount_paise":49900,"customer_details":{"customer_id":"c1","customer_phone":"9999999999"}}'
```
