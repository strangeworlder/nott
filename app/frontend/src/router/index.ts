import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

// Route components
const HomePage = () => import('@/components/ui/HomePage.vue');
const LoginPage = () => import('@/components/ui/LoginPage.vue');
const RegisterPage = () => import('@/components/ui/RegisterPage.vue');
const LobbyPage = () => import('@/components/ui/LobbyPage.vue');
const GamePage = () => import('@/components/game/GamePage.vue');
const ProfilePage = () => import('@/components/ui/ProfilePage.vue');
const NotFoundPage = () => import('@/components/ui/NotFoundPage.vue');

// Route configuration
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'NotT - Horror Tabletop Game',
      description: 'A terrifying tabletop game experience',
      requiresAuth: false,
      guestOnly: false,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      title: 'Login - NotT',
      description: 'Sign in to your NotT account',
      requiresAuth: false,
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      title: 'Register - NotT',
      description: 'Create your NotT account',
      requiresAuth: false,
      guestOnly: true,
    },
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: LobbyPage,
    meta: {
      title: 'Game Lobby - NotT',
      description: 'Join or create a horror game session',
      requiresAuth: true,
      guestOnly: false,
    },
  },
  {
    path: '/game/:gameId',
    name: 'game',
    component: GamePage,
    meta: {
      title: 'Game Session - NotT',
      description: 'Active horror game session',
      requiresAuth: true,
      guestOnly: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: {
      title: 'Profile - NotT',
      description: 'Your NotT profile and settings',
      requiresAuth: true,
      guestOnly: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: {
      title: 'Page Not Found - NotT',
      description: "The page you're looking for doesn't exist",
      requiresAuth: false,
      guestOnly: false,
    },
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  // Update document title and meta description
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string);
    }
  }

  // Get auth store
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Check authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Store intended destination for post-login redirect
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Check guest-only routes
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'lobby' });
    return;
  }

  // Continue navigation
  next();
});

// Error handling
router.onError((error) => {
  console.error('Router error:', error);
  // Redirect to home page on navigation errors
  router.push({ name: 'home' });
});

export default router;
