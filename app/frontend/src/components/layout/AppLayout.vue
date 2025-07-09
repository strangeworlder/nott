<template>
  <div class="min-h-screen flex flex-col bg-night-900 text-night-50">
    <!-- Navigation Header -->
    <AppNavigation />
    
    <!-- Main Content -->
    <main class="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
      <slot />
    </main>
    
    <footer class="px-4 py-4 border-t border-night-700 text-center text-xs text-night-400">
      <BaseText tag="span">&copy; {{ new Date().getFullYear() }} NotT. All rights reserved.</BaseText>
    </footer>
  </div>
</template>

<script setup lang="ts">
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import AppNavigation from '@/components/ui/design-system/organisms/AppNavigation.vue';
</script> 