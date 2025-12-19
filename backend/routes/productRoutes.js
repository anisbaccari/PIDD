import {authenticate} from '../security/jwt.js';
import {getAllProducts,
  getProductByCategory,
  getProductById,
  addProductToOrder,
  deleteProduct ,
  addProductByAdmin,
  deleteFromCart,
  updateProduct} from '../controllers/productController.js';

export default async function productRoutes(fastify, opts) {
   fastify.get('/category/:id', getProductByCategory);
  fastify.get('/allproduct', getAllProducts);
  fastify.post('/addAdmin', addProductByAdmin);
  fastify.post('/getProduct', getProductById);

  fastify.post('/add', addProductToOrder);
  fastify.delete("/removeFromCart", deleteFromCart);
  fastify.delete("/deleteProduct", deleteProduct);
  fastify.put("/update/:id", updateProduct);
}