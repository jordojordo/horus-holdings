export const routes = [
  // Public
  {
    path:      '/',
    name:      'home',
    meta:      { guestOnly: true },
    component: () => import('@/pages/public/HomePage.vue'),
  },
  {
    path:      '/login',
    name:      'login',
    meta:      { guestOnly: true },
    component: () => import('@/pages/public/LoginPage.vue'),
  },
  {
    path:      '/register',
    name:      'register',
    meta:      { guestOnly: true },
    component: () => import('@/pages/public/RegisterPage.vue'),
  },

  // Private
  {
    path:      '/dashboard',
    name:      'dashboard',
    meta:      { requiresAuth: true },
    component: () => import('@/pages/private/DashboardPage.vue'),
  },
  {
    path:      '/incomes',
    name:      'incomes',
    meta:      { requiresAuth: true },
    props:     { financeKind: 'income' },
    component: () => import('@/pages/private/FinancePage.vue'),
  },
  {
    path:      '/expenses',
    name:      'expenses',
    meta:      { requiresAuth: true },
    props:     { financeKind: 'expense' },
    component: () => import('@/pages/private/FinancePage.vue'),
  },
  {
    path:      '/settings',
    name:      'settings',
    meta:      { requiresAuth: true },
    component: () => import('@/pages/private/SettingsPage.vue'),
  },

  // 404
  {
    path:      '/:pathMatch(.*)*',
    name:      'not-found',
    component: () => import('@/pages/public/NotFound.vue'),
  },
];