import {authenticate} from '../security/jwt.js';
import {getAllProducts,addProductToOrder ,deleteFromCart} from '../controllers/productController.js';

export default async function productRoutes(fastify, opts) {
  fastify.get('/all', getAllProducts);
   fastify.post('/add', addProductToOrder);
   fastify.delete("/remove", deleteFromCart);

}