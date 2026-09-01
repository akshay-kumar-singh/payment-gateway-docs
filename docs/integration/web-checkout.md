---
id: web-checkout
title: Web checkout
sidebar_position: 2
---

# Web checkout

One parameter — `redirectTarget` — decides how the checkout appears.

| Value | What the customer sees | Returns a promise? |
|---|---|---|
| `_self` *(default)* | Leaves your site, comes back to `returnUrl` | No — the page navigates away |
| `_blank` | Opens in a new tab | No |
| `_top` | Breaks out of any surrounding iframe | No |
| `_modal` | Popup over your page, never leaves | **Yes** |
| DOM element | Rendered inline in that element | **Yes** |

## Redirect

The page navigates away. Handle the result at your `returnUrl`.

```js
const paywize = await load({ mode: 'sandbox' });
paywize.checkout({ paymentSessionId, redirectTarget: '_self' });
// nothing after this line runs — the browser has left
```

Paywize appends `order_id` and `payment_status` to your return URL.

## Popup

The page stays. You **must** handle the promise.

```js
const result = await paywize.checkout({ paymentSessionId, redirectTarget: '_modal' });

if (result.dismissed) {
  // customer closed the popup without paying
} else if (result.paymentDetails?.paymentStatus === 'SUCCESS') {
  // still confirm on your server before shipping
}
```

## Inline

Renders inside an element you control. The checkout reports its height as the customer
moves between screens, and the SDK resizes the frame to match.

```jsx
function InlineCheckout({ paymentSessionId }) {
  const box = useRef(null);

  useEffect(() => {
    let cancelled = false;
    load({ mode: 'sandbox' }).then((paywize) => {
      if (cancelled || !box.current) return;
      paywize.checkout({ paymentSessionId, redirectTarget: box.current });
    });
    return () => { cancelled = true; };
  }, [paymentSessionId]);

  return <div ref={box} />;
}
```

## Which should you use?

**`_modal`.** The customer never leaves your site, you get a promise, and you keep
control of what happens next. Use `_self` only when a popup blocker is a real concern —
some in-app browsers block them.
