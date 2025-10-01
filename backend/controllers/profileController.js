export const getProfile = async (request, reply) => {
  console.log("====== [getPRofile] : user : ",request.user);
  reply.send({
    message: 'Profile data',
    user: request.user, // comes from middleware
  });
};

export const updateProfile = async (request, reply) => {
  reply.send({
    message: 'Profile updated',
    user: request.user,
    newData: request.body,
  });
};