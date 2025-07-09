<template>
  <div class="input-wrapper">
    <!-- Label -->
    <label
      v-if="label"
      :for="id || ''"
      class="block text-sm font-medium text-night-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-blood-500 ml-1">*</span>
    </label>

    <!-- Input container -->
    <div class="relative">
      <input
        v-bind="{
          id: id || '',
          type,
          value: modelValue,
          placeholder: placeholder || '',
          disabled,
          required,
          class: _inputClasses,
        }"
        @input="_handleInput"
        @blur="_handleBlur"
        @focus="_handleFocus"
        @keydown.enter="_handleEnter"
      />
      
      <!-- Error icon -->
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

    <!-- Error message -->
    <div v-if="error" class="mt-1">
      <BaseText
        variant="p"
        size="sm"
        color="blood-500"
        class="flex items-center"
      >
        <svg
          class="h-4 w-4 mr-1 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {{ error }}
      </BaseText>
    </div>

    <!-- Hint text -->
    <div v-if="hint && !error" class="mt-1">
      <BaseText
        variant="p"
        size="sm"
        color="night-400"
      >
        {{ hint }}
      </BaseText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface InputProps {
  modelValue: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string | null;
  label?: string;
  hint?: string;
  variant?: 'horror' | 'blood';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  id?: string;
}

interface InputEmits {
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  enter: [event: KeyboardEvent];
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  variant: 'horror',
  size: 'md',
  disabled: false,
  required: false,
  error: null,
});

const emit = defineEmits<InputEmits>();

const _inputClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-lg border bg-night-800 text-white placeholder-night-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    horror: 'border-night-600 focus:ring-horror-500 focus:border-horror-500',
    blood: 'border-blood-600 focus:ring-blood-500 focus:border-blood-500',
  };

  // Error state
  const errorClasses = props.error
    ? 'border-blood-500 focus:ring-blood-500 focus:border-blood-500'
    : '';

  // Disabled state
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed bg-night-900' : '';

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    errorClasses,
    disabledClasses,
  ].filter(Boolean);
});

const _handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const _handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const _handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const _handleEnter = (event: KeyboardEvent) => {
  emit('enter', event);
};
</script>

<style scoped>
/* Horror theme enhancements */
input:not(:disabled):focus {
  box-shadow: 0 0 0 3px rgba(224, 36, 36, 0.1);
}

/* Error state glow effect */
input.border-blood-300:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Placeholder styling */
input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

/* Autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  -webkit-text-fill-color: #1e293b;
}
</style> 