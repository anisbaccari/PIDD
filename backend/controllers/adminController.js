export const getAdmin= async (request, reply) => {
  console.log("====== [getAdmin] : Admin",);
  reply.send({
    message: 'Admin',
    user: request.user, // comes from middleware
  });
};
