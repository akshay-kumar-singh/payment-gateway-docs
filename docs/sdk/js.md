---
id: js
title: Browser — payment-gateway-browser-sdk
sidebar_position: 2
---

# payment-gateway-browser-sdk

The browser SDK. **1.3 KB gzipped**, zero dependencies. It holds nothing secret.

## Install

```bash
npm install payment-gateway-browser-sdk
```

Or drop in a script tag — no bundler needed:

```html
<script src="https://cdn.jsdelivr.net/npm/payment-gateway-browser-sdk@1/dist/payment-gateway.min.js"></script>
```

## `load(options)`

```js
import { load } from 'payment-gateway-browser-sdk';

const gateway = await load({ mode: 'sandbox' });   // or 'production'
```

Returns `null` on the server, so importing it in Next.js or Remix will not crash your
build. Guard for it:

```js
const gateway = await load({ mode: 'sandbox' });
if (!gateway) return;      // running server-side
```

## `checkout(options)`

```js
const result = await gateway.checkout({
  paymentSessionId,           // required — from your server
  redirectTarget: '_modal',   // '_self' | '_blank' | '_top' | '_modal' | HTMLElement
  returnUrl,                  // optional; overrides the order's
});
```

### Result

Only the promise-returning targets (`_modal`, inline) resolve.

```ts
{
  paymentDetails?: {
    orderId: string;
    paymentId: string;
    paymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
    paymentMessage: string;
  };
  dismissed?: boolean;        // customer closed it without paying
  error?: { code: string; message: string; type: string };
}
```

:::warning This result comes from the browser
Treat it as a UI hint, never as proof. Confirm with `orders.fetch()` on your server
before you ship anything.
:::

## Script tag usage

```html
<script src="https://cdn.jsdelivr.net/npm/payment-gateway-browser-sdk@1/dist/payment-gateway.min.js"></script>
<script>
  document.getElementById('pay').addEventListener('click', async () => {
    const res = await fetch('/api/checkout/start', { method: 'POST' });
    const { paymentSessionId } = await res.json();

    const gateway = await PaymentGateway.load({ mode: 'sandbox' });
    await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });
  });
</script>
```

## React

```jsx
import { useState } from 'react';
import { load } from 'payment-gateway-browser-sdk';

export function PayButton({ productId }) {
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const { paymentSessionId, orderId } = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).then((r) => r.json());

      const gateway = await load({ mode: 'sandbox' });
      const result = await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

      if (!result.dismissed) {
        const { paid } = await fetch(`/api/checkout/status/${orderId}`).then((r) => r.json());
        if (paid) window.location.href = '/thank-you';
      }
    } finally {
      setBusy(false);
    }
  }

  return <button onClick={pay} disabled={busy}>{busy ? 'Opening…' : 'Pay now'}</button>;
}
```

## Browser support

Chrome 60+, Safari 12+, Firefox 60+, Edge 79+, and Android WebView 5+.
