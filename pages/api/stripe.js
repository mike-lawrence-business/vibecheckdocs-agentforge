// Stripe checkout creation and webhook stub
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId, successUrl, cancelUrl } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return res.status(200).json({ url: session.url });
  }
  return res.status(405).end();
}
