<template>
  <AppLayout>
    <!-- Background effects -->
    <div class="absolute inset-0 bg-gradient-to-b from-night-900 to-night-950"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]"></div>
    
    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      <!-- Title -->
      <div class="text-center mb-12">
        <h1 class="horror-text text-8xl text-blood-500 glow-text mb-4">
          Night of the Thirteenth
        </h1>
        <p class="text-night-300 text-xl max-w-2xl mx-auto">
          A multiplayer horror survival tabletop game where one Director manages the game state 
          and four Players attempt to survive until dawn.
        </p>
      </div>
      
      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row gap-6 mb-12">
        <button 
          @click="_handleLogin"
          class="px-8 py-4 bg-blood-600 hover:bg-blood-700 text-white font-semibold rounded-lg 
                 transition-all duration-300 transform hover:scale-105 blood-border"
        >
          Enter the Night
        </button>
        <button 
          @click="_handleRegister"
          class="px-8 py-4 bg-night-700 hover:bg-night-600 text-white font-semibold rounded-lg 
                 transition-all duration-300 transform hover:scale-105 border border-night-500"
        >
          Create Account
        </button>
      </div>
      
      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div class="text-center p-6 bg-night-800/50 backdrop-blur-sm rounded-lg border border-night-700">
          <div class="text-blood-500 text-4xl mb-4">🎲</div>
          <h3 class="text-xl font-semibold mb-2">Interactive Dice</h3>
          <p class="text-night-300">Roll the d13 with physics-based 3D dice and experience the horror.</p>
        </div>
        <div class="text-center p-6 bg-night-800/50 backdrop-blur-sm rounded-lg border border-night-700">
          <div class="text-blood-500 text-4xl mb-4">🎭</div>
          <h3 class="text-xl font-semibold mb-2">Real-time Voice</h3>
          <p class="text-night-300">WebRTC P2P voice communication for immersive horror atmosphere.</p>
        </div>
        <div class="text-center p-6 bg-night-800/50 backdrop-blur-sm rounded-lg border border-night-700">
          <div class="text-blood-500 text-4xl mb-4">👻</div>
          <h3 class="text-xl font-semibold mb-2">Horror Atmosphere</h3>
          <p class="text-night-300">Atmospheric lighting and effects to enhance the horror experience.</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="mt-16 text-center text-night-400">
        <p class="text-sm">
          Good luck. Most of you won't make it.
        </p>
      </div>
    </div>
    
    <!-- Floating particles -->
    <div class="absolute inset-0 pointer-events-none">
      <div v-for="i in 20" :key="i" 
           class="absolute w-1 h-1 bg-blood-500/30 rounded-full animate-float"
           :style="{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 6}s`,
             animationDuration: `${6 + Math.random() * 4}s`
           }">
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const _handleLogin = () => {
  router.push('/login');
};

const _handleRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style> 