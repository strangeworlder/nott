<template>
  <div id="app" class="min-h-screen bg-night-950 text-white">
    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// App-level setup if needed
</script>

<style>
#app {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Global styles for router transitions */
.router-view-enter-active,
.router-view-leave-active {
  transition: opacity 0.3s ease;
}

.router-view-enter-from,
.router-view-leave-to {
  opacity: 0;
}

/* Horror theme global enhancements */
body {
  background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style> 