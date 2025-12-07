// backend/controllers/adminController.js
import { 
    getAllProducts, 
    addProduct, 
    deleteProduct, 
    updateProduct,
    getProductById 
} from './productController.js';

// Stockage temporaire des commandes
let ordersDatabase = [];

// ========== DASHBOARD ==========
export async function getAdminDashboard(request, reply) {
    try {
        const products = await getAllProducts();
        
        const stats = {
            totalProducts: products.length,
            lowStockProducts: products.filter(p => p.quantity < 10).length,
            totalStockValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
        };
        
        reply.send({ 
            success: true, 
            data: products,
            stats 
        });
    } catch (error) {
        console.error("[getAdminDashboard] error:", error);
        reply.status(500).send({ 
            success: false, 
            message: "Erreur serveur" 
        });
    }
}

// ========== PRODUITS ==========
export async function createProduct(request, reply) {
    try {
        const { name, price, quantity, category, img, description } = request.body;
        
        if (!name || !price || quantity === undefined || !category || !img || !description) {
            return reply.status(400).send({ 
                success: false, 
                message: "Tous les champs sont requis" 
            });
        }
        
        const newProduct = await addProduct(request.body);
        reply.status(201).send({ 
            success: true, 
            data: newProduct,
            message: "Produit créé avec succès"
        });
    } catch (error) {
        console.error("[createProduct] error:", error);
        reply.status(500).send({ 
            success: false, 
            message: "Erreur lors de la création du produit" 
        });
    }
}

// ========== COMMANDES ==========

// Note: Vous utilisez encore le stockage temporaire
// Vous devrez remplacer cela par les vraies fonctions de orderController

export async function getAllOrders(request, reply) {
    try {
        reply.send({
            success: true,
            count: ordersDatabase.length,
            orders: ordersDatabase
        });
    } catch (error) {
        console.error('[getAllOrders] error:', error);
        reply.status(500).send({
            success: false,
            message: 'Erreur lors de la récupération des commandes',
            error: error.message
        });
    }
}

export async function createOrder(request, reply) {
    try {
        const {
            userId,
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            items,
            subtotal,
            shipping,
            total,
            status,
            paymentMethod,
            shippingAddress,
            shippingMethod,
            trackingNumber
        } = request.body;
        
        const newOrder = {
            id: `ORD-${Date.now()}`,
            orderNumber,
            userId,
            customer: {
                name: customerName || 'Client',
                email: customerEmail || '',
                phone: customerPhone || ''
            },
            items: items || [],
            subtotal: parseFloat(subtotal) || 0,
            shipping: parseFloat(shipping) || 0,
            amount: parseFloat(total) || 0,
            status: status || 'confirmed',
            payment: {
                method: paymentMethod || 'card',
                transactionId: `TRX-${Date.now()}`
            },
            delivery: {
                method: shippingMethod || 'Standard',
                address: shippingAddress ? 
                    `${shippingAddress.street}, ${shippingAddress.postalCode} ${shippingAddress.city}` : 
                    '',
                trackingNumber: trackingNumber || ''
            },
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('fr-FR'),
            createdAt: new Date().toISOString()
        };
        
        ordersDatabase.push(newOrder);
        
        reply.status(201).send({
            success: true,
            message: 'Commande créée avec succès',
            order: newOrder
        });
        
    } catch (error) {
        console.error('[createOrder] error:', error);
        reply.status(500).send({
            success: false,
            message: 'Erreur lors de la création de la commande',
            error: error.message
        });
    }
}

export async function updateOrderStatus(request, reply) {
    try {
        const { orderId } = request.params;
        const { status, notes } = request.body;
        
        if (!orderId || !status) {
            return reply.status(400).send({
                success: false,
                message: 'ID commande et statut requis'
            });
        }
        
        const orderIndex = ordersDatabase.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return reply.status(404).send({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        ordersDatabase[orderIndex].status = status;
        if (notes) {
            ordersDatabase[orderIndex].notes = notes;
        }
        
        reply.send({
            success: true,
            message: 'Statut mis à jour avec succès',
            order: ordersDatabase[orderIndex]
        });
        
    } catch (error) {
        console.error('[updateOrderStatus] error:', error);
        reply.status(500).send({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
}

export async function deleteOrder(request, reply) {
    try {
        const { orderId } = request.params;
        
        if (!orderId) {
            return reply.status(400).send({
                success: false,
                message: 'ID commande requis'
            });
        }
        
        const orderIndex = ordersDatabase.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return reply.status(404).send({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        ordersDatabase.splice(orderIndex, 1);
        
        reply.send({
            success: true,
            message: 'Commande supprimée avec succès'
        });
        
    } catch (error) {
        console.error('[deleteOrder] error:', error);
        reply.status(500).send({
            success: false,
            message: 'Erreur lors de la suppression de la commande',
            error: error.message
        });
    }
}

// ========== GESTION DES STOCKS ==========
export async function decreaseProductStock(request, reply) {
    try {
        const { id } = request.params;
        const { quantity } = request.body;
        
        if (!id || !quantity || quantity <= 0) {
            return reply.status(400).send({
                success: false,
                message: 'ID produit et quantité valide requis'
            });
        }
        
        const product = await getProductById(id);
        
        if (!product) {
            return reply.status(404).send({
                success: false,
                message: 'Produit non trouvé'
            });
        }
        
        if (product.quantity < quantity) {
            return reply.status(400).send({
                success: false,
                message: `Stock insuffisant. Stock actuel: ${product.quantity}`,
                currentStock: product.quantity
            });
        }
        
        const newQuantity = product.quantity - quantity;
        const updatedProduct = await updateProduct(id, { quantity: newQuantity });
        
        reply.send({
            success: true,
            message: 'Stock mis à jour avec succès',
            data: {
                productId: id,
                productName: product.name,
                oldQuantity: product.quantity,
                quantityDecreased: quantity,
                newQuantity: newQuantity
            }
        });
        
    } catch (error) {
        console.error('[decreaseProductStock] error:', error);
        reply.status(500).send({
            success: false,
            message: 'Erreur lors de la mise à jour du stock',
            error: error.message
        });
    }
}

// Fonction utilitaire pour CSV (export)
export function convertToCSV(orders) {
    const headers = ['Numéro', 'Client', 'Date', 'Montant', 'Statut'];
    const rows = orders.map(order => [
        order.orderNumber,
        order.customer.name,
        order.date,
        order.amount,
        order.status
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}