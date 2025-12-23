
// routes/cartRoutes.js
import { authenticate } from '../security/jwt.js'
import {
  getCart,
  addItemToCart,
  updateCartItem,
   prepareCheckout,
  confirmCartOrder,
  getCurrentOrder,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js'

export default async function cartRoutes(fastify, options) {
  console.log('🛒 Enregistrement des routes panier...')

  // GET /api/cart - Récupérer le panier
  fastify.get('/', {
    preHandler: [authenticate]
  }, getCart)
   fastify.get('/current', {
    preHandler: [authenticate]
  }, getCurrentOrder)

  // POST /api/cart/item - Ajouter un produit au panier
  fastify.post('/item', {
    preHandler: [authenticate]
  }, addItemToCart)

  // PUT /api/cart/item/:id - Modifier la quantité
  fastify.put('/item/:id', {
    preHandler: [authenticate]
  }, updateCartItem)

  // DELETE /api/cart/item/:id - Supprimer un article
  fastify.delete('/item/:id', {
    preHandler: [authenticate]
  }, removeCartItem)

  // DELETE /api/cart - Vider le panier
  fastify.delete('/', {
    preHandler: [authenticate]
  }, clearCart)
fastify.post('/checkout', {
  preHandler: [authenticate]
}, prepareCheckout)
// POST /api/orders/confirm - Confirmer le panier (NOUVELLE ROUTE)
  fastify.post('/confirm', {
    preHandler: [authenticate]
  }, confirmCartOrder)


  console.log('✅ Routes panier enregistrées')
}