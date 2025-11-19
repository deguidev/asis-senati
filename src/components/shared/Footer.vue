<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <!-- Firma del Desarrollador en una sola línea -->
      <div class="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span class="text-gray-600">© {{ anioActual }} SENATI - Hecho con</span>
        <Icon 
          icon="mdi:heart" 
          class="text-red-500 animate-bounce" 
          width="18" 
          height="18"
        />
        <span class="text-gray-600">por</span>
        <a 
          href="https://github.com/dedlv" 
          target="_blank"
          rel="noopener noreferrer"
          class="font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1.5"
        >
          <Icon icon="mdi:github" width="18" height="18" />
          Diego Lipa
        </a>
        <span class="text-gray-400">|</span>
        <a 
          href="https://github.com/deguidev" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          @deguidev
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const anioActual = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* Animación personalizada para el corazón */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

.animate-bounce {
  animation: heartbeat 1s ease-in-out infinite;
}
</style>
