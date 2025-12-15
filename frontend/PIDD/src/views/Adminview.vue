<template>
    <div class="AdminPanel">
      <div class="topContent">
        <h2>Admin Panel</h2>
      </div>
  
      <div class="AdminContent">
        <div class="panel-card productView" @click="gotoProducView">
          <div class="icon">🛍️</div>
          <p>Go to Product View</p>
        </div>
  
        <div class="panel-card orderView" @click="gotoOrderView">
          <div class="icon">📦</div>
          <p>Go to Order View</p>
        </div>
  
        <div class="panel-card statsView" @click="gotoStatView">
          <div class="icon">📊</div>
          <p>Go to Stats View</p>
        </div>
      </div>
    </div>
  </template>


<script>
import api from '../api.js'

export default {
    name:'Adminview',
    props : ['user','setUser','getUser',],
    data()
    {
        return { dataUser: this.getUser() || { id:'', username:'', password:'',is_admin : true,email:''}

        }
    },
    async moutend(){

    },
    methods : {
        gotoOrderView(){
            this.$router.push('/adminOrderView')
        },
        gotoProducView(){
            this.$router.push('/adminProductView')

        },
        gotoStatView(){
            this.$router.push('/adminStatView')

        }
    }
}



</script>


<style scoped>
    .AdminPanel {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: 'Arial', sans-serif;
      text-align: center;
    }
    
    .topContent h2 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 30px;
      color: #333;
    }
    
    .AdminContent {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 25px;
    }
    
    .panel-card {
      background: linear-gradient(135deg, #6a11cb, #2575fc);
      color: #fff;
      border-radius: 16px;
      padding: 30px 20px;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 6px 15px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .panel-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 25px rgba(0,0,0,0.2);
    }
    
    .panel-card .icon {
      font-size: 40px;
      margin-bottom: 15px;
    }
    
    .panel-card p {
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    /* Individual card colors */
    .productView {
      background: linear-gradient(135deg, #ff7e5f, #feb47b);
    }
    
    .orderView {
      background: linear-gradient(135deg, #43cea2, #185a9d);
    }
    
    .statsView {
      background: linear-gradient(135deg, #f7971e, #ffd200);
    }
    
    /* Responsive */
    @media(max-width: 600px) {
      .AdminContent {
        grid-template-columns: 1fr;
      }
    }
    </style>