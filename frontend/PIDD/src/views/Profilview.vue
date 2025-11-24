<template>
  <div class="ProfilBox">
    <h2>Mes informations</h2>

    <div v-if="!loaded" class="loading">Chargement...</div>

    <form v-else @submit.prevent="saveChanges" class="profile-form">
      <div class="form-group">
        <label>Nom</label>
        <input v-model="form.nom" type="text" placeholder="Votre nom" />
      </div>

      <div class="form-group">
        <label>Prénom</label>
        <input v-model="form.prenom" type="text" placeholder="Votre prénom" />
      </div>

      <div class="form-group">
        <label>Nom d'utilisateur</label>
        <input v-model="form.username" type="text" placeholder="Votre username" />
      </div>

      <div class="form-group">
        <label>Nouveau mot de passe (optionnel)</label>
        <input v-model="form.password" type="password" placeholder="Mot de passe" />
      </div>

      <button type="submit" class="submit-btn">Mettre à jour</button>

      <p v-if="message" :class="['message', messageType]">{{ message }}</p>
    </form>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "Profilview",

  data() {
    return {
      loaded: false,
      message: "",
      messageType: "", // "success" ou "error"
      form: {
        nom: "",
        prenom: "",
        username: "",
        password: ""
      }
    };
  },

  methods: {
    async loadProfile() {
      try {
        const res = await api.get("/profil");
        console.log("[Profilview] res.data:", res.data);

        if (res.data && res.data.user) {
          this.form.nom = res.data.user.nom || "";
          this.form.prenom = res.data.user.prenom || "";
          this.form.username = res.data.user.username || "";
          this.message = "";
        } else {
          console.warn("[Profilview] Aucun utilisateur reçu");
          this.message = "Impossible de charger les informations du profil.";
          this.messageType = "error";
        }
      } catch (error) {
        console.error("[Profilview] Erreur load:", error);
        this.message = "Erreur lors de la récupération du profil.";
        this.messageType = "error";
      } finally {
        this.loaded = true;
      }
    },

    async saveChanges() {
      try {
        const payload = { ...this.form };
        if (!payload.password) delete payload.password;

        const res = await api.put("/profil", payload);
        console.log("[Profilview] update response:", res.data);

        this.message = "Profil mis à jour ✔️";
        this.messageType = "success";
        this.form.password = ""; // vide le champ password après update
      } catch (error) {
        console.error("[Profilview] Erreur update:", error);
        this.message = "Erreur lors de la mise à jour.";
        this.messageType = "error";
      }
    }
  },

  mounted() {
    this.loadProfile();
  }
};
</script>

<style scoped>
.ProfilBox {
  max-width: 450px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}

.profile-form .form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #0056b3;
}

.message {
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
}

/* Couleurs selon type */
.message.success {
  color: #28a745;
}

.message.error {
  color: #dc3545;
}
</style>
