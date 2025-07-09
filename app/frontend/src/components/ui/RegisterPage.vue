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
        Join the Night
      </BaseText>
      <BaseText
        variant="p"
        size="base"
        color="night-400"
        align="center"
      >
        Create your account
      </BaseText>
    </template>
    
    <!-- Register form -->
    <form @submit.prevent="_handleFormSubmit" class="space-y-6">
      <BaseInput
        v-model="formValidation.formData.username"
        type="text"
        label="Username"
        placeholder="Choose a username"
        :error="formValidation.validationState['username']?.error || null"
        required
        full-width
        @blur="formValidation.handleFieldBlur('username')"
        @input="formValidation.handleFieldInput('username')"
      />
      
      <BaseInput
        v-model="formValidation.formData.email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        :error="formValidation.validationState['email']?.error || null"
        required
        full-width
        @blur="formValidation.handleFieldBlur('email')"
        @input="formValidation.handleFieldInput('email')"
      />
      
      <BaseInput
        v-model="formValidation.formData.password"
        type="password"
        label="Password"
        placeholder="Create a password"
        :error="formValidation.validationState['password']?.error || null"
        required
        full-width
        @blur="formValidation.handleFieldBlur('password')"
        @input="formValidation.handleFieldInput('password')"
      />
      
      <BaseInput
        v-model="formValidation.formData.confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        :error="formValidation.validationState['confirmPassword']?.error || null"
        required
        full-width
        @blur="formValidation.handleFieldBlur('confirmPassword')"
        @input="formValidation.handleFieldInput('confirmPassword')"
      />
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          v-model="formValidation.formData.agreeToTerms" 
          class="mr-2 rounded border-night-600 bg-night-800 text-blood-500 focus:ring-blood-500" 
          required 
        />
        <BaseText variant="p" size="sm" color="night-400">
          I agree to the 
          <a href="#" class="text-blood-400 hover:text-blood-300 transition-colors">Terms of Service</a>
          and 
          <a href="#" class="text-blood-400 hover:text-blood-300 transition-colors">Privacy Policy</a>
        </BaseText>
      </div>
      
      <BaseButton
        type="submit"
        variant="blood"
        size="lg"
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading || !formValidation.isFormValid"
        full-width
      >
        {{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}
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
    
    <!-- Sign in link -->
    <div class="mt-8 text-center">
      <BaseText variant="p" size="base" color="night-400" align="center">
        Already have an account?
        <router-link 
          to="/login" 
          class="text-blood-400 hover:text-blood-300 font-medium transition-colors"
        >
          Sign in
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

// Use the form validation composable
const formValidation = useFormValidation(
  {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  },
  {
    username: VALIDATION_RULES.username,
    email: VALIDATION_RULES.email,
    password: VALIDATION_RULES.password,
    confirmPassword: VALIDATION_RULES.confirmPassword,
  }
);

// Override the submit handler to handle registration
const _handleFormSubmit = async () => {
  if (!formValidation.isFormValid.value) {
    return;
  }

  isLoading.value = true;

  try {
    // TODO: Implement actual registration API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful registration
    await authStore.register({
      username: formValidation.formData.username,
      email: formValidation.formData.email,
      password: formValidation.formData.password,
    });

    // Redirect to lobby after successful registration
    router.push('/lobby');
  } catch (error) {
    console.error('Registration failed:', error);
    // TODO: Handle registration errors
  } finally {
    isLoading.value = false;
  }
};

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