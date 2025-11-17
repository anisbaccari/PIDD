import { User } from "../models/User.js";

export const getProfile = async (request, reply) => {
  
  try {
    const { id } = request.params;
    console.log("====== [getPRofile] : Id ",id);

    const user = await User.findOne({where : {id}});
    console.log("====== [getPRofile] : user : ",user);

      
      reply.send({
        user : {username:'anis'}
      })
  } catch (error) {
    
  }
};

export const updateProfile = async (request, reply) => {
  reply.send({
    message: 'Profile updated',
    user: request.user,
    newData: request.body,
  });
};