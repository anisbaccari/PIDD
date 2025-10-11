import {authenticate} from '../security/jwt.js';
import {getAllProducts} from '../controllers/productController.js';

export default async function productRoutes(fastify, opts) {
  fastify.get('/', getAllProducts);
}