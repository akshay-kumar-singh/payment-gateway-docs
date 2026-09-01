---
id: testing
title: Test instruments
sidebar_position: 5
---

# Test instruments

In sandbox, these produce the same outcome every time — so you can build and test your
error handling for failures that are hard to trigger on purpose.

## Cards

| Number | Outcome |
|---|---|
| `4111 1111 1111 1111` | Succeeds |
| `5555 5555 5555 4444` | Succeeds (Mastercard) |
| `6011 0000 0000 0004` | Succeeds (RuPay) |
| `4000 0000 0000 0002` | Declined by bank |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVV |
| `4000 0000 0000 0119` | Gateway timeout |

Any future expiry and any CVV work.

## UPI

| UPI ID | Outcome |
|---|---|
| `success@pgtest` | Pending, then succeeds after ~5 seconds |
| `failure@pgtest` | Customer declines |
| `timeout@pgtest` | Never approved — tests your timeout handling |
| `invalid@pgtest` | UPI ID does not exist |

`success@pgtest` deliberately spends time in `PENDING`. Real UPI does the same, and it
is the state most integrations get wrong.

## Net banking and wallets

**Canara Bank** and **MobiKwik** are seeded as down, so you can test the
`BANK_UNAVAILABLE` path. Everything else succeeds.

## Error codes

| Code | Retry with |
|---|---|
| `INSUFFICIENT_FUNDS` | A different method |
| `CARD_DECLINED` | A different method |
| `INCORRECT_CVV` | The same card |
| `UPI_TIMEOUT` | The same method |
| `BANK_UNAVAILABLE` | A different method |
| `GATEWAY_TIMEOUT` | The same method |

Show the customer something they can act on. "Payment failed" with no detail is where
conversion goes to die — someone told *insufficient balance* tries another card, someone
told nothing leaves.
