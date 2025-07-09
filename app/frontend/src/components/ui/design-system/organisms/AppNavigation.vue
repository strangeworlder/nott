<template>
  <nav class="bg-night-900/80 backdrop-blur-sm border-b border-night-700 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <BaseText
              variant="h2"
              size="xl"
              color="blood-500"
              family="horror"
              class="hover:text-blood-400 transition-colors"
            >
              NotT
            </BaseText>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <BaseButton
            v-for="item in _navigationItems"
            :key="item.path"
            :variant="_isActiveRoute(item.path) ? 'blood' : 'ghost'"
            size="sm"
            @click="_handleNavigate(item)"
          >
            <BaseText variant="p" size="base" :color="_isActiveRoute(item.path) ? 'white' : 'night-300'">
              {{ item.name }}
            </BaseText>
          </BaseButton>
        </div>

        <!-- User Menu / Auth Buttons -->
        <div class="flex items-center space-x-4">
          <!-- Guest Menu -->
          <template v-if="authStore.isGuest">
            <router-link to="/login">
              <BaseButton variant="ghost" size="sm">
                Sign In
              </BaseButton>
            </router-link>
            <router-link to="/register">
              <BaseButton variant="horror" size="sm">
                Sign Up
              </BaseButton>
            </router-link>
          </template>

          <!-- Authenticated Menu -->
          <template v-else>
            <div class="relative">
              <button
                @click="_toggleUserMenu"
                class="user-menu-button flex items-center space-x-2 text-night-300 hover:text-white transition-colors"
                aria-label="User menu"
                :aria-expanded="isUserMenuOpen"
              >
                <div class="w-8 h-8 bg-horror-600 rounded-full flex items-center justify-center">
                  <BaseText variant="p" size="sm" color="white" class="font-medium">
                    {{ _userInitials }}
                  </BaseText>
                </div>
                <BaseText variant="p" size="sm" color="night-300">
                  {{ authStore.userDisplayName }}
                </BaseText>
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': isUserMenuOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- User Dropdown Menu -->
              <div
                v-if="isUserMenuOpen"
                class="user-menu-dropdown absolute right-0 mt-2 w-48 bg-night-800 border border-night-600 rounded-lg shadow-lg py-1 z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-night-300 hover:bg-night-700 hover:text-white transition-colors"
                >
                  <BaseText variant="p" size="sm">
                    Profile
                  </BaseText>
                </router-link>
                <router-link
                  to="/lobby"
                  class="block px-4 py-2 text-night-300 hover:bg-night-700 hover:text-white transition-colors"
                >
                  <BaseText variant="p" size="sm">
                    Game Lobby
                  </BaseText>
                </router-link>
                <hr class="border-night-600 my-1" />
                <button
                  @click="_handleLogout"
                  class="block w-full text-left px-4 py-2 text-night-300 hover:bg-night-700 hover:text-white transition-colors"
                  type="button"
                >
                  <BaseText variant="p" size="sm" color="blood-500">
                    Sign Out
                  </BaseText>
                </button>
              </div>
            </div>
          </template>

          <!-- Mobile Menu Button -->
          <button
            @click="_toggleMobileMenu"
            class="md:hidden p-2 text-night-300 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-night-700 py-4"
      >
        <div class="space-y-2">
          <BaseButton
            v-for="item in _navigationItems"
            :key="item.path"
            :variant="_isActiveRoute(item.path) ? 'blood' : 'ghost'"
            size="sm"
            @click="_handleNavigate(item)"
          >
            {{ item.name }}
          </BaseButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Reactive state
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

// Navigation items
const _navigationItems = computed(() => {
  const items = [
    { name: 'Home', path: '/' },
    { name: 'Lobby', path: '/lobby' },
    { name: 'Profile', path: '/profile' },
  ];

  return items;
});

// Computed properties
const _userInitials = computed(() => {
  if (!authStore.user?.username) {
    return '?';
  }
  return authStore.user.username
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Methods
const _isActiveRoute = (path: string): boolean => {
  return route.path === path;
};

const _toggleUserMenu = (): void => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const _toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = (): void => {
  isMobileMenuOpen.value = false;
};

const _handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const _handleNavigate = (item: { name: string; path: string }): void => {
  router.push(item.path);
  closeMobileMenu();
};

// Close menus when clicking outside
const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement;

  // Close user menu if clicking outside
  if (!target.closest('.user-menu-button') && !target.closest('.user-menu-dropdown')) {
    isUserMenuOpen.value = false;
  }

  // Close mobile menu if clicking outside
  if (!target.closest('.mobile-menu')) {
    isMobileMenuOpen.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Horror theme enhancements */
nav {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Glow effect for active navigation items */
.router-link-active {
  text-shadow: 0 0 5px rgba(224, 36, 36, 0.3);
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease-in-out;
}

/* Mobile menu animations */
.md\:hidden {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 