---
id: confirm
title: Confirming a payment
sidebar_position: 3
---

# Confirming a payment

Three signals can tell you a payment happened. They are **not** equally trustworthy.

| Signal | Trust | Why |
|---|---|---|
| The `checkout()` promise | ⚠️ Low | Runs in the customer's browser, which they control |
| The `returnUrl` redirect | ⚠️ Low | The customer may close the tab or lose signal first |
| `orders.fetch()` | ✅ High | Your server asking ours |
| **A signed webhook** | ✅ **Highest** | Arrives regardless of the browser, and is signed |

## The rule

> Never unlock a product, ship an item, or mark an invoice paid based on anything the
> browser told you.

```js
app.get('/api/checkout/status/:orderId', async (req, res) => {
  const order = await gateway.orders.fetch(req.params.orderId);

  if (order.orderStatus === 'PAID') {
    await fulfilOnce(order.orderId);    // idempotent — see below
    return res.json({ paid: true });
  }
  res.json({ paid: false, status: order.orderStatus });
});
```

## Make fulfilment idempotent

Both the status check and the webhook can fire for the same order. Whichever arrives
second must do nothing.

```js
async function fulfilOnce(orderId) {
  const row = await db.orders.findOne({ orderId });
  if (!row || row.status === 'paid') return;      // already done
  await db.orders.update({ orderId }, { status: 'paid', paidAt: new Date() });
  await shipTheThing(row);
}
```

A unique constraint on `orderId` in your database is a better guard than an `if` —
two concurrent requests can both pass the check.

## Order statuses

| Status | Meaning |
|---|---|
| `ACTIVE` | Created, not yet paid |
| `PAID` | Money captured. Safe to ship. |
| `EXPIRED` | The session ran out |
| `TERMINATED` | Cancelled |
