// controllers/cartController.js
import { Order } from '../models/Order.js'
import { OrderItem } from '../models/OrderItem.js'
import { Product } from '../models/Product.js'

/**
 * 🔹 GET /api/cart
 * Récupère le panier (commande pending) de l'utilisateur
 */
export async function getCart(request, reply) {
  try {
    console.log('======================== [getCart] ========================')
    
    const userId = request.user?.id
    
    if (!userId) {
      console.error('[getCart] userId manquant')
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    console.log(`[getCart] Recherche du panier pour userId: ${userId}`)

    // Rechercher la commande "panier" (status: pending)
    const order = await Order.findOne({
      where: { 
        userId, 
        status: 'pending' 
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'img', 'description', 'quantity']
        }]
      }]
    })

    // Si pas de panier, retourner un panier vide
    if (!order) {
      console.log('[getCart] Aucun panier trouvé')
      return reply.send({
        success: true,
        orderId: null,
        items: [],
        totalItems: 0,
        subtotal: 0
      })
    }

    console.log(`[getCart] Commande trouvée: #${order.id}`)
    console.log(`[getCart] Nombre d'items: ${order.items?.length || 0}`)

    // Vérifier si items existe
    if (!order.items || order.items.length === 0) {
      console.log('[getCart] Panier vide (aucun item)')
      return reply.send({
        success: true,
        orderId: order.id,
        items: [],
        totalItems: 0,
        subtotal: 0
      })
    }

    // Calculer les totaux
    let subtotal = 0
    let totalItems = 0
    
    const formattedItems = order.items.map(item => {
      console.log(`[getCart] Item: ${item.id}, ProductId: ${item.productId}, Quantity: ${item.quantity}, UnitPrice: ${item.unitPrice}`)
      
      const itemTotal = item.quantity * parseFloat(item.unitPrice || 0)
      subtotal += itemTotal
      totalItems += item.quantity
      
      return {
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice || 0),
        total: itemTotal
      }
    })

    console.log(`✅ [getCart] Panier: ${totalItems} articles, subtotal: ${subtotal}€`)

    reply.send({
      success: true,
      orderId: order.id,
      items: formattedItems,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })

  } catch (error) {
    console.error('❌ [getCart] Erreur complète:', error)
    console.error('❌ [getCart] Stack:', error.stack)
    
    reply.code(500).send({ 
      success: false,
      error: 'Erreur lors de la récupération du panier',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

/**
 * 🔹 POST /api/cart/item
 * Ajoute un produit au panier
 */
export async function addItemToCart(request, reply) {
  try {
    console.log('======================== [addItemToCart] ========================')
    
    const userId = request.user?.id
    const { productId, quantity } = request.body

    console.log(`[addItemToCart] userId: ${userId}, productId: ${productId}, quantity: ${quantity}`)

    if (!userId) {
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    // Validation
    if (!productId || !quantity || quantity <= 0) {
      return reply.code(400).send({ 
        success: false,
        error: 'Données invalides' 
      })
    }

    // Vérifier que le produit existe
    const product = await Product.findByPk(productId)
    
    if (!product) {
      console.error(`[addItemToCart] Produit ${productId} introuvable`)
      return reply.code(404).send({ 
        success: false,
        error: 'Produit introuvable' 
      })
    }

    console.log(`[addItemToCart] Produit trouvé: ${product.name}, stock: ${product.quantity}`)

    // Vérifier le stock
    if (product.quantity < quantity) {
      return reply.code(400).send({
        success: false,
        error: `Stock insuffisant. Disponible: ${product.quantity}`
      })
    }

    // 1️⃣ Trouver ou créer la commande "pending"
    let order = await Order.findOne({
      where: { userId, status: 'pending' }
    })

    if (!order) {
      console.log('[addItemToCart] Création d\'une nouvelle commande')
      order = await Order.create({
        userId,
        totalPrice: 0,
        status: 'pending'
      })
      console.log(`[addItemToCart] Commande créée: #${order.id}`)
    } else {
      console.log(`[addItemToCart] Commande existante: #${order.id}`)
    }

    // 2️⃣ Vérifier si le produit est déjà dans le panier
    let item = await OrderItem.findOne({
      where: {
        orderId: order.id,
        productId
      }
    })

    if (item) {
      // Produit déjà présent → augmenter la quantité
      console.log(`[addItemToCart] Item existant, ancienne qté: ${item.quantity}`)
      item.quantity += quantity
      await item.save()
      console.log(`[addItemToCart] Nouvelle quantité: ${item.quantity}`)
    } else {
      // Nouveau produit → créer un OrderItem
      console.log('[addItemToCart] Création d\'un nouvel OrderItem')
      item = await OrderItem.create({
        orderId: order.id,
        productId,
        quantity,
        unitPrice: product.price
      })
      console.log(`[addItemToCart] OrderItem créé: #${item.id}`)
    }

    // 3️⃣ Recalculer le total de la commande
    const items = await OrderItem.findAll({ 
      where: { orderId: order.id } 
    })
    
    const total = items.reduce(
      (sum, i) => sum + (Number(i.unitPrice || 0) * i.quantity),
      0
    )

    order.totalPrice = total
    await order.save()

    console.log(`✅ [addItemToCart] Total: ${total}€`)

    reply.send({ 
      success: true,
      message: 'Produit ajouté au panier',
      orderId: order.id,
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: total
    })

  } catch (error) {
    console.error('❌ [addItemToCart] Erreur:', error)
    console.error('❌ [addItemToCart] Stack:', error.stack)
    
    reply.code(500).send({ 
      success: false,
      error: 'Erreur lors de l\'ajout au panier',
      message: error.message
    })
  }
}

/**
 * 🔹 PUT /api/cart/item/:id
 * Met à jour la quantité d'un article
 */
export async function updateCartItem(request, reply) {
  try {
    console.log('======================== [updateCartItem] ========================')
    
    const { id } = request.params
    const { quantity } = request.body
    const userId = request.user?.id

    console.log(`[updateCartItem] itemId: ${id}, quantity: ${quantity}, userId: ${userId}`)

    if (!userId) {
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    // Récupérer l'item avec sa commande
    const item = await OrderItem.findByPk(id, {
      include: [{
        model: Order,
        as: 'order',
        where: { 
          userId,
          status: 'pending'
        }
      }]
    })

    if (!item) {
      console.error(`[updateCartItem] Item ${id} introuvable`)
      return reply.code(404).send({ 
        success: false,
        error: 'Article introuvable' 
      })
    }

    if (quantity < 1) {
      // Supprimer l'article
      console.log(`[updateCartItem] Suppression de l'item ${id}`)
      await item.destroy()
    } else {
      // Mettre à jour la quantité
      console.log(`[updateCartItem] Mise à jour: ${item.quantity} → ${quantity}`)
      item.quantity = quantity
      await item.save()
    }

    // Recalculer le total
    const order = item.order
    const items = await OrderItem.findAll({ 
      where: { orderId: order.id } 
    })
    
    const total = items.reduce(
      (sum, i) => sum + (Number(i.unitPrice || 0) * i.quantity),
      0
    )

    order.totalPrice = total
    await order.save()

    console.log(`✅ [updateCartItem] Nouveau total: ${total}€`)

    reply.send({ 
      success: true,
      message: 'Panier mis à jour' 
    })

  } catch (error) {
    console.error('❌ [updateCartItem] Erreur:', error)
    console.error('❌ [updateCartItem] Stack:', error.stack)
    
    reply.code(500).send({ 
      success: false,
      error: 'Erreur lors de la mise à jour',
      message: error.message
    })
  }
}

/**
 * 🔹 DELETE /api/cart/item/:id
 * Supprime un article du panier
 */
export async function removeCartItem(request, reply) {
  try {
    console.log('======================== [removeCartItem] ========================')
    
    const { id } = request.params
    const userId = request.user?.id

    console.log(`[removeCartItem] itemId: ${id}, userId: ${userId}`)

    if (!userId) {
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    const item = await OrderItem.findByPk(id, {
      include: [{
        model: Order,
        as: 'order',
        where: { 
          userId,
          status: 'pending'
        }
      }]
    })

    if (!item) {
      console.error(`[removeCartItem] Item ${id} introuvable`)
      return reply.code(404).send({ 
        success: false,
        error: 'Article introuvable' 
      })
    }

    const orderId = item.order.id
    await item.destroy()
    console.log(`[removeCartItem] Item ${id} supprimé`)

    // Recalculer le total
    const items = await OrderItem.findAll({ 
      where: { orderId } 
    })
    
    const total = items.reduce(
      (sum, i) => sum + (Number(i.unitPrice || 0) * i.quantity),
      0
    )

    const order = await Order.findByPk(orderId)
    order.totalPrice = total
    await order.save()

    console.log(`✅ [removeCartItem] Nouveau total: ${total}€`)

    reply.send({ 
      success: true,
      message: 'Article supprimé' 
    })

  } catch (error) {
    console.error('❌ [removeCartItem] Erreur:', error)
    console.error('❌ [removeCartItem] Stack:', error.stack)
    
    reply.code(500).send({ 
      success: false,
      error: 'Erreur lors de la suppression',
      message: error.message
    })
  }
}
export async function getCurrentOrder(request, reply) {
  const userId = request.user.id

  const order = await Order.findOne({
    where: { userId, status: 'pending' },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ model: Product, as: 'product' }]
    }]
  })

  if (!order) {
    return reply.send({ success: true, order: null })
  }

  return reply.send({
    success: true,
    order: {
      id: order.id,
      items: order.items,
      subtotal: order.items.reduce(
        (t, i) => t + i.unitPrice * i.quantity, 0
      )
    }
  })
}
export async function prepareCheckout(request, reply) {
  try {
    const userId = request.user.id

    const order = await Order.findOne({
      where: {
        userId,
        status: 'pending'
      },
      include: [{ model: OrderItem, as: 'items' }]
    })

    if (!order || order.items.length === 0) {
      return reply.code(400).send({
        success: false,
        message: 'Panier vide'
      })
    }

    // ✅ OPTIONNEL : flag pour l’admin
    await order.update({
      readyForCheckout: true // si tu veux
    })

    return reply.send({
      success: true,
      orderId: order.id
    })

  } catch (error) {
    console.error('❌ prepareCheckout error:', error)
    reply.code(500).send({
      success: false,
      message: 'Erreur préparation paiement'
    })
  }
}
export async function confirmCartOrder(request, reply) {
  const transaction = await sequelize.transaction()

  try {
    const userId = request.user.id

    const {
      items,
      deliveryAddress,
      deliveryMethod,
      subtotal,
      deliveryPrice,
      total,
      paymentMethod
    } = request.body

    // 🔒 Vérifications de base
    if (!items || !items.length) {
      return reply.code(400).send({
        success: false,
        message: 'Panier vide'
      })
    }

    // 1️⃣ Créer la commande
    const order = await Order.create({
      userId,
      status: 'paid',
      subtotal,
      deliveryPrice,
      total,
      paymentMethod,
      deliveryMethod,
      deliveryAddress: JSON.stringify(deliveryAddress)
    }, { transaction })

    // 2️⃣ Créer les orderItems
    for (const item of items) {
      // Vérifier le produit
      const product = await Product.findByPk(item.productId, { transaction })

      if (!product) {
        throw new Error(`Produit introuvable (ID ${item.productId})`)
      }

      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: item.price
      }, { transaction })
    }

    // 3️⃣ Commit transaction
    await transaction.commit()

    return reply.code(201).send({
      success: true,
      message: 'Commande confirmée avec succès',
      order: {
        id: order.id,
        total: order.total,
        status: order.status
      }
    })

  } catch (error) {
    await transaction.rollback()

    console.error('❌ confirmCartOrder error:', error)

    return reply.code(500).send({
      success: false,
      message: 'Erreur lors de la confirmation de la commande'
    })
  }
}

/**
 * 🔹 DELETE /api/cart
 * Vide complètement le panier
 */
export async function clearCart(request, reply) {
  try {
    console.log('======================== [clearCart] ========================')
    
    const userId = request.user?.id

    console.log(`[clearCart] userId: ${userId}`)

    if (!userId) {
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    const order = await Order.findOne({
      where: { userId, status: 'pending' }
    })

    if (!order) {
      console.log('[clearCart] Pas de panier à vider')
      return reply.send({ 
        success: true,
        message: 'Panier déjà vide' 
      })
    }

    // Supprimer tous les items
    await OrderItem.destroy({
      where: { orderId: order.id }
    })

    // Mettre à jour le total à 0
    order.totalPrice = 0
    await order.save()

    console.log(`✅ [clearCart] Panier #${order.id} vidé`)

    reply.send({ 
      success: true,
      message: 'Panier vidé' 
    })

  } catch (error) {
    console.error('❌ [clearCart] Erreur:', error)
    console.error('❌ [clearCart] Stack:', error.stack)
    
    reply.code(500).send({ 
      success: false,
      error: 'Erreur lors du vidage du panier',
      message: error.message
    })
  }
}