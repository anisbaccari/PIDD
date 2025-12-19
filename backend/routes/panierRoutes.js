// routes/panierRoutes.js
import { authenticate } from '../security/jwt.js';
import { 
  getPanier,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  clearUserCart
} from '../controllers/panierController.js';

export default async function panierRoutes(fastify, opts) {
  // GET /panier - Récupérer le panier
  fastify.get('/', { preHandler: [authenticate] }, getPanier);

  // POST /panier - Ajouter un produit
  fastify.post('/', { preHandler: [authenticate] }, addProductToCart);

  // PUT /panier/:productId - Mettre à jour la quantité
  fastify.put('/:productId', { preHandler: [authenticate] }, updateCartItemQuantity);

  // DELETE /panier/:productId - Retirer un produit
  fastify.delete('/:productId', { preHandler: [authenticate] }, removeProductFromCart);

  // DELETE /panier - Vider le panier
  fastify.delete('/', { preHandler: [authenticate] }, clearUserCart);
}