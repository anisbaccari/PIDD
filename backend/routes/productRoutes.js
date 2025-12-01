import {authenticate} from '../security/jwt.js';
import {getAllProducts,getProductByCategory,addProductToOrder ,deleteFromCart,updateProduct} from '../controllers/productController.js';

export default async function productRoutes(fastify, opts) {
  fastify.get('/all', getProductByCategory);
  fastify.post('/add', addProductToOrder);
  fastify.delete("/remove", deleteFromCart);
  fastify.put("/update", updateProduct);
}