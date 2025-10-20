
export default async function homeRoute(fastify,opts){
  //  =======Home====== 

  fastify.get('/', async(request,reply) => {
    reply.send("hello");
  });

}