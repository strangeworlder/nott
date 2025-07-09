<template>
  <div class="form-group">
    <label
      v-if="label"
      :for="_fieldId"
      :class="_labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-blood-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <slot />
      
      <div v-if="error" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          class="h-5 w-5 text-blood-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    
    <p v-if="error" class="form-error">
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="form-hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface FormFieldProps {
  label?: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  error: null,
  hint: null,
  required: false,
});

const _fieldId = computed(() => {
  return props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
});

const _labelClasses = computed(() => {
  return ['form-label', props.error ? 'text-blood-500' : 'text-night-300'].filter(Boolean);
});
</script>

<style scoped>
.form-field {
  @apply w-full;
}
</style> 