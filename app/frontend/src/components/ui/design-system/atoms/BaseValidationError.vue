<template>
  <div
    v-if="error"
    class="validation-error"
    role="alert"
    aria-live="polite"
  >
    <BaseText
      variant="p"
      size="sm"
      color="blood-500"
      class="flex items-center"
    >
      <BaseIcon
        name="alert-circle"
        size="sm"
        class="mr-2 flex-shrink-0"
      />
      {{ error }}
    </BaseText>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';
import BaseText from './BaseText.vue';

interface ValidationErrorProps {
  error?: string | null;
}

defineProps<ValidationErrorProps>();
</script>

<style scoped>
.validation-error {
  @apply mt-1;
}

.validation-error .flex {
  @apply items-start;
}
</style> 