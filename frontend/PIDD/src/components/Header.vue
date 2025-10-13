<template>
  <b-navbar class="bg-dark px-3 d-flex align-items-center">
    <!-- Logo à gauche -->
    <b-navbar-brand href="#" class="d-flex align-items-center">
      <img src="../assets/logo.png" height="85" class="d-inline-block align-top me-2" alt="Logo">
    </b-navbar-brand>

    <!-- Liens centraux -->
    <div class="mx-auto">
      <ul class="nav justify-content-center">
        <li class="nav-item">
          <a href="#" class="nav-link text-white">Accueil</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link text-white">Boutique</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link text-white">À propos de nous</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link text-white">Contact</a>
        </li>
      </ul>
    </div>

    <!-- Bouton connexion à droite -->
    <b-navbar-nav class="ms-auto">
      <router-link to="/login" class="btn btn-outline-light d-flex align-items-center">

        <i class="bi bi-person-circle me-2"></i>
        Se connecter
      </router-link>
    </b-navbar-nav>
  </b-navbar>
</template>

<script setup>
</script>

<style scoped>
/* Fond noir fixe pour la navbar */
b-navbar {
  background-color: #000 !important;
}

/* Bouton se connecter */
b-button {
  color: #fff;
  border-color: #fff;
}

b-button:hover {
  background-color: #fff;
  color: #000;
  border-color: #fff;
}

/* Liens centraux toujours blancs */
.nav-link {
  color: #fff !important; /* texte blanc fixe */
  text-decoration: none;
}

.nav-link:hover {
  color: #ffc107 !important; /* couleur au survol */
}

/* Ajustement responsive si nécessaire */
.nav {
  gap: 1rem; /* espace entre les liens */
}
</style>
