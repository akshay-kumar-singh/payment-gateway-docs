---
id: frameworks
title: React, Angular, Vue
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# React, Angular, Vue and the rest

There is **one** browser SDK, and it works in every framework.

That is not a simplification — React, Angular, Vue and Svelte all run the same
JavaScript in the same browser. There is no React build of the SDK, no Angular build,
and no reason for either to exist.

```js
import { load } from 'payment-gateway-browser-sdk';   // identical everywhere
```

What differs is only *where you put the call* — a hook, a service, a composable. The
tabs below show the same twelve lines in four shapes.

:::tip One import, every framework
If a gateway's docs show React and Angular tabs, they are showing the same package in
different syntax. Nobody ships a per-framework payment SDK.
:::

## Opening the checkout

<Tabs groupId="framework">
<TabItem value="react" label="React" default>

```jsx
import { useState } from 'react';
import { load } from 'payment-gateway-browser-sdk';

export function BuyButton({ productId }) {
  const [busy, setBusy] = useState(false);

  async function buy() {
    setBusy(true);
    try {
      // 1. your server creates the order
      const { paymentSessionId, orderId } = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).then((r) => r.json());

      // 2. open the hosted checkout
      const gateway = await load({ mode: 'sandbox' });
      await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

      // 3. confirm on YOUR server. The browser can lie.
      await fetch(`/api/checkout/status/${orderId}`);
    } finally {
      setBusy(false);
    }
  }

  return <button onClick={buy} disabled={busy}>{busy ? 'Opening…' : 'Buy now'}</button>;
}
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { Component } from '@angular/core';
import { load } from 'payment-gateway-browser-sdk';

@Component({
  selector: 'buy-button',
  template: `<button (click)="buy()" [disabled]="busy">
    {{ busy ? 'Opening…' : 'Buy now' }}
  </button>`,
})
export class BuyButtonComponent {
  busy = false;
  productId!: string;

  async buy() {
    this.busy = true;
    try {
      // 1. your server creates the order
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: this.productId }),
      });
      const { paymentSessionId, orderId } = await res.json();

      // 2. open the hosted checkout
      const gateway = await load({ mode: 'sandbox' });
      await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

      // 3. confirm on YOUR server. The browser can lie.
      await fetch(`/api/checkout/status/${orderId}`);
    } finally {
      this.busy = false;
    }
  }
}
```

</TabItem>
<TabItem value="vue" label="Vue">

```vue
<script setup>
import { ref } from 'vue';
import { load } from 'payment-gateway-browser-sdk';

const props = defineProps({ productId: String });
const busy = ref(false);

async function buy() {
  busy.value = true;
  try {
    // 1. your server creates the order
    const { paymentSessionId, orderId } = await fetch('/api/checkout/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: props.productId }),
    }).then((r) => r.json());

    // 2. open the hosted checkout
    const gateway = await load({ mode: 'sandbox' });
    await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

    // 3. confirm on YOUR server. The browser can lie.
    await fetch(`/api/checkout/status/${orderId}`);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <button @click="buy" :disabled="busy">{{ busy ? 'Opening…' : 'Buy now' }}</button>
</template>
```

</TabItem>
<TabItem value="js" label="Plain JS / CDN">

```html
<script src="https://cdn.jsdelivr.net/npm/payment-gateway-browser-sdk@1/dist/payment-gateway.min.js"></script>

<button id="buy">Buy now</button>

<script>
  document.getElementById('buy').addEventListener('click', async () => {
    // 1. your server creates the order
    const { paymentSessionId, orderId } = await fetch('/api/checkout/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'sku_headphones' }),
    }).then((r) => r.json());

    // 2. open the hosted checkout
    const gateway = await PaymentGateway.load({ mode: 'sandbox' });
    await gateway.checkout({ paymentSessionId, redirectTarget: '_modal' });

    // 3. confirm on YOUR server. The browser can lie.
    await fetch(`/api/checkout/status/${orderId}`);
  });
</script>
```

No build step. The CDN build defines `window.PaymentGateway`.

</TabItem>
</Tabs>

## Server-side rendering

`load()` returns `null` on the server instead of throwing, so importing the SDK in
Next.js, Nuxt or Angular Universal will not crash your build.

<Tabs groupId="framework">
<TabItem value="react" label="React" default>

```jsx
'use client';                       // Next.js App Router

const gateway = await load({ mode: 'sandbox' });
if (!gateway) return;               // running on the server — nothing to open
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private platformId = inject(PLATFORM_ID);

async buy() {
  if (!isPlatformBrowser(this.platformId)) return;
  const gateway = await load({ mode: 'sandbox' });
  ...
}
```

</TabItem>
<TabItem value="vue" label="Vue">

```js
// Nuxt: run it client-side only
if (import.meta.server) return;

const gateway = await load({ mode: 'sandbox' });
```

</TabItem>
<TabItem value="js" label="Plain JS / CDN">

A `<script>` tag only ever runs in a browser, so there is nothing to guard.

</TabItem>
</Tabs>

## Rendering inline

For the inline style you pass a real DOM element rather than a string. Each framework
has its own way of getting one.

<Tabs groupId="framework">
<TabItem value="react" label="React" default>

```jsx
const box = useRef(null);

// Read .current at click time, not at render time — during the render that first
// shows the box, ref.current is still null.
await gateway.checkout({ paymentSessionId, redirectTarget: box.current });

return <div ref={box} style={{ minHeight: 560 }} />;
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
@ViewChild('box') box!: ElementRef<HTMLDivElement>;

await gateway.checkout({ paymentSessionId, redirectTarget: this.box.nativeElement });
```

```html
<div #box style="min-height: 560px"></div>
```

</TabItem>
<TabItem value="vue" label="Vue">

```vue
<script setup>
const box = ref(null);

await gateway.checkout({ paymentSessionId, redirectTarget: box.value });
</script>

<template>
  <div ref="box" style="min-height: 560px" />
</template>
```

</TabItem>
<TabItem value="js" label="Plain JS / CDN">

```js
const box = document.getElementById('checkout-box');
await gateway.checkout({ paymentSessionId, redirectTarget: box });
```

</TabItem>
</Tabs>

:::warning Pass the element, not a string
`redirectTarget: 'inline'` means nothing to the SDK. Anything that is not one of
`_self`, `_blank`, `_top` or `_modal` is treated as a DOM element — so a wrong string
falls through to the default and navigates away instead of rendering inline.
:::

## What about mobile?

React Native and Flutter are genuinely different — no DOM, so no iframe. Those need
their own SDKs, which do not exist yet.

For a mobile **web** page, everything above applies unchanged.
