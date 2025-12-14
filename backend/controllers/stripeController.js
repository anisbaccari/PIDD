
import Stripe from 'stripe';
import { getOrder,updateOrder } from './panierController.js';

export async function paidOrder(request,reply)
{
   try {
    console.log('\x1b[31m%s\x1b[0m',"==== [paidOrder] =======");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { amount,orderId } = request.body;
    console.log( '[STRIPE] : amout  ',amount,' - orderId : ',orderId);
  
    const order = updateOrder(orderId)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // euros → cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true
      }
    });
  
    console.log(" [paidOrder] succed ");

    reply.send({
      clientSecret: paymentIntent.client_secret,
      order :order
    });
   } catch (error) {
    console.error('[STRIPE] error : ',error)
    
   }
}

