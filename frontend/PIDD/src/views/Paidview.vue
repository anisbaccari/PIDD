<template>

</template>



<script>

import api from '../api'


export default
{
    name: Paidview,
    props:[
    'user', 
    'setUser',
    'getUser',
    'setPanier',
    'getFirstPanier',
    'tempCart'
    ]

    ,
    data(){
        return {
             dataUser:  this?.getUser() || { id:"", username: "", password : ""},
             cartItems : {},
                total : 0
        }
    },
    async mounted(){
        if(this.dataUser.id)
        {
        this.cartItems = await this.getPanier()
        console.log(" cartiem :",this.getPanier())
        }else { 
        this.cartItems =this.formatPanier( this.tempCart)
        console.log("[mounted] :  this.tempCart", this.tempCart);

        console.log("[mounted] : this.cartItems",this.cartItems);
        console.log("[mounted] : this.cartItems",this.cartItems[0]);
        console.log("[mounted] : this.cartItems length ",this.cartItems.length);

        
        }
    },
    methods:{
        formatPanier(order)
    {

      // to make orderiten id 
      let producIndex = 0 
      const productOrderItems  = order.map( o => ({
          id :producIndex++,
          product : o
      }))

      let orderItemIndex = 0 
      const orderItemList = productOrderItems.map( o => ({
        id :orderItemIndex++,
        itemList : o
      }))

      let  productOrderIndex = 0 
      const productOrder = orderItemList.map( o =>( {
        id :productOrderIndex++,
        orderItem:o
      }))

      let  orderListIndex = 0 
      const orderList = productOrder.map( o =>( {
        id :orderListIndex++,
        order: productOrder
      }))

      return orderList
    },
    async  getPanier(){
          try {
                  console.log("[getPanier]============");
                  const token = localStorage.getItem("token");
                  if (token) {

                  const res = await api.get(`http://localhost:3000/panier`, {
                  headers: { Authorization: `Bearer ${token}` }
                  });

                const order =res.data;  
                console.log("[Panier] order : ",JSON.stringify(order))
                this.setCart(order);

                this.getTotal()     
                this.getUser()
                console.log("[getPanier] user found :", this.user)

                  } else {
                    console.log("[getPanier] : no token found");
                    this.tempCart = this.getFirstPanier()
                    console.log("[getPanier] : this.tempCart",this.tempCart);
                    
                  }
          
              } catch (error) {
                console.log("[Panier] error : ",error)
            
          }
      },
    }
}

</script>