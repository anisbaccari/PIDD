import {authenticate} from '../security/jwt.js';
import {getAllProducts,getProductByCategory,addProductToOrder,deleteProduct ,deleteFromCart,updateProduct} from '../controllers/productController.js';

export default async function productRoutes(fastify, opts) {
  fastify.get('/all', getProductByCategory);
  fastify.get('/allProduct', getAllProducts);
  fastify.post('/add', addProductToOrder);
  fastify.delete("/removeFromCart", deleteFromCart);
  fastify.delete("/deleteProduct", deleteProduct);
  fastify.put("/update/:id", updateProduct);
}