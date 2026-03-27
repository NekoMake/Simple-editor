import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { transition: 'slide-left' },
    },
    {
      path: '/editor/:fileId',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
      meta: { transition: 'slide-up' },
      props: true,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { transition: 'slide-left' },
    },
    {
      path: '/font-manager',
      name: 'font-manager',
      component: () => import('@/views/FontManagerView.vue'),
      meta: { transition: 'slide-left' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { transition: 'slide-left' },
    },
  ],
})

export default router
