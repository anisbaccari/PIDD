// backend/routes/adminRoutes.js
import fp from 'fastify-plugin'; // 💡 Ajout pour garantir que le fichier est chargé correctement

import { 
    getAdminDashboard,
    createProduct,
    updateProduct,
    deleteProduct 
} from '../controllers/adminController.js';

// Nous enrobons la fonction de route avec fastify-plugin.
// Cela permet d'enregistrer les routes correctement, surtout si vous utilisez des décorateurs ou hooks.
async function adminRoutes(fastify, options) {
    
    // Route GET pour le dashboard admin
    fastify.get('/admin/dashboard', getAdminDashboard);
    
    // Routes CRUD pour les produits
    fastify.post('/admin/products', createProduct);
    fastify.put('/admin/products/:id', updateProduct);
    fastify.delete('/admin/products/:id', deleteProduct);
    
    // Autres routes admin...
}

// Exportation de la fonction de route en tant que plugin Fastify
export default fp(adminRoutes);