// controllers/userController.js
import { User } from '../models/User.js';

export async function getAllUsers(req, reply) {
  try {
    console.log("========== [getAllUsers] ==========");
    
    // Récupérer tous les utilisateurs (sans les mots de passe)
    const users = await User.findAll({
      attributes: { 
        exclude: ['password'] // Exclure le mot de passe pour la sécurité
      },
      order: [['createdAt', 'DESC']]
    });
    
    reply.send({
      success: true,
      data: users,
      count: users.length
    });
    
  } catch (error) {
    console.error("[getAllUsers] error:", error);
    reply.status(500).send({
      success: false,
      message: "Erreur serveur lors de la récupération des utilisateurs"
    });
  }
}

export async function getUserById(req, reply) {
  try {
    const { id } = req.params;
    console.log("========== [getUserById] ==========", id);
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    
    reply.send({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error("[getUserById] error:", error);
    reply.status(500).send({
      success: false,
      message: "Erreur serveur"
    });
  }
}