<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-night-950 px-4 py-8">
    <div class="w-full max-w-md bg-night-900 rounded-lg shadow-lg p-8 flex flex-col gap-6 border border-night-800">
      <BaseText tag="h2" class="text-2xl font-horror text-center mb-2">
        <slot name="title">Sign In</slot>
      </BaseText>
      <slot />
    </div>
    <footer class="mt-8 text-xs text-night-500 text-center">
      <BaseText tag="span">&copy; {{ new Date().getFullYear() }} NotT</BaseText>
    </footer>
  </div>
</template>

<script setup lang="ts">
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
</script> 