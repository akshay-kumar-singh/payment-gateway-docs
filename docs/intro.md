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

1. Create a merchant account
2. Generate an **App ID** and **Secret Key** in the dashboard
3. Whitelist your website domain

Test keys work the moment you sign up — you can finish the whole integration while your
KYC is still being reviewed.

[Start with the quickstart →](/integration/quickstart)
