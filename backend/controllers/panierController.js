import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';

export async function getPanier(request, reply) {
  try {

      console.log('\x1b[31m%s\x1b[0m',"======================== [getPanier] ========================");
      let id = request.user.id; 
      const idByToken = request.user?.id;
      console.log(" [getPanier] idByToken :",idByToken);
      const pendingOrder =  await getPendingOrder(idByToken)
      const paidOrder =  await getPaidOrder(idByToken)
     
      console.log('\x1b[32m%s\x1b[0m'," [getPanier] paidOrder :",paidOrder);

      console.log(" [getPanier] pendingOrder :",pendingOrder);

      reply.send({pendingOrder:pendingOrder,paidOrder:paidOrder});
  } catch (err) {
    console.log(" [getPanier] err :",err);
    reply.status(500).send({ error: err.message });
  }
}

export async function getOrder(id)
{
  try {
    
        console.log('\x1b[31m%s\x1b[0m',"======================== [getOrder] ========================");
        const idByToken = id;

       const order = await Order.findAll({ // Panier (Commandes)
                where: { userId:idByToken },
                include: [
                  {
                    model: User,
                    as: "user"
                  },
                  {
                    model: OrderItem,//Produits commandees 
                    as: "items",
                    include: [
                      {
                        model: Product,
                        as: "product"
                      }
                    ]
                  }
                ]
          });
          if(!order)
          {
           console.log(" [getOrder] orderList (panier) : vide");
            return 

          }
          const panier = getDataOrder(order);
          console.log(" [getOrder] orderList (panier) :", panier);
          console.log(" [getOrder] orderItem (Produits Commandees) :", panier.map( o => o.orderItem));
          console.log(" [getOrder] productList  :",  panier.map( o => o.productList));
          return  panier ;


  } catch (error) {
    console.log(" [getOrder] error :",error);
   
    
  }
}


export async function getPaidOrder(id)
{
  try {
    
        console.log('\x1b[31m%s\x1b[0m',"======================== [getPaidOrder] ========================");
        const idByToken = id;

       const order = await Order.findAll({ // Panier (Commandes)
                where: { userId:idByToken , status:'paid' },
                include: [
                  {
                    model: User,
                    as: "user"
                  },
                  {
                    model: OrderItem,//Produits commandees 
                    as: "items",
                    include: [
                      {
                        model: Product,
                        as: "product"
                      }
                    ]
                  }
                ]
          });
          if(!order)
            {
             console.log(" [getOrder] orderList (panier) : vide");
              return 
  
            }
          const panier = getDataOrder(order);
          console.log(" [getPaidOrder] orderList (panier) :", panier);
          console.log(" [getPaidOrder] orderItem (Produits Commandees) :", panier.map( o => o.orderItem));
          console.log(" [getPaidOrder] productList  :",  panier.map( o => o.productList));
          return  panier ;


  } catch (error) {
    console.log(" [getPaidOrder] error :",error);
   
    
  }
}

export async function getPendingOrder(id)
{
  try {
    
        console.log('\x1b[31m%s\x1b[0m',"======================== [getPendingOrder] ========================");
        const idByToken = id;

       const order = await Order.findAll({ // Panier (Commandes)
                where: { userId:idByToken , status:'pending' },
                include: [
                  {
                    model: User,
                    as: "user"
                  },
                  {
                    model: OrderItem,//Produits commandees 
                    as: "items",
                    include: [
                      {
                        model: Product,
                        as: "product"
                      }
                    ]
                  }
                ]
          });
          if(!order)
            {
             console.log(" [getOrder] orderList (panier) : vide");
              return 
  
            }
          const panier = getDataOrder(order);
          console.log(" [getPendingOrder] orderList (panier) :", panier);
          console.log(" [getPendingOrder] orderItem (Produits Commandees) :", panier.map( o => o.orderItem));
          console.log(" [getPendingOrder] productList  :",  panier.map( o => o.productList));
          return  panier ;


  } catch (error) {
    console.log(" [getPendingOrder] error :",error);
   
    
  }
}


export async function getOrderById(id)
{
  try {
    
        console.log('\x1b[31m%s\x1b[0m',"======================== [getOrderById] ========================");
        const orderId = id;

        const order = await Order.findByPk(orderId); // Panier (Commandes)
        return order


  } catch (error) {
    console.log(" [getOrderById] error :",error);
   
    
  }
}
function getDataOrder(order)
{
    try {
          console.log("========================  [getDataOrder] ========================");

          const ordersPlain = order.map(o => o.get({ plain: true }));
          const userArray = ordersPlain.map(o => o.user);
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
                              }));
          
         
          return panier 
    } catch (error) {
    console.log(" [getDataOrder] error :",error);
      
    }

}

export async function updateOrder(orderId)
{
  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [updateOrder] ========================");

    const order = await Order.findByPk(orderId);

    if(!order)
    {
      console.log('\x1b[31m%s\x1b[0m',' ORDER empty')
      return null
    }

    order.status = 'paid'
    order.save()
    console.log(" [updateOrder] order ",order);

    console.log(" [updateOrder] succed ");

    return order;
    
  } catch (error) {
    console.log(" [getOrderById] error :",error);
    
  }
}

/*  ADMIN  */

export async function getAllOrder()
{

  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [getAllOrder] ========================");
    const order = await Order.findAll({ // Panier (Commandes)
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: OrderItem,//Produits commandees 
          as: "items",
          include: [
            {
              model: Product,
              as: "product"
            }
          ]
        }
      ]
})
    if(!order)
      {
        console.log('\x1b[31m%s\x1b[0m',' ORDER empty')
        return null
      }
    console.log('\x1b[31m%s\x1b[0m',' [getAllOrder] order',order)

    const orderArray = getDataOrder(order)
    console.log('\x1b[31m%s\x1b[0m',' [getAllOrder] orderArray',orderArray)

    return orderArray

  } catch (error) {
    console.log(" [getAllOrder] error :",error);
    
  }
}


export async function DeleteOrder(orderId){
  
  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [getAllOrder] ========================");
    console.log(" [getAllOrder] orderId :",orderId);
    
    await Order.destroy({
      where: { id: orderId }
    })
    console.log('\x1b[31m%s\x1b[0m',' [DeleteOrder] deleted')


  } catch (error) {
    console.log(" [getAllOrder] error :",error);
    
  }
}
