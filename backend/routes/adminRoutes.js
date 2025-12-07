// backend/routes/adminRoutes.js
import fp from 'fastify-plugin';

import { 
    getAdminDashboard,
    createProduct,
    decreaseProductStock,
    // Routes commandes
    getAllOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    convertToCSV
} from '../controllers/adminController.js';

// Importer aussi les fonctions de productController
import { deleteProduct, updateProduct } from '../controllers/productController.js';

async function adminRoutes(fastify, options) {
    
    // ========== ROUTES DASHBOARD ==========
    fastify.get('/admin/dashboard', getAdminDashboard);
    
    // ========== ROUTES PRODUITS ==========
    fastify.post('/admin/products', createProduct);
    fastify.put('/admin/products/:id', updateProduct);
    fastify.delete('/admin/products/:id', deleteProduct);
    
    // Route pour diminuer le stock d'un produit
    fastify.patch('/admin/products/:id/decrease-stock', decreaseProductStock);
    
    // ========== ROUTES COMMANDES ==========
    fastify.get('/admin/orders', getAllOrders);
    fastify.post('/admin/orders', createOrder);
    fastify.put('/admin/orders/:orderId/status', updateOrderStatus);
    fastify.delete('/admin/orders/:orderId', deleteOrder); 
    
    // Route pour exporter les commandes en CSV
    fastify.get('/admin/orders/export', async (request, reply) => {
        try {
            // Récupérer les commandes via getAllOrders
            const { orders } = await getAllOrders(request, reply);
            const csv = convertToCSV(orders);
            
            reply
                .type('text/csv')
                .header('Content-Disposition', 'attachment; filename=commandes.csv')
                .send(csv);
        } catch (error) {
            console.error('Erreur export CSV:', error);
            reply.status(500).send({ 
                success: false, 
                error: 'Erreur lors de l\'export' 
            });
        }
    });
}

export default fp(adminRoutes);