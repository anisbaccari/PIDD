<template>
    <div class="admin-stats">
      <h2 class="title">Admin Statistics</h2>
  
      <div class="stats-grid">
        <div class="stat-card" 
             v-for="stat in stats" 
             :key="stat.label" 
             :style="{ background: stat.color }">
          <div class="icon">{{ stat.icon }}</div>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../api.js';
  
  export default {
    name: 'AdminStat',
    props: ['user', 'setUser'],
    data() {
      return {
        stats: [
          { label: 'Total Users', value: 0, color: 'linear-gradient(135deg, #6a11cb, #2575fc)', icon: '👤' },
          { label: 'Total Orders', value: 0, color: 'linear-gradient(135deg, #ff7e5f, #feb47b)', icon: '📦' },
          { label: 'Pending Orders', value: 0, color: 'linear-gradient(135deg, #f7971e, #ffd200)', icon: '⏳' },
          { label: 'Revenue', value: '0€', color: 'linear-gradient(135deg, #43cea2, #185a9d)', icon: '💰' },
        ]
      };
    },
    async mounted() {
      try {
        const res = await api.get('/admin/stats'); // replace with your API endpoint
        console.log("res",res.data)
          this.stats = [
          { label: 'Total Users', value: res.data.userCount, color: 'linear-gradient(135deg, #6a11cb, #2575fc)', icon: '👤' },
          { label: 'Total Orders', value: res.data.orderCount, color: 'linear-gradient(135deg, #ff7e5f, #feb47b)', icon: '📦' },
          { label: 'Pending Orders', value: res.data.orderPendingCount, color: 'linear-gradient(135deg, #f7971e, #ffd200)', icon: '⏳' },
          { label: 'Revenue', value: `${res.data.revenue} €`, color: 'linear-gradient(135deg, #43cea2, #185a9d)', icon: '💰' },
        ];
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-stats {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    text-align: center;
    font-family: 'Arial', sans-serif;
  }
  
  .title {
    font-size: 28px;
    margin-bottom: 30px;
    font-weight: bold;
    color: #333;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
  }
  
  .stat-card {
    border-radius: 16px;
    padding: 25px;
    color: #fff;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
  
  .stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.2);
  }
  
  .icon {
    font-size: 36px;
    margin-bottom: 15px;
  }
  
  .stat-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  
  /* Responsive */
  @media(max-width: 600px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>
  