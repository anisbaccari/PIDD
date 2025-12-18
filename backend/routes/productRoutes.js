import { 
  getAllProducts,
  getProductByCategory,
  addProductToOrder,
  deleteProduct,
  getProductById,
  updateProduct
} from '../controllers/productController.js';

export default async function productRoutes(fastify) {

  // ✅ Routes spécifiques D’ABORD
  fastify.get('/all', getAllProducts);
  fastify.get('/category/:id', getProductByCategory);

  // ✅ Routes dynamiques APRÈS
  fastify.get('/:id', getProductById);

  // ✅ CRUD
  fastify.post('/add', addProductToOrder);
  fastify.delete('/delete/:id', deleteProduct);
  fastify.put('/update/:id', updateProduct);
}
