import { User } from "../models/User.js";

export const getProfile = async (request, reply) => {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    reply.send({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        address: user.address,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error("[getProfile]", error);
    reply.code(500).send({ error: "Server error" });
  }
};
export async function updateUserProfile(request, reply) {
  try {
    console.log("🔐 request.user =", request.user);

    const userId = request.user?.id || request.user?.userId;
    console.log("🆔 userId =", userId);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const { username, name, lastName, password } = request.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    if (username) user.username = username;
    if (name) user.name = name;
    if (lastName) user.lastName = lastName;

    if (password) {
      user.password = await user.hashPassword(password);
    }

    await user.save();

    return reply.send({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName
       
      }
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return reply.code(500).send({ error: "Server error" });
  }
}
