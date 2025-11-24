import { Order } from '../models/Order.js';

export async function getPanier(request, reply) {
  try {

        let id = request.user.id; 
        console.log(" = ========== = === user id :",id);
        const panier = await Order.findAll();
        reply.send(panier);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
}
