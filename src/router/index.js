import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

import CreatePoll from '../components/CreatePoll.vue'
import VotePoll from '../components/VotePoll.vue'
import ResultsPoll from '../components/ResultsPoll.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MyPolls from '../views/MyPolls.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/',
    component: CreatePoll,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-polls',
    component: MyPolls,
    meta: { requiresAuth: true }
  },
  // Quan trọng: /poll/:code (khớp link tạo poll)
  {
    path: '/poll/:code',
    component: VotePoll,
    meta: { requiresAuth: true }
  },
  {
    path: '/poll/:code/results',
    component: ResultsPoll
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const { token } = useAuth()
  if (to.meta.requiresAuth && !token.value) {
    next('/login')
  } else {
    next()
  }
})

export default router
