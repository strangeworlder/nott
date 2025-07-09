<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="_buttonClasses"
    @click="_handleClick"
    @keydown.enter="_handleClick"
    @keydown.space="_handleClick"
  >
    <span v-if="loading" class="loading-spinner mr-2" />
    <span :class="{ 'opacity-50': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import type { ButtonHTMLAttributes } from "vue"; // TODO: Use for button attributes

interface ButtonProps {
  variant?: 'horror' | 'blood' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

interface ButtonEmits {
  click: [event: MouseEvent | KeyboardEvent];
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'horror',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  fullWidth: false,
});

const emit = defineEmits<ButtonEmits>();

const _buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-950',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Variant classes
  const variantClasses = {
    horror: 'bg-horror-600 hover:bg-horror-700 text-white focus:ring-horror-500 hover:scale-105',
    blood: 'bg-blood-600 hover:bg-blood-700 text-white focus:ring-blood-500 hover:scale-105',
    ghost:
      'bg-transparent hover:bg-night-700 text-night-300 hover:text-white border border-night-600 hover:border-night-500',
  };

  // Width classes
  const widthClasses = props.fullWidth ? 'w-full' : '';

  // State classes
  const stateClasses = [];
  if (props.disabled) {
    stateClasses.push('opacity-50 cursor-not-allowed');
  }
  if (props.loading) {
    stateClasses.push('cursor-wait');
  }

  return [
    ...baseClasses,
    sizeClasses[props.size] || sizeClasses.md,
    variantClasses[props.variant] || variantClasses.horror,
    widthClasses,
    ...stateClasses,
  ].filter(Boolean);
});

const _handleClick = (event: MouseEvent | KeyboardEvent) => {
  if (props.disabled || props.loading) {
    return;
  }
  emit('click', event);
};
</script>

<style scoped>
.loading-spinner {
  @apply animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full;
}
</style> 