<template>
  <header :class="_headerClasses">
    <Navigation
      :items="navItems"
      :variant="_props.variant"
      :sticky="_props.sticky"
      @navigate="_handleNavigate"
      v-bind="activeRoute ? { 'active-route': activeRoute } : {}"
    >
      <template #brand>
        <slot name="brand">
          <BaseText variant="h1" family="horror" size="2xl" class="text-glow">
            NotT
          </BaseText>
        </slot>
      </template>
    </Navigation>

    <!-- User Actions -->
    <div v-if="$slots['actions']" class="header-actions">
      <slot name="actions" />
    </div>

    <!-- User Menu -->
    <div v-if="user" class="user-menu">
      <button
        type="button"
        class="user-menu-button"
        @click="_toggleUserMenu"
        aria-label="User menu"
        :aria-expanded="isUserMenuOpen"
      >
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.username"
          class="user-avatar"
        />
        <div v-else class="user-avatar-placeholder">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>
        <span class="user-name">{{ user.username }}</span>
        <svg
          class="user-menu-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <Transition name="user-menu">
        <div
          v-if="isUserMenuOpen"
          class="user-menu-dropdown"
        >
          <div class="user-menu-header">
            <span class="user-menu-username">{{ user.username }}</span>
            <span class="user-menu-email">{{ user.email }}</span>
          </div>
          
          <div class="user-menu-items">
            <slot name="user-menu">
              <button
                type="button"
                class="user-menu-item"
                @click="_handleProfile"
              >
                <BaseIcon name="user" size="sm" class="mr-3" />
                Profile
              </button>
              <button
                type="button"
                class="user-menu-item"
                @click="_handleSettings"
              >
                <BaseIcon name="settings" size="sm" class="mr-3" />
                Settings
              </button>
              <button
                type="button"
                class="user-menu-item text-blood-500 hover:text-blood-400"
                @click="_handleLogout"
              >
                <BaseIcon name="logout" size="sm" class="mr-3" />
                Logout
              </button>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import BaseText from '../atoms/BaseText.vue';
import Navigation from './Navigation.vue';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
}

interface HeaderProps {
  navItems: NavigationItem[];
  activeRoute?: string;
  user?: User | null;
  variant?: 'default' | 'horror' | 'blood';
  sticky?: boolean;
}

interface HeaderEmits {
  navigate: [item: NavigationItem];
  profile: [];
  settings: [];
  logout: [];
}

const _props = withDefaults(defineProps<HeaderProps>(), {
  variant: 'default',
  sticky: false,
});

const emit = defineEmits<HeaderEmits>();

const isUserMenuOpen = ref(false);

const _headerClasses = computed(() => {
  return ['header', 'flex items-center justify-between', 'px-4 sm:px-6 lg:px-8', 'py-4'];
});

const _handleNavigate = (item: NavigationItem) => {
  emit('navigate', item);
};

const _toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const _handleProfile = () => {
  emit('profile');
  isUserMenuOpen.value = false;
};

const _handleSettings = () => {
  emit('settings');
  isUserMenuOpen.value = false;
};

const _handleLogout = () => {
  emit('logout');
  isUserMenuOpen.value = false;
};

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.user-menu')) {
    isUserMenuOpen.value = false;
  }
};

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header-actions {
  @apply flex items-center space-x-4;
}

.user-menu {
  @apply relative;
}

.user-menu-button {
  @apply flex items-center space-x-2 p-2 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors duration-200;
}

.user-avatar {
  @apply w-8 h-8 rounded-full object-cover;
}

.user-avatar-placeholder {
  @apply w-8 h-8 rounded-full bg-horror-600 text-white flex items-center justify-center font-semibold text-sm;
}

.user-name {
  @apply hidden sm:block text-sm font-medium;
}

.user-menu-icon {
  @apply w-4 h-4 transition-transform duration-200;
}

.user-menu-button[aria-expanded="true"] .user-menu-icon {
  @apply rotate-180;
}

.user-menu-dropdown {
  @apply absolute right-0 top-full mt-2 w-64 bg-night-800 border border-night-600 rounded-lg shadow-xl z-50;
}

.user-menu-header {
  @apply px-4 py-3 border-b border-night-700;
}

.user-menu-username {
  @apply block text-sm font-semibold text-white;
}

.user-menu-email {
  @apply block text-xs text-night-400;
}

.user-menu-items {
  @apply py-2;
}

.user-menu-item {
  @apply flex items-center w-full px-4 py-2 text-sm text-night-300 hover:text-white hover:bg-night-700 transition-colors duration-200;
}

/* User menu transition */
.user-menu-enter-active,
.user-menu-leave-active {
  transition: all 0.2s ease;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 