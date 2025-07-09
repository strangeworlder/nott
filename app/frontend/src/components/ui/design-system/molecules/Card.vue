<template>
  <div :class="_cardClasses">
    <div v-if="$slots['header']" class="card-header">
      <slot name="header" />
    </div>
    
    <div class="card-content">
      <slot />
    </div>
    
    <div v-if="$slots['footer']" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface CardProps {
  variant?: 'default' | 'horror' | 'blood';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  hover?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  glow: false,
  hover: false,
});

const _cardClasses = computed(() => {
  const baseClasses = ['rounded-lg transition-all duration-200'];

  if (props.variant === 'horror') {
    baseClasses.push('bg-night-800 border border-night-600 hover:border-night-500');
  } else if (props.variant === 'blood') {
    baseClasses.push('bg-blood-900/50 border border-blood-500 hover:border-blood-400');
  } else {
    baseClasses.push('bg-night-700 border border-night-600 hover:border-night-500');
  }

  if (props.glow) {
    baseClasses.push('shadow-glow-soft');
  }

  if (props.hover) {
    baseClasses.push('cursor-pointer hover:scale-105 hover:shadow-lg');
  }

  return baseClasses.join(' ');
});
</script>

<style scoped>
.card-header {
  @apply border-b border-night-700 pb-4 mb-4;
}

.card-content {
  @apply space-y-4;
}

.card-footer {
  @apply border-t border-night-700 pt-4 mt-4;
}
</style> 