import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.STRIPE_PORT || 3001;

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Route : clé publique
app.get('/api/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Erreur PaymentIntent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cart`
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur Checkout Session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test
app.get('/', (req, res) => {
  res.json({ message: 'Stripe backend fonctionne ✔️' });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Stripe server démarré sur le port ${PORT}`);
});
