<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        @click="_handleBackdropClick"
      >
        <div
          :class="_modalClasses"
          @click.stop
        >
          <div class="modal-header">
            <h3 v-if="title" class="modal-title">
              {{ title }}
            </h3>
            <button
              v-if="showClose"
              type="button"
              class="modal-close"
              @click="_handleClose"
              aria-label="Close modal"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div class="modal-content">
            <slot />
          </div>
          
          <div v-if="$slots['footer']" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  variant?: 'default' | 'horror' | 'blood';
}

interface ModalEmits {
  close: [];
  backdropClick: [];
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'md',
  showClose: true,
  closeOnBackdrop: true,
  variant: 'default',
});

const emit = defineEmits<ModalEmits>();

const _modalClasses = computed(() => {
  const baseClasses = [
    'modal-content',
    'bg-night-800',
    'border',
    'border-night-700',
    'rounded-lg',
    'shadow-xl',
    'backdrop-blur-sm',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Variant classes
  const variantClasses = {
    default: '',
    horror: 'border-horror-600 shadow-glow-soft',
    blood: 'border-blood-600 shadow-glow-blood',
  };

  return [
    ...baseClasses,
    sizeClasses[props.size] || sizeClasses.md,
    variantClasses[props.variant] || variantClasses.default,
  ].filter(Boolean);
});

const _handleClose = () => {
  emit('close');
};

const _handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('backdropClick');
    emit('close');
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-10px);
}

.modal-header {
  @apply flex items-center justify-between pb-4 mb-4 border-b border-night-700;
}

.modal-title {
  @apply text-xl font-semibold text-white;
}

.modal-close {
  @apply p-1 rounded-lg text-night-400 hover:text-white hover:bg-night-700 transition-colors duration-200;
}

.modal-content {
  @apply space-y-4;
}

.modal-footer {
  @apply flex justify-end space-x-3 pt-4 mt-4 border-t border-night-700;
}
</style> 