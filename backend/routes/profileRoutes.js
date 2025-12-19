// routes/profileRoutes.js (ou profilRoutes.js)
import { getProfile, updateUserProfile } from '../controllers/profileController.js';
import { authenticate } from '../security/jwt.js';

export default async function profileRoutes(fastify, options) {
  
  console.log('📝 Enregistrement des routes profil avec authentification');
  
  // ✅ GET / (devient /profil grace au prefix)
  fastify.get('/', {
    preHandler: [authenticate],
    handler: getProfile
  });

  // ✅ PUT / (devient /profil grace au prefix)
  fastify.put('/', {
    preHandler: [authenticate],
    handler: updateUserProfile
  });

  console.log('✅ Routes profil enregistrées avec middleware d\'authentification');
}