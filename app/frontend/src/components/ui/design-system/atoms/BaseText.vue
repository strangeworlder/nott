<template>
  <component
    :is="_validatedVariant"
    :class="_textClasses"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TextProps {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'div'
    | 'section'
    | 'article'
    | 'aside'
    | 'header'
    | 'footer'
    | 'nav'
    | 'main';
  family?: 'horror' | 'sans' | 'mono';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'white' | 'night-300' | 'night-400' | 'night-500' | 'horror-500' | 'blood-500';
  glow?: boolean;
  glowIntensity?: 'soft' | 'normal' | 'strong';
}

const props = withDefaults(defineProps<TextProps>(), {
  variant: 'p',
  family: 'sans',
  size: 'base',
  weight: 'normal',
  color: 'white',
  glow: false,
  glowIntensity: 'normal',
});

// Valid HTML elements that can be rendered
const validElements = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
  'div',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'nav',
  'main',
] as const;

// Validate the variant at runtime
const _validatedVariant = computed(() => {
  if (validElements.includes(props.variant as (typeof validElements)[number])) {
    return props.variant;
  }
  return 'p';
});

const _textClasses = computed(() => {
  const baseClasses = ['leading-relaxed'];

  // Size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  // Family classes
  const familyClasses = {
    horror: 'font-horror',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  // Weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Color classes
  const colorClasses = {
    white: 'text-white',
    'night-300': 'text-night-300',
    'night-400': 'text-night-400',
    'night-500': 'text-night-500',
    'horror-500': 'text-horror-500',
    'blood-500': 'text-blood-500',
  };

  // Glow effect classes
  const glowClasses = props.glow
    ? {
        soft: 'text-glow-soft',
        normal: 'text-glow',
        strong: 'glow-text',
      }[props.glowIntensity]
    : '';

  return [
    ...baseClasses,
    familyClasses[props.family],
    sizeClasses[props.size],
    weightClasses[props.weight],
    colorClasses[props.color],
    glowClasses,
  ].filter(Boolean);
});
</script>

<style scoped>
/* Horror theme text effects */
.font-horror {
  text-shadow: 0 0 10px rgba(224, 36, 36, 0.3);
}

/* Hover effects for interactive text */
.text-night-900:hover {
  color: #1e293b;
}

.text-blood-600:hover {
  color: #dc2626;
}
</style> 