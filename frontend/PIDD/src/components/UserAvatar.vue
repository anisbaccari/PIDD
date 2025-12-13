<template>
  <div class="avatar-wrapper" ref="avatarWrapper">
    <div class="avatar" @click="toggleMenu">
      {{ initials }}
    </div>

    <div v-if="showMenu" class="menu">
      <div  v-if="user.id">

        <router-link   to="/profilview" class="menu-item" :user="user" :getUser="getUser" :setUser="setUser" >👤 Mon Profil</router-link>
        <button class="menu-item logout" @click="logout">🚪 Déconnexion</button>
      </div>
     
      <router-link v-else  to="/login" class="menu-item" :user="user" :getUser="getUser" :setUser="setUser" >👤 Login</router-link>
    </div>
  </div>
</template>

<script>
export default {

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    },

  props: ['user','getUser','setUser'],
  data() {
    return { 
      dataUser : this.getUser() ||  {id :"", username: "", password: ""},
      showMenu: false }
  },
  computed: {
    initials() {
      if (!this.user.id) return ''
      console.log("[UseAvater] : user : ",this.user)
      const n = this.user.nom?.[0] || ''
      const p = this.user.prenom?.[0] || ''
      return (n + p).toUpperCase()
    }
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu
    },
    logout() {
      localStorage.removeItem('token')
      this.setUser(null);
      this.$router.push('/')
    },
    handleClickOutside(event) {
     if (this.$refs.avatarWrapper && !this.$refs.avatarWrapper.contains(event.target)) {
      this.showMenu = false
     }
    }
  }
}
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.menu {
  position: absolute;
  right: 0;
  top: 48px;
  background: white;
  border-radius: 10px;
  padding: 8px 0;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  animation: fadeIn 0.15s ease-in-out;
  z-index: 999;
}

.menu-item {
  padding: 10px 16px;
  text-decoration: none;
  color: #374151;
  font-size: 0.95rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover {
  background: #f3f4f6;
}

.logout {
  color: #b91c1c;
  border-top: 1px solid #e5e7eb;
  margin-top: 4px;
}

.logout:hover {
  background: #fee2e2;
  color: #991b1b;
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
