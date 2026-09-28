---
id: intro
title: Introduction
sidebar_position: 1
slug: /
---

# Accept payments on your website

This gateway gives you a prebuilt, PCI-compliant checkout. Your customer pays on our
page, so card details never touch your servers — and you never need a PCI audit.

## The whole integration is three steps

| | Where | What |
|---|---|---|
| **1** | Your server | Create an order, get a `paymentSessionId` |
| **2** | Your browser | Open the checkout with that session id |
| **3** | Your server | Confirm the payment before you ship anything |

That is it. Everything else in these docs is detail on those three steps.

## Two packages

```bash
npm install payment-gateway-node-sdk    # your server — holds the secret key
npm install payment-gateway-browser-sdk    # your web page — holds nothing secret
```

:::danger Never put the secret key in browser code
`clientSecret` can create charges and issue refunds. It belongs in your server's
environment variables. If it ever reaches a browser bundle, a git commit, or a network
tab, rotate it immediately.
:::

## Before you start

There is no signup and no dashboard. This is a sandbox gateway built to demonstrate how
a real one works, so it ships with one seeded test merchant. Use these credentials:

```bash title=".env"
PG_CLIENT_ID=TEST_clientid_demo
PG_CLIENT_SECRET=pgsk_TEST_secret_demo_00000000
```

The hosted sandbox lives at `https://payment-gateway-api-1juk.onrender.com` and both
SDKs point at it by default, so `npm install` and these two values are all you need.

:::info These keys are public on purpose
They move no real money. Publishing sandbox credentials is normal — it is how you try an
integration before committing to it. The warning above still applies to *real* secrets.
:::

### Two things to know

**The sandbox sleeps.** It is on a free host, so the first request after a quiet spell
can take 30–60 seconds while it wakes up. Every request after that is fast.

**Your origin must be allowed.** The checkout is framed, and the gateway sets
`frame-ancestors`, so it will refuse to open on an origin it does not recognise.
`localhost:5173` and `localhost:3000` work out of the box. For anything else — a
different port, a deployed site — run the gateway yourself and set `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://yoursite.com npm start
# or, for local experimenting only
ALLOWED_ORIGINS=* npm start
```

[Start with the quickstart →](/integration/quickstart)
