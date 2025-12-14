import { paidOrder } from "../controllers/stripeController.js";


export default async function stripeRoutes(fastify,opts)
{
    fastify.post('/create-payment-intent',paidOrder)
}