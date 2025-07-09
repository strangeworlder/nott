<template>
  <div class="min-h-screen flex flex-col bg-night-900 text-night-50">
    <!-- Navigation Header -->
    <AppNavigation />
    
    <!-- Game Content -->
    <div class="flex flex-1 w-full max-w-7xl mx-auto">
      <aside class="hidden md:block w-64 bg-night-950 border-r border-night-800 p-4">
        <slot name="sidebar" />
      </aside>
      <main class="flex-1 p-4">
        <slot />
      </main>
      <aside class="hidden lg:block w-80 bg-night-950 border-l border-night-800 p-4">
        <slot name="chat" />
      </aside>
    </div>
    <footer class="px-4 py-4 border-t border-night-700 text-center text-xs text-night-400">
      <BaseText tag="span">&copy; {{ new Date().getFullYear() }} NotT</BaseText>
    </footer>
  </div>
</template>

<script setup lang="ts">
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import AppNavigation from '@/components/ui/design-system/organisms/AppNavigation.vue';
</script> 