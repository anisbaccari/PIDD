import { User } from "../models/User.js";

export const getProfile = async (request, reply) => {
  
  try {
    const { id } = request.params;
    const idByToken = request.user?.id;
   // console.log("====== [getPRofile] : params ",request.params);
 //   console.log("====== [getPRofile] : idByToken ",idByToken);
  //  console.log("====== [getPRofile] : Id ",id);

   const res = await User.findOne({where : {id:idByToken}});

 //   console.log("====== [getPRofile] : user : ",res);


      
      reply.send({
        user : {id:res.id, username: res.username}
      })
  } catch (error) {
    console.log("[getProfil] catch error : ",error);
  }
};

export const updateProfile = async (request, reply) => {
  reply.send({
    message: 'Profile updated',
    user: request.user,
    newData: request.body,
  });
};