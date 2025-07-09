<template>
  <nav :class="_navClasses" role="navigation" aria-label="Main navigation">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <div class="nav-brand">
        <slot name="brand">
          <BaseText variant="h1" family="horror" size="2xl" class="text-glow">
            NotT
          </BaseText>
        </slot>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-desktop">
        <ul class="nav-list">
          <li
            v-for="item in items"
            :key="item.path"
            class="nav-item"
          >
            <router-link
              :to="item.path"
              :class="_getLinkClasses(item.path)"
              @click="_handleNavigate(item)"
            >
              <BaseIcon
                v-if="item.icon"
                :name="item.icon"
                size="sm"
                class="mr-2"
              />
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Mobile Menu Button -->
      <button
        type="button"
        class="nav-mobile-toggle"
        @click="_toggleMobileMenu"
        aria-label="Toggle mobile menu"
        :aria-expanded="isMobileMenuOpen"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="!isMobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Mobile Navigation -->
      <Transition name="mobile-menu">
        <div
          v-if="isMobileMenuOpen"
          class="nav-mobile"
        >
          <ul class="nav-mobile-list">
            <li
              v-for="item in items"
              :key="item.path"
              class="nav-mobile-item"
            >
              <router-link
                :to="item.path"
                :class="_getMobileLinkClasses(item.path)"
                @click="_handleMobileNavigate(item)"
              >
                <BaseIcon
                  v-if="item.icon"
                  :name="item.icon"
                  size="sm"
                  class="mr-3"
                />
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import BaseText from '../atoms/BaseText.vue';

interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
}

interface NavigationProps {
  items: NavigationItem[];
  activeRoute?: string;
  variant?: 'default' | 'horror' | 'blood';
  sticky?: boolean;
}

interface NavigationEmits {
  navigate: [item: NavigationItem];
}

const props = withDefaults(defineProps<NavigationProps>(), {
  variant: 'default',
  sticky: false,
});

const emit = defineEmits<NavigationEmits>();

const isMobileMenuOpen = ref(false);

const _navClasses = computed(() => {
  const baseClasses = ['nav', 'bg-night-900/90 backdrop-blur-sm border-b border-night-700'];

  // Variant classes
  const variantClasses = {
    default: '',
    horror: 'border-horror-600 shadow-glow-soft',
    blood: 'border-blood-600 shadow-glow-blood',
  };

  return [...baseClasses, variantClasses[props.variant] || variantClasses.default].filter(Boolean);
});

const _getLinkClasses = (path: string) => {
  const isActive = props.activeRoute === path;
  return [
    'nav-link',
    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
    isActive ? 'bg-blood-900 text-white' : 'text-night-300 hover:text-white hover:bg-night-800',
  ].filter(Boolean);
};

const _getMobileLinkClasses = (path: string) => {
  const isActive = props.activeRoute === path;
  return [
    'mobile-nav-link',
    'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
    isActive ? 'bg-blood-900 text-white' : 'text-night-300 hover:text-white hover:bg-night-800',
  ].filter(Boolean);
};

const _handleNavigate = (item: NavigationItem) => {
  emit('navigate', item);
};

const _handleMobileNavigate = (item: NavigationItem) => {
  emit('navigate', item);
  isMobileMenuOpen.value = false;
};

const _toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<style scoped>
.nav-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.nav-brand {
  @apply flex items-center;
}

.nav-desktop {
  @apply hidden md:flex items-center space-x-8;
}

.nav-list {
  @apply flex items-center space-x-1;
}

.nav-item {
  @apply list-none;
}

.nav-mobile-toggle {
  @apply md:hidden p-2 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors duration-200;
}

.nav-mobile {
  @apply md:hidden absolute top-full left-0 right-0 bg-night-900/95 backdrop-blur-sm border-b border-night-700;
}

.nav-mobile-list {
  @apply py-4 space-y-1;
}

.nav-mobile-item {
  @apply list-none;
}

.nav-mobile-link {
  @apply block w-full;
}

/* Mobile menu transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive layout */
@media (min-width: 768px) {
  .nav-container {
    @apply flex items-center justify-between;
  }
}
</style> 