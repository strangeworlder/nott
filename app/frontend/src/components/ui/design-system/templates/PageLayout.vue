<template>
  <div :class="_layoutClasses">
    <!-- Header -->
    <Header
      v-if="showHeader"
      :nav-items="navItems"
      v-bind="activeRoute ? { 'active-route': activeRoute } : {}"
      :user="user || null"
      :variant="headerVariant"
      :sticky="headerSticky"
      @navigate="_handleNavigate"
      @profile="_handleProfile"
      @settings="_handleSettings"
      @logout="_handleLogout"
    >
      <template #brand>
        <slot name="header-brand" />
      </template>
      
      <template #actions>
        <slot name="header-actions" />
      </template>
      
      <template #user-menu>
        <slot name="user-menu" />
      </template>
    </Header>

    <!-- Main Content -->
    <main :class="_mainClasses">
      <div class="main-container">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <Footer
      v-if="showFooter"
      :variant="footerVariant"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Footer from '../organisms/Footer.vue';
import Header from '../organisms/Header.vue';

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

interface PageLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  navItems?: NavigationItem[];
  activeRoute?: string;
  user?: User | null;
  headerVariant?: 'default' | 'horror' | 'blood';
  headerSticky?: boolean;
  footerVariant?: 'default' | 'horror' | 'blood';
  fullHeight?: boolean;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

interface PageLayoutEmits {
  navigate: [item: NavigationItem];
  profile: [];
  settings: [];
  logout: [];
}

const props = withDefaults(defineProps<PageLayoutProps>(), {
  showHeader: true,
  showFooter: true,
  navItems: () => [],
  headerVariant: 'default',
  headerSticky: false,
  footerVariant: 'default',
  fullHeight: false,
  containerMaxWidth: 'xl',
});

const emit = defineEmits<PageLayoutEmits>();

const _layoutClasses = computed(() => {
  const baseClasses = ['min-h-screen bg-horror-gradient'];
  const heightClasses = props.fullHeight ? 'h-screen' : 'min-h-screen';

  return [...baseClasses, heightClasses].filter(Boolean);
});

const _mainClasses = computed(() => {
  const baseClasses = ['flex-1'];
  const paddingClasses = props.showHeader ? 'pt-0' : 'pt-0';

  return [...baseClasses, paddingClasses].filter(Boolean);
});

const _handleNavigate = (item: NavigationItem) => {
  emit('navigate', item);
};

const _handleProfile = () => {
  emit('profile');
};

const _handleSettings = () => {
  emit('settings');
};

const _handleLogout = () => {
  emit('logout');
};
</script>

<style scoped>
.main-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

/* Container max width variants */
.main-container.max-w-sm {
  @apply max-w-sm;
}

.main-container.max-w-md {
  @apply max-w-md;
}

.main-container.max-w-lg {
  @apply max-w-lg;
}

.main-container.max-w-xl {
  @apply max-w-xl;
}

.main-container.max-w-2xl {
  @apply max-w-2xl;
}

.main-container.max-w-full {
  @apply max-w-full;
}
</style> 