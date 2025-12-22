import {getAllProducts} from '../controllers/productController.js'
import {getAllOrder,deleteOrder,updateOrder} from './panierController.js'
import {} from '../controllers/categorieController.js'
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
export async function getAdmin  (request, reply) {
  try {
    console.log(" ======[getAdmin]====");

     const res = await getAllProducts(request,reply);
     //console.log("[getAdmin] res",res)
     reply.send(res);

  } catch (error) {
    console.log(" [getAdmin] error :",error);
    
  }

};

export async function getAdminStat(request,reply){

  try {
    console.log(" ======[getAdminStat]====");
    const userCount = await User.findAndCountAll();
    const orderCount = await Order.findAndCountAll();
    const orderPendingCount = await Order.findAndCountAll({where: {status: 'pending' }})
    const revenue = 1000
    const stats = {userCount : userCount.count, orderCount:orderCount.count,
                    orderPendingCount:orderPendingCount.count,revenue:revenue}
    console.log("[getAdminStat] stats :",stats)
    reply.send(stats)
    
  } catch (error) {
    console.log(" [getAdminStat] error :",error);
    
  }
}


export async function getAllOrderAdmin(request,reply)
{

  try {
      console.log(" ======[getAllOrder - ADMIN]====");

      const order = await getAllOrder();
      if(!order)
        {
          console.log('\x1b[31m%s\x1b[0m',' ORDER empty')
          return null
        }
      console.log('\x1b[31m%s\x1b[0m',' [getAllOrder - ADMIN] order',order)
      reply.send({order:order})
    
  } catch (error) {
    console.log(" [getAllOrder - ADMIN] error :",error);
    
  }
}
export async function DeleteOrderAdmin(request,reply)
{

  try {

      console.log(" ======[DeleteOrderAdmin - ADMIN]====");
      console.log("params:", request.body);
      const { orderId } = request.body;
      if(!orderId)
        {
          console.log('\x1b[31m%s\x1b[0m',' orderId empty')
          return null
        }
      deleteOrder(orderId);
     
      reply.send({message:" delete succes"})
    
  } catch (error) {
    console.log(" [DeleteOrderAdmin - ADMIN] error :",error);
    
  }
}



export async function PaidOrderAdmin(request,reply){
  try {

    console.log(" ======[PaidOrder - ADMIN]====");
    console.log("params:", request.body);
    const { orderId } = request.body;
    if(!orderId)
      {
        console.log('\x1b[31m%s\x1b[0m',' orderId empty')
        return null
      }
      updateOrder(orderId);
   
    reply.send({message:" delete succes"})
  
} catch (error) {
  console.log(" [DeleteOrderAdmin - ADMIN] error :",error);
  
}
}
