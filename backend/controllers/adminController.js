import {getAllProducts} from '../controllers/productController.js'
import {} from '../controllers/panierController.js'
import {} from '../controllers/categorieController.js'

export async function getAdmin  (request, reply) {
  try {
     const res = await getAllProducts(request,reply);
     console.log("[getAdmin] res",res)
     reply.send(res);

  } catch (error) {
    console.log(" [getAdmin] error :",error);
    
  }

};
