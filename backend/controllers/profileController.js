import { User } from '../models/User.js';

export const getProfile = async (request, reply) => {
  try {
    const userId = request.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'nom', 'prenom', 'username'] // ne pas renvoyer le passwordHash
    });

    if (!user) return reply.status(404).send({ message: 'Utilisateur non trouvé' });

    reply.send({ message: 'Profile data', user });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ message: 'Erreur serveur' });
  }
};


import bcrypt from 'bcrypt';

export const updateProfile = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { nom, prenom, username, password } = request.body;

    const user = await User.findByPk(userId);
    if (!user) return reply.status(404).send({ message: 'Utilisateur non trouvé' });

    user.nom = nom;
    user.prenom = prenom;
    user.username = username;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.passwordHash = hash;
    }

    await user.save();

    reply.send({ message: 'Profil mis à jour', user: { id: user.id, nom: user.nom, prenom: user.prenom, username: user.username } });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ message: 'Erreur serveur' });
  }
};
