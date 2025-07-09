<template>
  <AuthLayout>
    <template #title>
      <BaseText
        variant="h1"
        size="4xl"
        color="blood-500"
        family="horror"
        align="center"
        class="mb-2"
      >
        Enter the Night
      </BaseText>
      <BaseText
        variant="p"
        size="base"
        color="night-300"
        align="center"
      >
        Sign in to your account
      </BaseText>
    </template>
    
    <!-- Login form -->
    <form @submit.prevent="_handleSubmit" class="space-y-6">
      <BaseInput
        v-model="formValidation.formData.email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        required
        :error="formValidation.validationState['email']?.error || authStore.error"
      />
      
      <BaseInput
        v-model="formValidation.formData.password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
        :error="formValidation.validationState['password']?.error || null"
      />
      
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="formValidation.formData.rememberMe" 
            class="mr-2 rounded border-night-600 bg-night-800 text-blood-500 focus:ring-blood-500" 
          />
          <BaseText variant="p" size="sm" color="night-300">
            Remember me
          </BaseText>
        </label>
        <BaseText
          variant="p"
          size="sm"
          color="blood-500"
          class="cursor-pointer hover:text-blood-300 transition-colors"
        >
          Forgot password?
        </BaseText>
      </div>
      
      <BaseButton
        type="submit"
        variant="blood"
        size="lg"
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading"
        full-width
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </BaseButton>
    </form>
    
    <!-- Error message -->
    <div 
      v-if="authStore.error" 
      class="mt-4 p-3 bg-blood-900/50 border border-blood-500 rounded-lg"
    >
      <BaseText variant="p" size="sm" color="blood-500">
        {{ authStore.error }}
      </BaseText>
    </div>
    
    <!-- Sign up link -->
    <div class="mt-8 text-center">
      <BaseText variant="p" size="base" color="night-400" align="center">
        Don't have an account?
        <router-link 
          to="/register" 
          class="text-blood-400 hover:text-blood-300 font-medium transition-colors"
        >
          Sign up
        </router-link>
      </BaseText>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/components/layout/AuthLayout.vue';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseInput from '@/components/ui/design-system/atoms/BaseInput.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { VALIDATION_RULES, useFormValidation } from '@/composables/useFormValidation';
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Form validation
const formValidation = useFormValidation(
  {
    email: '',
    password: '',
    rememberMe: false,
  },
  {
    email: VALIDATION_RULES.email,
    password: VALIDATION_RULES.loginPassword,
  }
);

const _handleSubmit = formValidation.handleSubmit(async () => {
  try {
    await authStore.login({
      email: formValidation.formData.email,
      password: formValidation.formData.password,
    });

    // Redirect to lobby after successful login
    router.push('/lobby');
  } catch (error) {
    console.error('Login failed:', error);
    // Error is handled by the auth store
  }
});

// Clear any previous errors when component mounts
onMounted(() => {
  authStore.clearError();
});
</script>

<style scoped>
/* Glow effect for the title */
.font-horror {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 15px #ef4444;
  }
  to {
    text-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444;
  }
}
</style> 