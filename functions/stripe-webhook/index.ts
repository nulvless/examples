import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const cryptoProvider = Stripe.createSubtleCryptoProvider();

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      console.log(`Checkout ${event.data.object.id} completed for ${event.data.object.customer_email}`);
      break;
    case 'customer.subscription.deleted':
      console.log(`Subscription ${event.data.object.id} ended`);
      break;
    default:
      console.log(`Ignored ${event.type}`);
  }
}

export default async function handler(req: Request): Promise<Response> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return Response.json({ error: 'Missing Stripe-Signature header.' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret, undefined, cryptoProvider);
  } catch {
    return Response.json({ error: 'The signature does not match this endpoint.' }, { status: 400 });
  }

  await handleEvent(event);

  return Response.json({ received: true });
}
