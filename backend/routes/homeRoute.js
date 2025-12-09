import {hello} from '../controllers/homeController.js'; 
export default async function homeRoute(fastify,opts){
  //  =======Home====== 

  fastify.get('/', hello);

}