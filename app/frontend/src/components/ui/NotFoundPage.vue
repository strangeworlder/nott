<template>
  <AppLayout>
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <BaseText
        variant="h1"
        size="6xl"
        color="blood-500"
        family="horror"
        class="mb-4"
      >
        404
      </BaseText>
      
      <BaseText
        variant="h2"
        size="2xl"
        color="white"
        class="mb-4"
      >
        Page Not Found
      </BaseText>
      
      <BaseText
        variant="p"
        size="lg"
        color="night-300"
        class="mb-8 max-w-md"
      >
        The page you are looking for doesn't exist or has been moved to the shadows.
      </BaseText>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <BaseButton
          @click="_goHome"
          variant="blood"
          size="lg"
        >
          Return Home
        </BaseButton>
        
        <BaseButton
          @click="_goBack"
          variant="ghost"
          size="lg"
        >
          Go Back
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const _goHome = () => {
  router.push('/');
};

const _goBack = () => {
  router.back();
};
</script> 