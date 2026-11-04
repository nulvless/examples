# Stripe webhook

Receives Stripe events, verifies the `Stripe-Signature` header before reading
them, and logs the ones it handles. Replace the `console.log` calls in
`handleEvent` with your own logic.

## Use it

```bash
nulvless functions new stripe-webhook --template stripe-webhook
nulvless secrets set STRIPE_SECRET_KEY --function stripe-webhook
nulvless secrets set STRIPE_WEBHOOK_SECRET --function stripe-webhook
```

In the Stripe Dashboard, add an endpoint at
`https://<project>.nulvless.co/functions/stripe-webhook` and copy its signing
secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

## Try it

```bash
stripe listen --forward-to https://<project>.nulvless.co/functions/stripe-webhook
stripe trigger checkout.session.completed
```

The function's logs show `Checkout … completed`.
