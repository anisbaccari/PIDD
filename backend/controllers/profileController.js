import { User } from "../models/User.js";

export const getProfile = async (request, reply) => {
  
  try {
    const idByToken = request.user?.id;
   // console.log("====== [getPRofile] : params ",request.params);
    console.log("====== [getPRofile] : idByToken ",idByToken);

   const res = await User.findOne({where : {id:idByToken}});

    console.log("====== [getPRofile] : user : ",res);


      
      reply.send({
        user : {id:res.id, username: res.username, name : res.name, 
          lastName: res.lastName
        }
      })
  } catch (error) {
    console.log("[getProfil] catch error : ",error);
  }
};

export async function updateUserProfile(request, reply) {
  try {
    console.log("====== [updateUserProfile] ");

    const { id, username, isAdmin,name,lastName } = request.body;
    console.log("[updateUserProfile] : id, username, isAdmin,name,lastName",id, username, isAdmin,name,lastName);

    if (!id) {
    console.log(" [updateUserProfile]  no id",);

      return reply.code(400).send({ error: "Missing user id" });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
    console.log(" [updateUserProfile]  no user",);

      return reply.code(404).send({ error: "User not found" });
    }

    // Update allowed fields
    if (username) user.username = username;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    user.name = name;
    user.lastName = lastName;
    await user.save();

    return reply.send({ success: true, user });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({ error: "Server error" });
  }
}

