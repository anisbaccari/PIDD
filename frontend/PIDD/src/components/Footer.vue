<template>
  <footer class="bg-dark text-white pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row text-center text-md-start">
        <!-- Section logo / description -->
        <div class="col-md-4 mb-4">
          <h4 class="fw-bold">ShopNow</h4>
          <p >
            Votre boutique en ligne préférée pour des produits de qualité à prix imbattables.
          </p>
          <div>
            <b-button variant="outline-light" size="sm" class="me-2">
              <i class="bi bi-facebook"></i>
            </b-button>
            <b-button variant="outline-light" size="sm" class="me-2">
              <i class="bi bi-instagram"></i>
            </b-button>
            <b-button variant="outline-light" size="sm">
              <i class="bi bi-twitter-x"></i>
            </b-button>
          </div>
        </div>

        <!-- Liens utiles -->
        <div class="col-md-4 mb-4">
          <h5 class="fw-semibold">Liens utiles</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="text-decoration-none">Accueil</a></li>
            <li><a href="#" class="text-decoration-none">Boutique</a></li>
            <li><a href="#" class="text-decoration-none">À propos de nous</a></li>
            <li><a href="#" class="text-decoration-none">Contact</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="col-md-4 mb-4">
          <h5 class="fw-semibold">Contact</h5>
          <ul class="list-unstyled">
            <li><i class="bi bi-geo-alt-fill me-2"></i>Bruxelles, Belgique</li>
            <li><i class="bi bi-telephone-fill me-2"></i>+32 456 78 90 12</li>
            <li><i class="bi bi-envelope-fill me-2"></i>support@shopnow.be</li>
          </ul>
        </div>
      </div>

      <hr class="border-secondary" />

      <div class="text-center">
        © 2025 ShopNow — Tous droits réservés.
      </div>
    </div>
  </footer>
</template>

<script setup>
// Pas besoin de script pour cette version
</script>

<style scoped>
footer a:hover {
  color: #fff !important;
}

/* Liens utiles */
.footer-links {
  color: orange;
}
.footer-links a {
  color: orange;
  text-decoration: none;
}
.footer-links a:hover {
  color: #fff; /* changement de couleur au survol */
}
</style>
