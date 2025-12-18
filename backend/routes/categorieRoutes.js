import { 
  getAllCategorie,
  getCategorieById
} from '../controllers/categorieController.js';

export default async function categorieRoutes(fastify) {

  fastify.get('/', getAllCategorie);
  fastify.get('/:id', getCategorieById);
}
