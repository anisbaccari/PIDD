// controllers/profileController.js
import { Product } from '../models/Product.js';

export async function getAllProducts(request, reply) {
  try {
    const products = await Product.findAll();
    if (!products) {
    console.log(" [getAllProducts] product empty :");

      return reply.status(404).send({ error: 'Product not found' });
    }
    const reponse = getDataProduct(products)
    console.log("========================  [getAllProducts] ========================");
    console.log("  [getAllProducts] reponse :  ",reponse);

    reply.send(reponse);
  } catch (err) {
    console.log(" [getAllProducts] err :",err);

    reply.status(500).send({ error: err.message });
  }
}

// Example for finding one product by ID
export async function getProductById(request, reply) {
  const { id } = request.params;
  try {
    const product = await Product.findOne({ where: { id } });
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    reply.send(product);
  } catch (err) {
    console.log(" [getDataOrder] err :",err);

    reply.status(500).send({ error: err.message });
  }
}

function getDataProduct(order)
{
    try {
          console.log("========================  [getDataOrder] ========================");

          const ordersPlain = order.map(o => o.get({ plain: true }));
         /*  const userArray = ordersPlain.map(o => o.user);
          const itemsArray = ordersPlain.map(o => o.items); // Produits Commandees 
          const productList =  ordersPlain.flatMap(o => o.items).map( i => i.product);
          
          const panier = ordersPlain.map(o => ({
                                id: o.id,
                                totalPrice: o.totalPrice,
                                status: o.status,
                                createdAt: o.createdAt,
                                orderItem: o.items || [],
                                productList: (o.items || []).map(i => i.product)
                                // add any order fields you want
                              })); */
          
         
          return ordersPlain; 
    } catch (error) {
    console.log(" [getDataProduct] error :",error);
      
    }

}