
//    import { createApp } from 'vue'
//    import './style.css'
//    import App from './App.vue'

//    createApp(App).mount('#app')



import 'bootstrap-icons/font/bootstrap-icons.css';
import { createApp } from 'vue';
import App from './App.vue';


// Import Bootstrap CSS et BootstrapVue CSS
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import 'bootstrap/dist/css/bootstrap.css';

// Import BootstrapVue 3
import BootstrapVue3 from 'bootstrap-vue-3';

const app = createApp(App);

// Utiliser BootstrapVue 3
app.use(BootstrapVue3);

app.mount('#app');
