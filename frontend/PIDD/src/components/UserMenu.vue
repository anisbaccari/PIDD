<template>
  <div class="user-menu">
    <!-- Bouton Se connecter -->
    <router-link
      v-if="!user"
      to="/login"
      class="login-button"
    >
      Se connecter
    </router-link>

    <!-- Menu utilisateur connecté -->
    <div v-else class="dropdown">
      <button @click="toggleMenu" class="user-btn">
        👤 Profil
      </button>

      <div v-if="open" class="dropdown-menu">
        <router-link
          to="/profil"
          class="dropdown-item"
          @click="closeMenu"
        >
          👤 Voir profil
        </router-link>

        <button
          class="dropdown-item logout"
          @click="logout"
        >
          🚪 Déconnexion
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserMenu",
  props: {
    user: Object
  },
  data() {
    return {
      open: false
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
    closeMenu() {
      this.open = false;
    },
    logout() {
      this.closeMenu();
      // Utilise ton EventBus déjà en place
      window.EventBus.$emit("user-logged-out");
    }
  },
  mounted() {
    // Fermer le menu si on clique ailleurs
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
    closeMenu() {
      this.open = false;
    },
    logout() {
      this.closeMenu();
      window.EventBus.$emit("user-logged-out");
    },
    handleOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.open = false;
      }
    }
  }
};
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-btn {
  background: #189b48;
  color: rgb(216, 201, 237);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.login-button {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border-radius: 6px;
  text-decoration: none;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  min-width: 160px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: #333;
  background: white;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f2f2f2;
}

.logout {
  color: red;
}
</style>
