import { createRouter, createWebHistory, type NavigationGuard } from 'vue-router';
import { nulvless } from '@/lib/nulvless';
import Home from '@/views/Home.vue';
import SignIn from '@/views/SignIn.vue';

const requireSession: NavigationGuard = async (to) => {
  const { data } = await nulvless.auth.getSession();
  return data ? true : { name: 'sign-in', query: { next: to.fullPath } };
};

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home, beforeEnter: requireSession },
    { path: '/sign-in', name: 'sign-in', component: SignIn },
  ],
});
