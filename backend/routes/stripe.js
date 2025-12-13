// backend/routes/stripe.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

// Initialiser Stripe avec votre clé secrète
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Route pour récupérer la clé publique
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Route pour créer un PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', customer_email, customer_name, items, userId } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        customer_email,
        customer_name,
        items: JSON.stringify(items),
        userId: userId || 'guest'
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;