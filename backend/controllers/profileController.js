export const getProfile = async (request, reply) => {
  reply.send({
    message: 'Profile data',
  //  user: request.user, // comes from middleware
  });
};

export const updateProfile = async (request, reply) => {
  reply.send({
    message: 'Profile updated',
    user: request.user,
    newData: request.body,
  });
};