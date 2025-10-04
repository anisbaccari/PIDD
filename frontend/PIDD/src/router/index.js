import { createRouter,createWebHistory} from 'vue-router';
import Home from '../views/Home.vue';
import Profilview from '../views/Profilview.vue';

const routes = [
    {path :'/', component:Home },
    {path :'/profil', component:Profilview}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router;