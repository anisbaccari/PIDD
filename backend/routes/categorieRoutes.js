import {getAllCategorie} from '../controllers/categorieController.js'

export default async function categorieRoutes(fastify, opts) {
  fastify.get('/',  getAllCategorie);
}