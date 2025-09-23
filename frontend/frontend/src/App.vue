<template>
  <div id="app">
    <h1>Vue + Fastify + Axios 🚀</h1>
    <button @click="getMessage">Obtenir message du backend</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const message = ref('')

const getMessage = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/message')
    message.value = res.data.message
  } catch (err) {
    console.error(err)
  }
}
</script>
