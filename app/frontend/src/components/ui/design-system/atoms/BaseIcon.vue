<template>
  <svg
    :class="_iconClasses"
    :width="_size"
    :height="_size"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :aria-hidden="ariaHidden"
    role="img"
    v-bind="ariaLabel ? { 'aria-label': ariaLabel } : {}"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface IconProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?:
    | 'white'
    | 'night-300'
    | 'night-400'
    | 'night-500'
    | 'horror-500'
    | 'blood-500'
    | 'current';
  variant?: 'solid' | 'outline' | 'glow';
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  color: 'current',
  variant: 'solid',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  stroke: 'none',
  strokeWidth: 2,
  ariaHidden: true,
});

const _iconClasses = computed(() => {
  const baseClasses = ['inline-block'];

  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Color classes
  const colorClasses = {
    white: 'text-white',
    'night-300': 'text-night-300',
    'night-400': 'text-night-400',
    'night-500': 'text-night-500',
    'horror-500': 'text-horror-500',
    'blood-500': 'text-blood-500',
    current: 'text-current',
  };

  // Variant classes
  const variantClasses = {
    solid: '',
    outline: 'stroke-current fill-none',
    glow: 'text-glow-soft',
  };

  return [
    ...baseClasses,
    typeof props.size === 'string' ? sizeClasses[props.size] : '',
    colorClasses[props.color],
    variantClasses[props.variant],
  ].filter(Boolean);
});

// Computed size for numeric values
const _size = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }

  // Map string sizes to numeric values
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };
  return sizeMap[props.size];
});
</script> 